/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    fileUtil = require('../util/fileUtil'),
    async = require('async'),
    _ = require('underscore'),
    tbFinder = require('./tbFinder');

var getAppConfig = function(app, finder, cb){

    var root = app['root'];

    async.waterfall([
        function(callback){
            finder.findWebroot(root, function(err, result) {
                if(err) {
                    callback(err);
                }
                if(result.length > 0) {
                    app['webRoot'] = result[0];
                    callback(err, result[0]);
                } else {
                    callback('当前路径未找到模板目录结构，请重试');
                }
            });
        },
        function(webroot, callback){
            finder.findSubModule(webroot, function(err, result) {
                app['subModule'] = result;
                callback(err, webroot);
            });
        },
        function(webroot, callback){
            finder.findMacros(webroot, function(err, result) {
                app['macros'] = result;
                callback(err, webroot);
            });
        }
    ], function (err, result) {
        cb(err, app);
    });
};

module.exports = {
    route: function(appCfg, type, callback){
        switch(type) {
            case 'tb':
                getAppConfig(appCfg, tbFinder, callback);
                break;
            case 'b2b':
                break;
            default:
                getAppConfig(appCfg, tbFinder, callback);
        }
    }
};