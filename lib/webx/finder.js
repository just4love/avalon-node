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
    _ = require('underscore');

var findInBuffer = function(text, content){
    if(content) {
        return content.toString().indexOf(text) > -1;
    }
    return false;
};

module.exports = {
    /**
     * 查找web根目录的规则是WEB-INF目录的上一层
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
                _.each(result, function (res) {
                    dirs.push(path.resolve(path.dirname(res)));
                });

                cb(err, dirs);
            }
        });
    },
    /**
     * 查找宏文件的规则是*.vm，但是不包括*.xml.vm，同时文件内有#macro标记的
     * @param webroot
     * @param cb
     */
    findMacros: function(webroot, cb){
        fileUtil.findInDir(webroot, function(fileName) {
            if(/.vm$/.test(fileName)
                && !/.xml.vm$/.test(fileName)
                && !/autoconf(\/|\\)/.test(fileName)
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
     * 查找子module的规则为包含templates目录的上一层
     * @param webroot
     * @param cb
     */
    findSubModule: function(webroot, cb){
        var modules = {};
        fileUtil.findDirectory(webroot, /(\\|\/)templates$/, function(err, result) {
            _.each(result, function(p){
                var moduleRoot = path.resolve(path.dirname(p));
                if(moduleRoot == webroot) {
                    //没有sub module
                    modules['noModule'] = {
                        screen:path.join(moduleRoot, 'templates/screen'),
                        layout:path.join(moduleRoot, 'templates/layout'),
                        control:path.join(moduleRoot, 'templates/control')
                    };
                } else {
                    modules[path.basename(moduleRoot)] = {
                        screen:path.join(moduleRoot, 'templates/screen'),
                        layout:path.join(moduleRoot, 'templates/layout'),
                        control:path.join(moduleRoot, 'templates/control')
                    };
                }
            });

            cb(err, modules);
        });
    },
    /**
     * b2b目录结构适配,submodule在前
     * @param webroot
     * @param cb
     */
    findSubModuleAnother: function(webroot, cb){
        var modules = {};
        fileUtil.findDirectory(webroot, /(\\|\/)templates$/, function(err, result) {
            _.each(result, function(p){
                var dirs = fs.readdirSync(p);
                _.each(dirs, function(dir) {
                    var moduleRoot = path.join(p, dir);
                    if(moduleRoot == webroot) {
                        //没有sub module
                        modules['noModule'] = {
                            screen:path.join(moduleRoot, 'screen'),
                            layout:path.join(moduleRoot, 'layout'),
                            control:path.join(moduleRoot, 'control')
                        };
                    } else {
                        modules[path.basename(moduleRoot)] = {
                            screen:path.join(moduleRoot, 'screen'),
                            layout:path.join(moduleRoot, 'layout'),
                            control:path.join(moduleRoot, 'control')
                        };
                    }
                });
            });

            cb(err, modules);
        });
    },
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