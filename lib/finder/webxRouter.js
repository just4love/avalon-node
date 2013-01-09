/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    async = require('async'),
    _ = require('underscore'),
    util = require('../util/util'),
    tbFinder = require('./tbFinder'),
    b2bFinder = require('./b2bFinder');

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

var getFile = function(p, innerModule, config, finder){
    return finder.getFile(p, innerModule, config);
};

var getLayout = function(p, baseModule, config, finder, screenContent){
    var c = util.removeVelocityComments(screenContent);
    var result = c.match(/\$\w+\.getModuleInfo\(\)\.setLayoutTemplate\((null|"[^"]*"|'[^']*')\)/g);

    if(result && result.length) {
        var layout = result[0].replace(/.*setLayoutTemplate\((\s)*('|")?\s*/, '');
        layout = layout.replace(/('|")?\s*\)/, '');
        if(layout == 'null') return layout;
        p = 'screen/' + layout;
    }

    return finder.getLayout(p, baseModule, config);
};

module.exports = {
    finderRoute: function(appCfg, type, callback){
        switch(type) {
            case 'taobao':
                getAppConfig(appCfg, tbFinder, callback);
                break;
            case 'b2b':
                getAppConfig(appCfg, b2bFinder, callback);
                break;
            default:
                getAppConfig(appCfg, tbFinder, callback);
        }
    },
    fileRoute: function(p, innerModule, config){
        switch(config.type) {
            case 'taobao':
                return getFile(p, innerModule, config, tbFinder);
                break;
            case 'b2b':
                return getFile(p, innerModule, config, b2bFinder);
                break;
            default:
                return getFile(p, innerModule, config, tbFinder);
        }
    },
    getLayout: function(p, baseModule, config, screenContent){
        switch(config.type) {
            case 'taobao':
                return getLayout(p, baseModule, config, tbFinder, screenContent);
                break;
            case 'b2b':
                return getLayout(p, baseModule, config, b2bFinder, screenContent);
                break;
            default:
                return getLayout(p, baseModule, config, tbFinder, screenContent);
        }
    }
};