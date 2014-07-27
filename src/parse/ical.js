/**
 * Created by mdeluco on 2014-07-16.
 *
 * iCal / RFC 5545 recurrence rule support
 * http://tools.ietf.org/html/rfc5545#section-3.3.10
 *
 */
'use strict';


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

        if (ruleParts['BYDAY']) {
            var byDayN = ruleParts['BYDAY'][0];

            if ((freq !== 'MONTHLY' || freq !== 'YEARLY') && byDayN != 0) {
                return false;
            }

            if (ruleParts['BYWEEKNO'] && freq === 'YEARLY' && byDayN != 0) {
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

    }

    function parseExpr(expr) {

        var r = recur(),
            rule = expr.split(':')[1],
            parts = rule.split(';'),
            rules = {};

        for (var part in parts) {
            if (!parts.hasOwnProperty(part)) continue;

            var keysAndValues = parts[part].split('=');
            var key = keysAndValues[0];

            switch (key) {
                case 'FREQ':
                case 'UNTIL':
                case 'COUNT':
                case 'INTERVAL':
                case 'WKST':
                    rules[key] = parseInt(keysAndValues[1], 10);
                    break;
                case 'BYDAY':
                    // TODO convert day abbreviations to numbers
                    var days = getMatches(keysAndValues[1], /([+-]?\d)?(\w\w),?/g);
                    rules[key] = [];
                    for (var day in days) {
                        if (!days.hasOwnProperty(day)) continue;
                        if (day.length < 3) {
                            rules[key].push([0, weekday[day[2]]]);
                        } else {
                            rules[key].push([parseInt(day[1], 10), weekday[day[2]]]);
                        }
                    }
                    break;
                default:
                    // everything else is a list of numbers
                    rules[key] = keysAndValues[1].split(',').map(Number);
                    break;
            }

        }

        if (!validateRRule(rules)) {
            return recur();
        }

        rules['INTERVAL'] || (rules['INTERVAL'] = 1);
        r.every(rules['INTERVAL'])[freq[rules['FREQ']]]();

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