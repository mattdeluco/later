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

        if (ruleParts['BYSETPOS'] && constraints.keys.indexOf(ruleParts.keys) === -1) {
            return false;
        }

        return true;
    }


    function parseDateTime(expr) {
        var r = /(\d{4})(\d\d)(\d\d)(T(\d\d)(\d\d)(\d\d)(Z)?)?/;
        var m = r.exec(expr);

        /*
        // TODO Figure out TZ support
        if (m[8]) {
            later.date.UTC();
        } else {
            later.date.localTime();
        }
        */

        if (m[4]) {
            return later.date.build(m[1], m[2]-1, m[3], m[5], m[6], m[7]);
        }

        return later.date.build(m[1], m[2]-1, m[3], 0, 0, 0);
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
            schedule = {schedules: [], exceptions: [], error: ''};

        r.every(rules['INTERVAL'] || 1)[frequency[freq]]();

        for (var rule in rules) {
            if (!rules.hasOwnProperty(rule)) continue;

            // TODO RFC 5545 specifies order to evaluate BYX rules
            // Not sure if order matters when using parse.recur.
            switch (rule) {
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
                case 'BYSETPOS':
                    // TODO
                    break;
                case 'COUNT':
                    schedule['count'] = rules[rule];
                    break;
                case 'UNTIL':
                    schedule['endDate'] = rules[rule];
                    break;
                default:
                    break;
            }
        }

        schedule.schedules = r.schedules;
        schedule.exceptions = r.exceptions;

        return schedule;
    }

    var parsedRRule = parseRRule(expr);

    if (!validateRRule(parsedRRule)) {
        return {schedules: [], exceptions: [], error: 'Invalid RRULE'};
    }

    return buildRecurrence(parsedRRule);
};