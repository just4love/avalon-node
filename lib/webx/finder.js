/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    fileUtil = require('../file/fileUtil'),
    async = require('async');

var WEBROOT_FEATURE = /WEB-INF$/;

module.exports = {
    findWebroot:function(root, cb) {
        if(typeof root === 'string') {
            root = [root];
        }

        var roots = [];

        async.map(root, function(p, callback) {
            var abs = path.resolve(p);

            fileUtil.findDirectory(abs, WEBROOT_FEATURE, function(result) {
                console.log(result);
                //get parent to make web root
                for (var res in result) {
                    roots.push(path.dirname(res));
                }

                callback(roots);
            });
        }, cb);
    }
};