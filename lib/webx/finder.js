/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var fs = require('fs'),
    path = require('path'),
    colors = require('colors'),
    fileUtil = require('../util/fileUtil'),
    async = require('async'),
    _ = require('underscore'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();

var findInBuffer = function(text, content){
    if(content) {
        return content.toString().indexOf(text) > -1;
    }
    return false;
};

var parseTools = function(webroot, toolsPath, cb){
    var tools = {};
    async.forEach(toolsPath, function(p, callback){
        fs.readFile(path.join(webroot, p), 'utf-8', function(err, data){
            if(err) {
                callback(err);
            }

            parser.parseString(data, function (err, result) {
                //webx3
                if(findInBuffer('services:pull', data)) {
                    if(result['beans:beans']['services:pull'][0]['bean-tool']) {
                        _.each(result['beans:beans']['services:pull'][0]['bean-tool'], function(value, key){
                            var tool = value['$'];
                            tools[tool.id] = tool.class;
                        });
                    }

                    if(result['beans:beans']['services:pull']['webx2-tool']) {
                        _.each(result['beans:beans']['services:pull']['webx2-tool'], function(value, key){
                            var tool = value['$'];
                            tools[tool.id] = tool.class;
                        });
                    }
                } else {
                    //webx2
                    if(result['configuration']['services'][0]['service']) {
                        _.each(result['configuration']['services'][0]['service'], function(value, key){
                            var t = value['$'];
                            if(t['name'] == 'PullService') {
                                _.each(t['property']['property'], function(v, k){
                                    tools[v.name] = v.value;
                                });
                            }
                        });
                    }

                    if(result['configuration']['instance'][0]['services'][0]['service']) {
                        _.each(result['configuration']['instance'][0]['services'][0]['service'], function(value, key){
                            if(value['$']['name'] == 'PullService') {
                                _.each(value['property'], function(v, k){
                                    if(v['$']['name'] == 'tool.global') {
                                        _.each(v['property'], function(t){
                                            tools[t['$']['name']] = t['$']['value'];
                                        });

                                    }
                                });
                            }
                        });
                    }
                }

                callback(err);
            });

        });
    }, function(err, result){
        cb(err, tools);
    });
};

module.exports = {
    /**
     * 镆ユ垒web镙圭洰褰旷殑瑙勫垯鏄疻EB-INF鐩綍镄勪笂涓€灞?
     * @param root
     * @param cb
     */
    findWebroot:function(root, cb) {
        var abs = path.resolve(root), dirs = [];

        fileUtil.findDirectory(abs, /WEB-INF$/, function(err, result) {
            if(err) {
                cb(err);
            } else {
                //get parent to make web root
                result.forEach(function (res) {
                    dirs.push(path.dirname(res));
                });

                cb(err, dirs);
            }
        });
    },
    /**
     * 镆ユ垒瀹忔枃浠剁殑瑙勫垯鏄?.vm锛屼絾鏄笉鍖呮嫭*.xml.vm锛屽悓镞舵枃浠跺唴链?macro镙囱镄?
     * @param webroot
     * @param cb
     */
    findMacros: function(webroot, cb){
        fileUtil.findInDir(webroot, function(fileName) {
            if(/.vm$/.test(fileName)
                && !/.xml.vm$/.test(fileName)
                && !/(\\|\/)(screen|layout|control)(\\|\/)/.test(fileName)) {

                var content = fs.readFileSync(path.join(webroot, fileName));
                if(findInBuffer('#macro', content)) {
                    return true;
                }
            }
            return false;
        }, function(err, result) {
            cb(err, result);
        });
    },
    /**
     * 镆ユ垒瀛恗odule镄勮鍒欎负鍖呭惈templates鐩綍镄勪笂涓€灞?
     * @param webroot
     * @param cb
     */
    findSubModule: function(webroot, cb){
        var modules = {};
        fileUtil.findDirectory(webroot, /(\\|\/)templates$/, function(err, result) {
            result.forEach(function(p){
                var moduleRoot = path.resolve(path.dirname(p));
                modules[path.basename(moduleRoot)] = {
                    screen:path.join(moduleRoot, 'templates/screen'),
                    layout:path.join(moduleRoot, 'templates/layout'),
                    control:path.join(moduleRoot, 'templates/control')
                };
            });

            cb(err, modules);
        });
    },
    findTools: function(webroot, cb){
        fileUtil.findInDir(webroot, function(fileName) {
            if(/.xml/.test(fileName)
                && !/(\\|\/).svn/.test(fileName)
                && !/pom.xml/.test(fileName)) {

                var content = fs.readFileSync(path.join(webroot, fileName));
                if(findInBuffer('DefaultPullService', content) || findInBuffer('services:pull', content)) {
                    return true;
                }
            }
            return false;
        }, function(err, result) {
//            console.log('find tools file:'+result);
            parseTools(webroot, result, function(err, r){
                cb(err, r);
            });
        });
    }
};