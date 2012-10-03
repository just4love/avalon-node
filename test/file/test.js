/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    fileUtil = require('../../lib/file/fileUtil.js'),
    walk = require('walkdir'),
    path = require('path'),
    async = require('async');

describe('fileUtil test', function() {
    it('find in dir', function(done) {
        fileUtil.findInDir('D:\\project\\tradeface\\', /pom.xml/, function(err, result){
            console.log(result);
            done();
        });
    });


    it('test walkdir', function (done) {

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

    it('find walk use util', function (done) {
        var roots = ['/Users/harry/projects/tradeface', '/Users/harry/projects/vmcommon'];

        async.forEach(roots, 
            function(root, callback) {

                fileUtil.findDirectory(root, /WEB-INF$/, function(result) {
                    try {
                        if(!result.length) {
                            throw 'not found';
                        }
                        //get parent to make web root
                        console.log(result);
                    } catch(err) {
                        console.log('catched');
                        callback(err);
                    }
                    
                });
            },
            function (err) {
                console.log('called');
            }
        );

        console.log('execute end');

        done();
        
    });

    it.only('map each webroot', function (done) {
        var roots = ['/Users/harry/projects/tradeface', '/Users/harry/projects/vcenter'];

        async.map(roots, 
            function(root, callback) {

                fileUtil.findDirectory(root, /WEB-INF$/, function(result) {
                    try {
                        if(!result.length) {
                            throw 'not found';
                        }
                        //get parent to make web root
                        callback(null, result);
                    } catch(err) {
                        console.log('catched');
                        callback(err);
                    }
                    
                });
            },
            function (err, results) {
                console.log(results);
                console.log('called');
            }
        );

        done();
    });
});