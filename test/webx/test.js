/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    finder = require('../../lib/webx/finder.js'),
    walk = require('walkdir'),
    path = require('path');

describe('analyze', function () {
    describe('analyze web root', function () {
        it.only('should find WEB-INF', function (done) {
            finder.findwebroot('D:\\project\\tradeface', function (err) {
                done();
            });
        });

        it('test findit', function (done) {
            var finder = require('findit').find('D:\\project\\tradeface');

            finder.on('directory', function (dir, stat) {
                console.log(dir + '/');
            });

            finder.on('file', function (file, stat) {
                console.log(file);
            });

            finder.on('link', function (link, stat) {
                console.log(link);
            });

            finder.on('end', function () {
                done()
            })
        });

        it('test walkdir', function (done) {

            var emitter = walk('D:\\project\\tradeface');
            emitter.on('directory', function(filename,stat){
                if(filename.indexOf('WEB-INF') > -1) {
//                    console.log('file from emitter: ', filename);
                }
            });

            emitter.on('end', function(){
                done();
            });
        });
    })
});