/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */
var async = require('async');

describe('test async', function () {
    it('test', function () {
        async.waterfall([
            function (callback) {
                console.log(1);
                callback(null, 'one', 'two');
            },
            function (arg1, arg2, callback) {
                console.log(2);
                callback(null, 'three');
            },
            function (arg1, callback) {
                console.log(3);
                // arg1 now equals 'three'
                callback(null, 'done');
            }
        ], function (err, result) {
            console.log(4);
            // result now equals 'done'
        });
    });
});