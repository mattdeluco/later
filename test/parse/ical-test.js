/**
 * Created by mdeluco on 2014-07-16.
 */
'use strict';

var parse = require('../../index').parse.ical;
var should = require('should');

describe('Parse iCal', function () {

    describe('Frequency (on)', function () {

        it('should occur every 15 seconds', function () {
            var p = parse('RRULE:FREQ=SECONDLY;INTERVAL=15');
            p.schedules[0].should.have.property('s', [0, 15, 30, 45]);
        });

        it('should occur every 15 minutes', function () {
            var p = parse('RRULE:FREQ=MINUTELY;INTERVAL=15');
            p.schedules[0].should.have.property('m', [0, 15, 30, 45]);
        });

        it('should occur every 6 hours', function () {
            var p = parse('RRULE:FREQ=HOURLY;INTERVAL=6');
            p.schedules[0].should.have.property('h', [0, 6, 12, 18]);
        });

        it('should occur every day', function () {
            var p = parse('RRULE:FREQ=DAILY;INTERVAL=11');
            p.schedules[0].should.have.property('D', [1, 12, 23]);
        });

        it('should occur every week', function () {
            var p = parse('RRULE:FREQ=WEEKLY;INTERVAL=2');
            p.schedules[0].should.have.property('wm', [1, 3, 5]);
        });

        it('should occur every month', function () {
            var p = parse('RRULE:FREQ=MONTHLY;INTERVAL=3');
            p.schedules[0].should.have.property('M', [1, 4, 7, 10]);
        });

        it('should occur every year', function () {
            var p = parse('RRULE:FREQ=YEARLY;INTERVAL=100');
            p.schedules[0].should.have.property('Y', [1970, 2070, 2170, 2270, 2370]);
        });

    });

    describe('Interval (every)', function () {
        // BYSECOND, BYMINUTE, BYHOUR, BYDAY, BYMONTHDAY, BYYEARDAY,
        // BYWEEKNO, BYMONTH

        it('should occur every 30 seconds on minutes 0 and 30', function () {
            var p = parse('RRULE:FREQ=SECONDLY;INTERVAL=30;BYMINUTE=7,13');
            p.schedules[0].should.have.property('s', [0, 30]);
            p.schedules[0].should.have.property('m', [7, 13]);
        });


    });

});