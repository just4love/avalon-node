/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    finder = require('../../lib/webx/finder'),
    path = require('path');

describe('analyze', function () {
    describe('analyze web root', function () {
        it.only('should find WEB-INF', function (done) {
            finder.findWebroot(['/Users/harry/projects/tradeface', '/Users/harry/projects/vcenter'], function(result) {
                assert.equal(result.length, 2, 'find web-inf directory error');
                done();
            });
        });
    })
});