/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    finder = require('../../lib/webx/finder'),
    webx = require('../../lib/webx/webx'),
    path = require('path');

describe('analyze', function () {
    describe('analyze web path', function () {
        it('should find WEB-INF', function (done) {
            finder.findWebroot('D:\\project\\tradeface', function(err, result) {
                if(err) {
                    console.log(err);
                }
                console.log(result);
                done();
            });
        });

        it('find macro files', function(done) {
            finder.findMacros('D:\\project\\tradeface', function(err, result) {
                console.log(result);
//                assert.equal(result.length, 2, 'find web-inf directory error');
                done();
            });
        });

        it('find subModules', function(done) {
            finder.findSubModule('D:\\project\\tradeface', function(err, result) {
                console.log(result);
//                assert.equal(result.length, 2, 'find web-inf directory error');
                done();
            });
        });

        it('find tools', function(done) {
            finder.findTools('D:\\project\\snsju\\src\\main\\webapp', function(err, result) {
                console.log(result);
//                assert.equal(result.length, 2, 'find web-inf directory error');
                done();
            });
        });
    });

    describe('test webx', function(done) {
        it.only('test get config', function() {
            webx.getConfig('D:\\project\\tradeface', function(err, result){
                console.log(result);
                done();
            });
        });
    });
});