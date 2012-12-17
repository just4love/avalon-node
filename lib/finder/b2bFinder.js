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
     * b2b��webrootĿ¼д��Ϊdeploy
     * @param root
     * @param cb
     */
    findWebroot: function(root, cb) {
        var abs = path.resolve(root), dirs = [];
        if (fs.existsSync(path.join(abs, 'deploy'))) {
            //b2bĿ¼����
            dirs.push(path.join(abs, 'deploy'));
        }
        cb(null, dirs);
    },
    /**
     * ���Һ��ļ��Ĺ�����*.vm�����ǲ�����*.xml.vm��ͬʱ�ļ�����#macro��ǵ�
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
     * b2bĿ¼�ṹ����,submodule��ǰ
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
                        //û��sub module
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