/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    fileUtil = require('../../lib/file/fileUtil.js'),
    walk = require('walkdir'),
    path = require('path');

describe('fileUtil test', function() {
    it('find in dir', function(done) {
        fileUtil.findInDir('D:\\project\\tradeface\\', /pom.xml/, function(err, result){
            console.log(result);
            done();
        });
    });


    it.only('test walkdir', function (done) {

        var emitter = walk('D:\\project\\tradeface');
        emitter.on('directory', function(filename,stat){
            if(filename.indexOf('.svn') > -1) return;
            if(/WEB-INF$/.test(filename)) {
                console.log('file from emitter: ', filename);
            }
        });

        emitter.on('end', function(){
            done();
        });
    });
});