/**
 * Created by mdeluco on 2014-07-16.
 */

var parse = require('../../index').parse.ical;
var should = require('should');

describe('Parse iCal', function () {

    describe('Invalid Rules have no schedules', function () {

        it('should have FREQ', function () {
            var p = parse('RRULE:INTERVAL=15');
            p.schedules.length.should.equal(0);
        });

        it('should not have both UNTIL and COUNT', function () {
            var p = parse('RRULE:FREQ=SECONDLY;COUNT=5;UNTIL=20201020');
            p.schedules.length.should.equal(0);
        });

        it('should not have a numeric BYDAY value if FREQ is not MONTHLY or YEARLY', function () {
            var p = parse('RRULE:FREQ=SECONDLY;BYDAY=-1SU,2TH');
            p.schedules.length.should.equal(0);
        });

        it('should not have a numeric BYDAY value if FREQ is YEARLY and BYWEEKNO is specified', function () {
            var p = parse('RRULE:FREQ=YEARLY;BYDAY=-1SU,2TH;BYWEEKNO=1,2,3');
            p.schedules.length.should.equal(0);
        });

        it('should not have BYMONTHDAY specified when FREQ is WEEKLY', function () {
            var p = parse('RRULE:FREQ=WEEKLY;BYMONTHDAY=1,2,10');
            p.schedules.length.should.equal(0);
        });

        it('should not have BYYEARDAY specified when FREQ is DAILY, WEEKLY, or MONTHLY', function () {
            var p = parse('RRULE:FREQ=WEEKLY;BYYEARDAY=1,2,10');
            p.schedules.length.should.equal(0);
        });

    });

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

    describe('BYDAY', function () {

        it('should occur every Wednesday', function () {
            var p = parse('RRULE:FREQ=WEEKLY;BYDAY=WE');
            p.schedules[0].should.have.property('d', [4]);
            p.schedules[0].should.have.property('wm', [1, 2, 3, 4, 5]);
        });

    });

});