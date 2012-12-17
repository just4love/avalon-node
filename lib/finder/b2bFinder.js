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
    _ = require('underscore');

module.exports = {
    /**
     * b2b的webroot目录写死为deploy
     * @param root
     * @param cb
     */
    findWebroot: function(root, cb) {
        var abs = path.resolve(root), dirs = [];
        if (fs.existsSync(path.join(abs, 'deploy'))) {
            //b2b目录处理
            dirs.push(path.join(abs, 'deploy'));
        }
        cb(null, dirs);
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
                if(fileUtil.findInBuffer('#macro', content)) {
                    return true;
                }
            }
            return false;
        }, function(err, result) {
            cb(err, result);
        });
    },
    /**
     * b2b目录结构适配,submodule在前
     * @param webroot
     * @param cb
     */
    findSubModule: function(webroot, cb){
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
    }
};