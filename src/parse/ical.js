/**
 * Created by mdeluco on 2014-07-16.
 *
 * iCal / RFC 5545 recurrence rule support
 * http://tools.ietf.org/html/rfc5545#section-3.3.10
 *
 */

later.parse.ical = function (expr) {

    var recur = later.parse.recur;

    var freq = {
        SECONDLY: 'second',
        MINUTELY: 'minute',
        HOURLY: 'hour',
        DAILY: 'dayOfMonth',
        WEEKLY: 'weekOfMonth',
        MONTHLY: 'month',
        YEARLY: 'year'
    };

    var instances = {
        BYSECOND: 'second',
        BYMINUTE: 'minute',
        BYHOUR: 'hour',
        BYDAY: 'dayOfWeek',
        BYMONTHDAY: 'dayOfMonth',
        BYYEARDAY: 'dayOfYear',
        BYWEEKNO: 'weekOfYear',
        BYMONTH: 'month'
        //BYSETPOS: ''
    };

    var weekday = {
        SU: 1, MO: 2, TU: 3, WE: 4, TH: 5, FR: 6, SA: 7
    };

    function getMatches(string, regex) {
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match);
        }
        return matches;
    }

    function validateRRule(ruleParts) {
        if (!ruleParts) return false;

        var freq = ruleParts['FREQ'];

        if (!freq) {
            return false;
        }

        if (ruleParts['UNTIL'] && ruleParts['COUNT']) {
            return false;
        }

        if (ruleParts['BYDAY']) {
            var byDayN = false;
            for (var rule in ruleParts['BYDAY']) {
                if (!ruleParts['BYDAY'].hasOwnProperty(rule)) continue;
                if (ruleParts['BYDAY'][rule][0] !== 0) {
                    byDayN = true;
                    break;
                }
            }

            if ((freq !== 'MONTHLY' || freq !== 'YEARLY') && byDayN) {
                return false;
            }

            if (ruleParts['BYWEEKNO'] && freq === 'YEARLY' && byDayN) {
                return false;
            }
        }

        if (ruleParts['BYMONTHDAY'] && freq === 'WEEKLY') {
            return false;
        }

        if (ruleParts['BYYEARDAY'] &&
                ['DAILY', 'WEEKLY', 'MONTHLY'].indexOf(freq) > -1) {
            return false;
        }

        if (ruleParts['BYWEEKNO'] && freq !== 'YEARLY') {
            return false;
        }

        return true;
    }

    // TODO
    function parseDateTime(expr) {
        return new Date();
    }

    function parseExpr(expr) {

        var r = recur(),
            rule = expr.split(':')[1],
            parts = rule.split(';'),
            rules = {};

        for (var part in parts) {
            if (!parts.hasOwnProperty(part)) continue;

            var keyAndValue = parts[part].split('=');
            var key = keyAndValue[0];
            var value = keyAndValue[1];

            switch (key) {
                case 'FREQ':
                    rules[key] = value;
                    break;
                case 'UNTIL':
                    // TODO parse date
                    rules[key] = parseDateTime(value);
                    break;
                case 'COUNT':
                case 'INTERVAL':
                case 'WKST':
                    rules[key] = parseInt(value, 10);
                    break;
                case 'BYDAY':
                    var days = getMatches(value, /([+-]?\d)?(\w\w),?/g);
                    rules[key] = [];
                    for (var day in days) {
                        if (!days.hasOwnProperty(day)) continue;
                        rules[key].push([
                            parseInt(days[day][1], 10) || 0,
                            weekday[days[day][2]]
                        ]);
                    }
                    break;
                default:
                    // everything else is a list of numbers
                    rules[key] = value.split(',').map(Number);
                    break;
            }

        }

        if (!validateRRule(rules)) {
            return recur();
        }

        r.every(rules['INTERVAL'] || 1)[freq[rules['FREQ']]]();

        //byBLAH stuff is all about 'on'
        for (var instance in instances) {
            if (!instances.hasOwnProperty(instance)) continue;
            if (!rules[instance]) continue;
            r.on.apply(r, rules[instance])[instances[instance]]();
        }

        return r;

    }

    return parseExpr(expr);
};