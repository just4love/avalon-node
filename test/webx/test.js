/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    finder = require('../../lib/webx/finder'),
    path = require('path');

describe('analyze', function () {
    describe('analyze web root', function () {
        it.only('should find WEB-INF', function (done) {
            finder.findWebroot(['D:\\project\\tradeface', 'D:\\project\\cart'], function (result) {
                console.log(result);
                done();
            });
        });
    })
});