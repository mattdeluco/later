/**
 * Negative modifier
 * Created by Matt DeLuco on 2014-07-18.
 *
 * Supports negative values for days, days of the year, and weeks of the year
 * as outlined in RFC 5545 - Internet Calendaring and Scheduling Core Object
 * Specification (iCalendar).
 *
 * http://tools.ietf.org/html/rfc5545#section-3.3.10
 * See BYMONTHDAY, BYYEARDAY, BYWEEKNO.
 */

later.modifier.negative = later.modifier.n = function(period, values) {

    /**
     * This modifier is intended to support negative values for a subset of
     * periods outlined in RFC 5545 (iCal specification.)
     */
    if (['day', 'day of year', 'week of year (ISO)'].indexOf(period.name) < 0) {
        throw new Error('Negative modifier only intended for periods day, ' +
            'day of year, and week of year.');
    }

    return {

        /**
         * Returns the name of the period with the 'negative' modifier
         */
        name: 'negative ' + period.name,

        /**
         * Pass through to period
         */
        range: period.range,

        /**
         * The negative value of the specified date counting down from the max
         * extent.
         *
         * @param d
         * @returns {number}
         */
        val: function(d) {
            return -1 * (period.extent(d)[1] - period.val(d) + 1);
        },

        /**
         * Returns true if the val is valid for the date specified.
         * @param d
         * @param val
         * @returns {boolean}
         */
        isValid: function(d, val) {
            return later.modifier.negative(period).val(d) === val;
        },

        /**
         * The minimum and maximum valid values for the given period.  Based on
         * the negated maximum (min) and negated minimum (max) of the
         * period.
         * @param d
         * @returns {*[]}
         */
        extent: function(d) {
            return [-1 * period.extent(d)[1], -1 * period.extent(d)[0]];
        },

        /**
         * Pass through to period.
         */
        start: period.start,

        /**
         * Pass through to period.
         */
        end: period.end,

        /**
         * Returns the start of the next instance of the period value relative
         * to the given date.  Returns the end of previous period if val is less
         * than the minimum extent.
         * @param d
         * @param val
         * @returns {*}
         */
        next: function(d, val) {
            if (-1 * val > period.extent(d)[1]) {
                return period.prev(d);
            }
            return period.next(d, period.extent(d)[1] + val + 1);
        },

        /**
         * Returns the end of the previous instance of the period value relative
         * to the given date.  Returns the beginning of the previous period if
         * val is less than the minimum extent of the previous period.
         * @param d
         * @param val
         * @returns {*}
         */
        prev: function(d, val) {
            if (-1 * val > period.extent(period.prev(d))[1]) {
                return period.start(period.prev(d, 1));
            }
            return period.prev(d, period.extent(d)[1] + val + 1);
        }
    };
};