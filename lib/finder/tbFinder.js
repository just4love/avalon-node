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
     * ����web��Ŀ¼�Ĺ�����WEB-INFĿ¼����һ��
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
     * ������module�Ĺ���Ϊ����templatesĿ¼����һ��
     * @param webroot
     * @param cb
     */
    findSubModule: function(webroot, cb){
        var modules = {};
        fileUtil.findDirectory(webroot, /(\\|\/)templates$/, function(err, result) {
            _.each(result, function(p){
                var moduleRoot = path.resolve(path.dirname(p));
                if(moduleRoot == webroot) {
                    //û��sub module
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
    }
};