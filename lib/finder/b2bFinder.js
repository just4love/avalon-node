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
        dirs.push(abs);
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
        fileUtil.findDirectory(webroot, function(filename) {
            return /(\\|\/)control$/.test(filename) && filename.indexOf('java') == -1
        }, function(err, result) {
            _.each(result, function(p){
                var parent = path.dirname(p);
                if(parent == webroot) {
                    //没有sub module
                    modules['noModule'] = {
                        screen:path.join(parent, 'screen'),
                        layout:path.join(parent, 'layout'),
                        control:path.join(parent, 'control')
                    };
                } else {
                    modules[path.basename(parent)] = {
                        screen:path.join(parent, 'screen'),
                        layout:path.join(parent, 'layout'),
                        control:path.join(parent, 'control')
                    };
                }
            });

            cb(err, modules);
        });
    },
    getFile: function(p, innerModule, config) {
        var t = p.split('/'),
            type = t.shift(),
            pathPrefix = config['subModule'][innerModule][type];

        var vmPath = path.join(pathPrefix, t.join(path.sep));

        if(type === 'control' && !fs.existsSync(vmPath)) {
            pathPrefix = config['subModule']['common'][type];
            vmPath = path.join(pathPrefix, t.join(path.sep));
        }

        return fileUtil.getFileContentSync(vmPath, config['encoding'] || 'gbk', null);
    }
};