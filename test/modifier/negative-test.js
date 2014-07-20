/**
 * Created by Matt DeLuco on 2014-07-18.
 */

var later = require('../../index'),
    should = require('should');


describe('Modifier Negative', function () {

    describe('Basic Functionality', function () {

        it('should throw an error for invalid periods', function () {
            var periods = [
                'second', 'minute', 'hour', 'dayOfWeek', 'dayOfWeekCount',
                'fullDate', 'month', 'time', 'weekOfMonth', 'year'
            ];
            for (var period in periods) {
                if (!periods.hasOwnProperty(period)) continue;
                should(function () {
                    later.modifier.negative(later[period]);
                }).throw(Error);
            }

            // Should not throw
            should(function () {
                later.modifier.negative(later.day);
            }).not.throw(Error);
            should(function () {
                later.modifier.negative(later.dayOfYear);
            }).not.throw(Error);
            should(function () {
                later.modifier.negative(later.weekOfYear);
            }).not.throw(Error);
        });

        it('should prepend "negative" to the time period', function () {
            var negDay = later.modifier.negative(later.day);
            negDay.name.should.eql('negative day');

            var negDoY = later.modifier.negative(later.dayOfYear);
            negDoY.name.should.eql('negative day of year');

            var negWoY = later.modifier.negative(later.weekOfYear);
            negWoY.name.should.eql('negative week of year (ISO)');
        });

        it('should have the same range as the given period', function () {
            later.modifier.negative(later.day).range.should.eql(later.day.range);
            later.modifier.negative(later.dayOfYear).range.should.eql(later.dayOfYear.range);
            later.modifier.negative(later.weekOfYear).range.should.eql(later.weekOfYear.range);
        });

        it('should return the negative value of the given date', function () {
            var d = new Date('2014-12-25T00:00:00Z');
            later.modifier.negative(later.day).val(d).should.eql(-7);
            later.modifier.negative(later.dayOfYear).val(d).should.eql(-7);
            later.modifier.negative(later.weekOfYear).val(d).should.eql(-1);
        });

        it('should have the same start as the given period', function () {
            later.modifier.negative(later.day).start.should.eql(later.day.start);
            later.modifier.negative(later.dayOfYear).start.should.eql(later.dayOfYear.start);
            later.modifier.negative(later.weekOfYear).start.should.eql(later.weekOfYear.start);
        });

        it('should have the same end as the given period', function () {
            later.modifier.negative(later.day).end.should.eql(later.day.end);
            later.modifier.negative(later.dayOfYear).end.should.eql(later.dayOfYear.end);
            later.modifier.negative(later.weekOfYear).end.should.eql(later.weekOfYear.end);
        });

        it('should have a negative extent range', function () {
            var d = new Date('2014-09-04T00:00:00Z');
            var extent = later.modifier.negative(later.day).extent(d);
            extent[0].should.eql(-30);
            extent[1].should.eql(-1);
        });
    });

    describe('Negative days of the month', function () {

        describe('next', function () {

            var d = new Date('2014-01-01T00:00:00Z');

            it('should return the last day of the month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.next(d, -1).should.eql(new Date('2014-01-31T00:00:00Z'));
            });

            it('should return the second last day of the month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.next(d, -2).should.eql(new Date('2014-01-30T00:00:00Z'));
            });

            it('should return the second day of the month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.next(d, -30).should.eql(new Date('2014-01-02T00:00:00Z'));
            });

            // This is a bit of an odd one to interpret.  Since the date provided
            // to next() is already in January, the next instance of the -31st day
            // would be in the following month.
            it('should return the first day of the next month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.next(d, -31).should.eql(new Date('2014-02-01T00:00:00Z'));
            });

            // Probably an unnecessary test since we know the later library can
            // handle leap years.
            it('should work in February', function () {
                later.date.UTC();
                var commonYear = new Date('2015-02-01T00:00:00Z'),
                    leapYear = new Date('2016-02-01T00:00:00Z'),
                    neg = later.modifier.negative(later.day);

                neg.next(commonYear, -1).should.eql(new Date('2015-02-28T00:00:00Z'));
                neg.next(commonYear, -2).should.eql(new Date('2015-02-27T00:00:00Z'));
                neg.next(commonYear, -28).should.eql(new Date('2015-03-01T00:00:00Z'));
                console.log(neg.next(commonYear, -31));
                neg.next(commonYear, -31).should.eql(new Date('2015-03-01T00:00:00Z'));

                neg.next(leapYear, -1).should.eql(new Date('2016-02-29T00:00:00Z'));
                neg.next(leapYear, -2).should.eql(new Date('2016-02-28T00:00:00Z'));
                neg.next(leapYear, -29).should.eql(new Date('2016-03-01T00:00:00Z'));
                neg.next(leapYear, -31).should.eql(new Date('2016-03-01T00:00:00Z'));
            });

        });

        describe('prev', function () {

            var d = new Date('2014-01-01T00:00:00Z');

            it('should return the last day of the month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.prev(d, -1).should.eql(new Date('2013-12-31T23:59:59Z'));
            });

            it('should return the second last day of the month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.prev(d, -2).should.eql(new Date('2013-12-30T23:59:59Z'));
            });

            it('should return the second day of the month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.prev(d, -30).should.eql(new Date('2013-12-02T23:59:59Z'));
            });

            it('should return the first day of the month', function () {
                later.date.UTC();
                var neg = later.modifier.negative(later.day);
                neg.prev(d, -31).should.eql(new Date('2013-12-01T23:59:59Z'));
            });

            // Probably an unnecessary test since we know the later library can
            // handle leap years.
            it('should work in February', function () {
                later.date.UTC();
                var commonYear = new Date('2015-02-01T23:59:59Z'),
                    leapYear = new Date('2016-02-01T23:59:59Z'),
                    neg = later.modifier.negative(later.day);

                neg.prev(commonYear, -1).should.eql(new Date('2015-01-31T23:59:59Z'));
                neg.prev(commonYear, -2).should.eql(new Date('2015-01-30T23:59:59Z'));
                neg.prev(commonYear, -28).should.eql(new Date('2015-01-04T23:59:59Z'));
                neg.prev(commonYear, -31).should.eql(new Date('2015-01-01T23:59:59Z'));

                neg.prev(leapYear, -1).should.eql(new Date('2016-01-31T23:59:59Z'));
                neg.prev(leapYear, -2).should.eql(new Date('2016-01-30T23:59:59Z'));
                neg.prev(leapYear, -29).should.eql(new Date('2016-01-03T23:59:59Z'));
                neg.prev(leapYear, -31).should.eql(new Date('2016-01-01T23:59:59Z'));
            });

        });

        describe('compiled negative day schedule', function () {

            var sched = later.compile({D_n: [-1]});

            it('should start on the next last day of the month', function () {
                later.date.UTC();
                var d = new Date('2014-09-04T00:00:00Z'),
                    expected = new Date('2014-09-30T00:00:00Z'),
                    actual = sched.start('next', d);
                actual.should.eql(expected);
            });

        });

    });

});