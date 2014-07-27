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
    // TODO day of year, week of year (ISO)
    if ('day' !== period.name) {
        throw new Error('Negative modifier only intended for period day.');
    }

    /**
     * The negative value of the specified date counting down from the max
     * extent.
     *
     * @param d
     * @returns {number}
     */
    var val = function(d) {
        return -1 * (period.extent(d)[1] - period.val(d) + 1);
    };

    /**
     * Returns true if the val is valid for the date specified.
     * @param d
     * @param val
     * @returns {boolean}
     */
    var isValid = function(d, value) {
        return val(d) === value;
    };

    /**
     * The minimum and maximum valid values for the given period.  Based on
     * the negated maximum (min) and negated minimum (max) of the
     * period.
     * @param d
     * @returns {*[]}
     */
    var extent = function(d) {
        return [-1 * period.extent(d)[1], -1 * period.extent(d)[0]];
    };

    /**
     * Returns the start of the next instance of the period value relative
     * to the given date.  Returns the end of previous period if val is less
     * than the minimum extent.
     * @param d
     * @param val
     * @returns {*}
     */
    var next = function(d, val) {
        val = val < extent(d)[0] ? extent(d)[0] : val;

        var rolloverVal = period.extent(d)[1] + val + 1;

        var month = later.date.nextRollover(d, rolloverVal, later.D, later.M),
            DMax = later.D.extent(month)[1];

        val = -1 * val > DMax ? -DMax : val;

        return later.date.next(
            later.Y.val(month),
            later.M.val(month),
            DMax + val + 1
        );
    };

    /**
     * Returns the end of the previous instance of the period value relative
     * to the given date.  Returns the beginning of the previous period if
     * val is less than the minimum extent of the previous period.
     * @param d
     * @param val
     * @returns {*}
     */
    var prev = function(d, val) {
        var rolloverVal = period.extent(d)[1] + val + 1;
        var month = later.date.prevRollover(d, rolloverVal, later.D, later.M),
            DMax = later.D.extent(month)[1];

        val = -1 * val > DMax ? -1 * DMax : val;

        return later.date.prev(
            later.Y.val(month),
            later.M.val(month),
                DMax + val + 1
        );
    };

    return {
        name: 'negative ' + period.name,
        range: period.range,
        val: val,
        isValid: isValid,
        extent: extent,
        start: period.start,
        end: period.end,
        next: next,
        prev: prev
    };
};