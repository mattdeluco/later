/**
 * Created by mdeluco on 2014-07-16.
 *
 * iCal / RFC 5545 recurrence rule support
 * http://tools.ietf.org/html/rfc5545#section-3.3.10
 *
 */

later.parse.ical = function (expr) {

    var recur = later.parse.recur;

    var frequency = {
        SECONDLY: 'second',
        MINUTELY: 'minute',
        HOURLY: 'hour',
        DAILY: 'dayOfMonth',
        WEEKLY: 'weekOfMonth',
        MONTHLY: 'month',
        YEARLY: 'year'
    };

    var constraints = {
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
            for (var i = 0; i < ruleParts['BYDAY'].length; i++) {
                if (ruleParts['BYDAY'][i][0] !== 0 &&
                        ((freq !== 'MONTHLY' && freq !== 'YEARLY') ||
                        (ruleParts['BYWEEKNO'] && freq === 'YEARLY'))) {
                    return false;
                }
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

    function parseRRule(expr) {

        var rule = expr.split(':')[1],
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
                    for (var i = 0; i < days.length; i++) {
                        rules[key].push([
                            parseInt(days[i][1], 10) || 0,
                            weekday[days[i][2]]
                        ]);
                    }
                    break;
                default:
                    // everything else is a list of numbers
                    rules[key] = value.split(',').map(Number);
                    break;
            }

        }

        return rules;

    }

    function buildRecurrence(rules) {
        var r = recur(),
            freq = rules['FREQ'],
            error = '';

        r.every(rules['INTERVAL'] || 1)[frequency[freq]]();

        for (var rule in rules) {
            if (!rules.hasOwnProperty(rule)) continue;

            switch (rule) {
                // TODO case 'BYSETPOS':
                case 'BYSECOND':
                case 'BYMINUTE':
                case 'BYHOUR':
                case 'BYMONTHDAY':
                    // TODO negative modifier
                case 'BYYEARDAY':
                    // TODO negative modifier
                case 'BYWEEKNO':
                    // TODO negative modifier
                case 'BYMONTH':
                    r.on.apply(r, rules[rule])[constraints[rule]]();
                    break;
                case 'BYDAY':
                    // TODO negative modifier
                    for (var i = 0; i < rules[rule].length; i++) {
                        var count = rules[rule][i][0],
                            dow = rules[rule][i][1];

                        if (count) r.on(count).dayOfWeekCount();
                        r.on(dow).dayOfWeek();
                    }
                    break;
                case 'COUNT':
                case 'UNTIL':
                    // TODO create exception with after modifier per suggestion
                    // https://github.com/bunkat/later/issues/59
                default:
                    break;
            }
        }

        return {schedules: r.schedules, exceptions: r.exceptions, error: error};
    }

    var parsedRRule = parseRRule(expr);

    if (!validateRRule(parsedRRule)) {
        return {schedules: [], exceptions: [], error: 'Invalid RRULE'};
    }

    return buildRecurrence(parsedRRule);
};