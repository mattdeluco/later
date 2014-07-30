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

        it('should not have a numeric BYDAY value if FREQ is neither MONTHLY nor YEARLY', function () {
            var p = parse('RRULE:FREQ=SECONDLY;BYDAY=-1SU,2TH');
            p.schedules.length.should.equal(0);

            p = parse('RRULE:FREQ=MONTHLY;BYDAY=1SU,2TH');
            p.schedules.length.should.equal(1);

            p = parse('RRULE:FREQ=YEARLY;BYDAY=1SU,2TH');
            p.schedules.length.should.equal(1);
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

    describe('Frequency (every)', function () {

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

    describe('Interval (on)', function () {
        // BYSECOND, BYMINUTE, BYHOUR, BYDAY, BYMONTHDAY, BYYEARDAY,
        // BYWEEKNO, BYMONTH

        it('should occur every minute on seconds 31 and 32', function () {
            var p = parse('RRULE:FREQ=MINUTELY;BYSECOND=31,32');
            p.schedules[0].should.have.property('s', [31, 32]);
        });

        it('should occur every 30 seconds on minutes 0 and 30', function () {
            var p = parse('RRULE:FREQ=SECONDLY;INTERVAL=30;BYMINUTE=7,13');
            p.schedules[0].should.have.property('s', [0, 30]);
            p.schedules[0].should.have.property('m', [7, 13]);
        });

        it('should occur daily on hours 2, 4, 6, and 8', function () {
            var p = parse('RRULE:FREQ=DAILY;BYHOUR=2,4,6,8');
            p.schedules[0].should.have.property('h', [2, 4, 6, 8]);
        });

        it('should occur every Wednesday', function () {
            var p = parse('RRULE:FREQ=WEEKLY;BYDAY=WE');
            p.schedules[0].should.have.property('d', [4]);
            p.schedules[0].should.have.property('wm', [1, 2, 3, 4, 5]);
        });

        it('should occur every Wednesday, Thursday, and Sunday', function () {
            var p = parse('RRULE:FREQ=WEEKLY;BYDAY=WE,TH,SU');
            p.schedules[0].should.have.property('d', [4, 5, 1]);
            p.schedules[0].should.have.property('wm', [1, 2, 3, 4, 5]);
        });

        it('should occur every 4th month on the 1st, 10th, and 31st', function () {
            var p = parse('RRULE:FREQ=MONTHLY;INTERVAL=4;BYMONTHDAY=1,10,31');
            p.schedules[0].should.have.property('D', [1, 10, 31]);
            p.schedules[0].should.have.property('M', [1, 5, 9]);
        });

        it('should occur on the 1st, 101st, and 365th day of the year', function () {
            var p = parse('RRULE:FREQ=YEARLY;BYYEARDAY=1,101,365');
            p.schedules[0].should.have.property('dy', [1, 101, 365]);
        });

        it('should occur on the 3rd and 47th week', function () {
            var p = parse('RRULE:FREQ=YEARLY;BYWEEKNO=3,47');
            p.schedules[0].should.have.property('wy', [3, 47]);
        });

        it('should occur on months 1, 2, and 3', function () {
            var p = parse('RRULE:FREQ=YEARLY;BYMONTH=1,2,3');
            p.schedules[0].should.have.property('M', [1, 2, 3]);
        });

    });

    describe('COUNT and UNTIL', function () {

        it('should create an after exception for the given date', function () {
            var p = parse('RRULE:FREQ=DAILY;INTERVAL=2;UNTIL=20201031T000000Z');
            p.exceptions.should.have.length(1);
            p.exceptions[0].should.containEql({'fd_a': [1604102400000]});
        });

        // See note in ical.js where COUNT exception is commented out
        it.skip('should create an after exception for the given count', function () {
            var now = new Date();
            var tonight = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate())).getTime();
            var p = parse('RRULE:FREQ=DAILY;BYHOUR=0;BYMINUTE=0;BYSECOND=0;COUNT=1');
            p.exceptions.should.have.length(1);
            p.exceptions[0].should.containEql({'fd_a': [tonight]});
        });

    });

});