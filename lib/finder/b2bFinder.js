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

/**
 * 获取layout路径，如果不存在，则获取默认路径
 * @param p
 * @param baseModule
 * @return {String|XML}
 */
var getLayout = function(p, baseModule, config) {
    var p1 = p = p.replace('screen', 'layout');

    var t = p1.split('/'),
        type = t.shift(),
        pathPrefix = type == 'adcms' ? config.common[type]: config['subModule'][baseModule][type];

    var vmPath = path.join(pathPrefix, t.join(path.sep));
    if(fs.existsSync(vmPath)) {
        return baseModule == 'common' ? 'common:' + p1 : p1;
    } else {
        //查询同级目录下的default.vm
        vmPath = path.join(path.dirname(vmPath), 'default.vm');
        var p2 = path.join(path.dirname(p), 'default.vm').replace(/\\/g, '/');

        if(fs.existsSync(vmPath)) {
            return baseModule == 'common' ? 'common:' + p2 : p2;
        } else {
            //查询模块根目录下的default.vm
            if(fs.existsSync(path.join(pathPrefix, "default.vm"))) {
                return baseModule == 'common' ? 'common:layout/default.vm' : 'layout/default.vm';
            } else {
                if(baseModule != 'common' && config['subModule']['common']) {
                    //b2b还需要查询common模块
                    return getLayout(p, 'common', config);
                } else {
                    return "layout/default.vm";
                }
            }
        }
    }
};

//pagecache里的属性取src
var pageCacheHandler = function(text){
    if(text) {
        return text.replace(/<pagecache.*?\/>/g, function(matched){
            if(/\$control.*\)/.test(matched)) {
                return matched.match(/\$control.*\)/)[0]
            }
            return matched
        });
    }

    return text;
};

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
        if(config['subModule'][innerModule]) {
            var t = p.split('/'),
                type = t.shift(),
                pathPrefix = type == 'adcms' ? config.common[type] :config['subModule'][innerModule][type];

            var vmPath = path.join(pathPrefix, t.join(path.sep));

            //b2b的规则，当前的control没找到会到common模块下查找
            if(type === 'control' && !fs.existsSync(vmPath)) {
                if(config['subModule']['common']) {
                    pathPrefix = config['subModule']['common'][type];
                    vmPath = path.join(pathPrefix, t.join(path.sep));
                }
            }

            return pageCacheHandler(fileUtil.getFileContentSync(vmPath, config['encoding'] || 'gbk', null));
        } else {
            console.log('[' + 'WARN'.yellow + '] %s:%s was not found', innerModule.cyan, p.cyan);
            return null;
        }
    },
    getLayout: function(p, baseModule, config){
        return getLayout(p, baseModule, config);
    }
};