/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    finder = require('../../lib/finder/tbFinder'),
    webx = require('../../lib/webx/webx'),
    _ = require('underscore'),
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
    });

    describe('test webx', function() {
        it('test get config', function(done) {
            webx.getConfig('D:\\project\\tradeface', 'tb', function(err, result){
                console.log(result);
                done();
            });
        });

        it('test get content', function(done) {
            webx.getConfig('D:\\project\\tradeface', 'tb', function(err, result){
                webx.getContent('auction/order/unityOrderConfirm.vm', result, function(err, result){
                    console.log(result);
                    done();
                });
            });
        });

        it('test get content sync', function(done) {
            webx.getConfig('D:\\project\\tradeface', 'tb', function(err, result){
                result.vmcommon = 'D:\\project\\vmcommon';

                var content = webx.getContentSync('auction/order/unityOrderConfirm.vm', result);
                console.log(_.keys(content));
                done();
            });
        });

        it('test get data sync', function(done) {
            webx.getConfig('D:\\project\\tradeface', 'tb', function(err, result){
                result.vmcommon = 'D:\\project\\vmcommon';

                var content = webx.getContentSync('auction/order/unityOrderConfirm.vm', result);
                var data = webx.getDataSync('auction',_.keys(content), result);
                console.log(JSON.stringify(data));
                done();
            });
        });

        it.only('test get screen file', function(done) {
            webx.getConfig('D:\\project\\tradeface', 'tb', function(err, result){
                webx.getScreenUrl(result, function(err, data){
                    console.log(data);
                    done();
                });
            });
        });
    });
});