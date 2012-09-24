/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    fileUtil = require('../file/fileUtil');

var WEBROOT_FEATURE = /WEB-INF/;

module.exports = {
    findwebroot:function(root, cb) {
        fileUtil.findDir(root, WEBROOT_FEATURE, function(err, files){
            if (err) {
                return cb(err);
            }

            console.log(files);
            return cb();
        });
    }
};