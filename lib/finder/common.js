/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    fileUtil = require('../util/fileUtil'),
    async = require('async'),
    _ = require('underscore');

module.exports = {
    findScreenFile: function(screenRoot, cb){
        if(!fs.existsSync(screenRoot)) {
            cb(null, []);
            return;
        }
        fileUtil.findInDir(screenRoot, function(fileName) {
            if(/.vm/.test(fileName)
                && !/.svn/.test(fileName)) {
                return true;
            }
            return false;
        }, function(err, result) {
            cb(err, result);
        });
    }
};