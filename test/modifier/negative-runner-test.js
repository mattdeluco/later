/**
 * Created by Matt DeLuco on 2014-07-22.
 */

var later = require('../../index'),
    runner = require('./negative-runner')(later, later.modifier.negative(later.day)),
    should = require('should');

describe('Later.negative.day', function() {

    var tests = [
        {
            // 1 first second of year
            // Tue, 01 Jan 2008
            date: new Date(2008, 0, 1),
            val: -31,
            extent: [-31,-1],
            start: new Date(2008, 0, 1),
            end: new Date(2008, 0, 1, 23, 59, 59)
        },
        {
            // 2 last second of year
            // Thu, 31 Dec 2009
            date: new Date(2009, 11, 31, 23, 59, 59),
            val: -1,
            extent: [-31,-1],
            start: new Date(2009, 11, 31),
            end: new Date(2009, 11, 31, 23, 59, 59)
        },
        {
            // 3 first second of month starting on Sunday
            // Sun, 01 Aug 2010
            date: new Date(2010, 7, 1),
            val: -31,
            extent: [-31,-1],
            start: new Date(2010, 7, 1),
            end: new Date(2010, 7, 1, 23, 59, 59)
        },
        {
            // 4 last second of month ending on Saturday
            // Sat, 30 Apr 2011
            date: new Date(2011, 3, 30, 23, 59, 59),
            val: -1,
            extent: [-30,-1],
            start: new Date(2011, 3, 30),
            end: new Date(2011, 3, 30, 23, 59, 59)
        },
        {
            // 5 first second of day
            // Tue, 28 Feb 2012
            date: new Date(2012, 1, 28),
            val: -2,
            extent: [-29,-1],
            start: new Date(2012, 1, 28),
            end: new Date(2012, 1, 28, 23, 59, 59)
        },
        {
            // 6 last second of day on leap day
            // Wed, 29 Feb 2012
            date: new Date(2012, 1, 29, 23, 59, 59),
            val: -1,
            extent: [-29,-1],
            start: new Date(2012, 1, 29),
            end: new Date(2012, 1, 29, 23, 59, 59)
        },
        {
            // 7 first second of hour
            // Thu, 08 Nov 2012
            date: new Date(2012, 10, 8, 14),
            val: -23,
            extent: [-30,-1],
            start: new Date(2012, 10, 8),
            end: new Date(2012, 10, 8, 23, 59, 59)
        },
        {
            // 8 last second of hour (start DST)
            // Sun, 10 Mar 2013
            date: new Date(2013, 2, 10, 1, 59, 59),
            val: -22,
            extent: [-31,-1],
            start: new Date(2013, 2, 10),
            end: new Date(2013, 2, 10, 23, 59, 59)
        },
        {
            // 9 first second of hour (end DST)
            // Sun, 03 Nov 2013
            date: new Date(2013, 10, 3, 2),
            val: -28,
            extent: [-30,-1],
            start: new Date(2013, 10, 3),
            end: new Date(2013, 10, 3, 23, 59, 59)
        },
        {
            // 10 last second of hour
            // Sat, 22 Feb 2014
            date: new Date(2014, 1, 22, 6, 59, 59),
            val: -7,
            extent: [-28,-1],
            start: new Date(2014, 1, 22),
            end: new Date(2014, 1, 22, 23, 59, 59)
        },
        {
            // 11 first second of minute
            // Fri, 19 Jun 2015
            date: new Date(2015, 5, 19, 18, 22),
            val: -12,
            extent: [-30,-1],
            start: new Date(2015, 5, 19),
            end: new Date(2015, 5, 19, 23, 59, 59)
        },
        {
            // 12 last second of minute
            // Mon, 29 Aug 2016
            date: new Date(2016, 7, 29, 2, 56, 59),
            val: -3,
            extent: [-31,-1],
            start: new Date(2016, 7, 29),
            end: new Date(2016, 7, 29, 23, 59, 59)
        },
        {
            // 13 second
            // Mon, 04 Sep 2017
            date: new Date(2017, 8, 4, 10, 31, 22),
            val: -27,
            extent: [-30,-1],
            start: new Date(2017, 8, 4),
            end: new Date(2017, 8, 4, 23, 59, 59)
        }
    ];

    runner.run(tests);

});