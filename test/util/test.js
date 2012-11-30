/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */
var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    util = require('../../lib/util/util'),
    iconv = require('iconv-lite'),
    finder = require('../../lib/webx/finder');

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

    it('test waterfall', function(done){
        var root = 'D:\\project\\tradeface';
        root = path.resolve(root);
        if(!fs.existsSync(root)) {
            cb('directory not found');
        }
        var stat = fs.statSync(root);
        if(stat.isFile()) {
            root = path.dirname(root);
        }

        var appName = path.basename(root);
        var config = {};

        var app = {
            root:root
        };

        async.waterfall([
            function(callback){
                finder.findWebroot('D:\\project\\tradeface', function(err, result) {
                    if(err) {
                        callback(err);
                    }
                    if(result.length > 0) {
                        callback(null, result[0]);
                    } else {
                        callback(err);
                    }
                });
            },
            function (arg1, callback) {
                console.log(arg1);
                finder.findMacros('D:\\project\\tradeface', function(err, result) {
                    callback(null, result);
                });
            },
            function (arg1, callback) {
                console.log(arg1);
                finder.findSubModule('D:\\project\\tradeface', function(err, result) {
                    callback(null, result);
                });
            }
        ], function (err, result) {
            console.log(result);
            done();
            // result now equals 'done'
        });
    });

    it.only('removecomment', function() {
        var content = iconv.decode(fs.readFileSync('test.vm', ''), 'gbk');

        content = util.removeVelocityComments(content);
        console.log(content);
    });
});