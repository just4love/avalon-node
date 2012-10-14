/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    fileUtil = require('../util/fileUtil'),
    async = require('async');

var WEBROOT_FEATURE = /WEB-INF$/;

module.exports = {
    findWebroot:function(root, cb) {
        if(typeof root === 'string') {
            root = [root];
        }

        var dirs = [];

        async.forEach(root, function(p, callback) {
            var abs = path.resolve(p);

            fileUtil.findDirectory(abs, WEBROOT_FEATURE, function(result) {
                //get parent to make web root
                result.forEach(function (res) {
                    dirs.push(path.dirname(res));
                });

                callback();
            });
        }, function (err) {
            cb(dirs);
        });
    }
};