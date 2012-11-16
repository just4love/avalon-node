var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    colors = require('colors'),
    util = require('../util/util'),
    iconv = require('iconv-lite'),
    finder = require('./finder'),
    _ = require('underscore');

/**
 * 获取layout路径，如果不存在，则获取默认路径
 * @param p
 * @param module
 * @return {String|XML}
 */
var getLayout = function(p, module, config) {
    p = p.replace('screen', 'layout');

    var t = p.split('/'),
        type = t.shift(),
        pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][module][type];

    var vmPath = path.join(pathPrefix, t.join(path.sep));
    if(fs.existsSync(vmPath)) {
        return p;
    } else {
        p = path.join(path.dirname(p), 'default.vm');
        vmPath = path.join(vmPath, 'default.vm');

        if(fs.existsSync(vmPath)) {
            return p;
        } else {
            return 'layout/default.vm';
        }
    }
};

var getFileContentSync = function(p, encoding) {
    if(encoding == 'gbk') {
        encoding = '';
    }
    //get data
    if(fs.existsSync(p)) {
        var content = fs.readFileSync(p, encoding);
        if(encoding == '') {
            content = iconv.decode(content, 'gbk');
        }

        return content;
    }
    return '';
};

/**
 * 查找module
 * @param p
 * @return {*}
 */
var findModule = function(p, config){
    var t = p.split('/'),
        subModules = config['subModule'];

    if(t.length <= 1) {
        if(config['defaultModule']) {
            return config['defaultModule'];
        }

        if(subModules['noModule']) {
            return 'noModule';
        }
        return null;
    }

    var module = t.shift();
    if(module.indexOf(':') != -1) {
        //trade:test.vm
        if(subModules[module.split(':')[0]]) {
            return module.split(':')[0];
        }
        return null;
    } else {
        //如果module在config里有，才算是真的submodule，否则都算path
        if(subModules[module]) {
            return module;
        }
        if(config['defaultModule']) {
            return config['defaultModule'];
        }
        //看看有没有默认module
        if(subModules['noModule']) {
            return 'noModule';
        }

        return null;
    }
};


var getNormalScreenPath = function(p, module, config){
    //如果target没有module，则要把默认module追加上去
    if(module != 'noModule' && p.indexOf(module) == -1) {
        p = [module, p].join('/');
    }
    /**
     * auction/order/buynow.vm => screen/order/buynow.vm
     * @type {*}
     */
    if(module && config['subModule'][module]) {
        var t = p.split('/');
        if(module != 'noModule') {
            t.shift();
        }
        t.unshift('screen');

        return t.join('/');
    } else {
        return '';
    }
};

/**
 * 查找文件内容中的模板
 * @param content
 */
var includeTemplate = function(content){
    var includes = [];

    content = util.removeVelocityComments(content);
    var result = content.match(/(#parse|\$.*(c|C)ontrol.setTemplate).*?\.vm('|")\)/g);
    result && result.forEach(function(v) {
        var parseType = v.indexOf('#parse') != -1;
        if(parseType) {
            v = v.replace(/#parse\(('|")\s*/, '');
        } else {
            //control && vmcommonControl
            v = v.replace(/\$.*(c|C)ontrol.setTemplate\(('|")\s*/, '');
        }
        v = v.replace(/('|")\s*\)/, '');

        if(parseType) {
            includes.push(v);
        } else {
            if(v.indexOf('vmcommon') != -1) {
                includes.push(v);
            } else {
                //有可能有$control.setTemplate('trade:test.vm') ->trade:control/test.vm
                //TODO 引不同module的细节回头搞。。
                includes.push('control/' + v);
            }
        }
    });

    return includes;
};

var getTemplatesInFileSync = function(p, module, config){
    var content = {};

    function getTemplates(p, module){
        var t = p.split('/'),
            type = t.shift(),
            pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][module][type];

        var vmPath = path.join(pathPrefix, t.join(path.sep));
        content[p] = getFileContentSync(vmPath, config['encoding'] || 'gbk');

        var includes = includeTemplate(content[p]);
        includes.forEach(function(include){
            if(!content[include]) {
                getTemplates(include, module);
            }
        });
    }

    getTemplates(p, module);

    var layout = getLayout(p, module, config);
    getTemplates(layout, module);

    return content;
};

var getTemplatesJSONSync = function(p, module, config){
    var depCache = {},  //依赖cache
        result = {};

    function getTemplatesTree(p, module, tree){
        var includes;
        tree[p] = {};

        if(depCache[p]) {
            includes = depCache[p];
        } else {
            var t = p.split('/'),
                type = t.shift(),
                pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][module][type];

            var vmPath = path.join(pathPrefix, t.join(path.sep));
            var text = getFileContentSync(vmPath, config['encoding'] || 'gbk');

            includes = includeTemplate(text);
            depCache[p] = includes;
        }

        includes.forEach(function(include){
            getTemplatesTree(include, module, tree[p]);
        });
    }

    getTemplatesTree(p, module, result);

    var layout = getLayout(p, module, config);
    getTemplatesTree(layout, module, result);

    return result;
};

var getScreenUrl = function(config, callback){
    var data = {};
    async.map(_.keys(config['subModule']), function(module, cb){
        var screenRoot = config['subModule'][module]['screen'];
        finder.findScreenFile(screenRoot, function(err, result){
            var newResult = [];
            result.forEach(function(v){
                newResult.push(v.replace('\\', '/').replace('.vm', '.htm'))
            });
            data[module] = newResult;
            cb(err, newResult)
        });
    }, function(err, result){
        callback(err, data);
    });
};

/**
 * 获取json数据
 * @param text
 * @return {*}
 */
function getDataJSON(text, path){
    if(!text) return {};
    text = util.removeComments(text);
    //js貌似没法匹配单行注释
//    text = text.replace(/\/\*(\s|.)*?\*\//g, "");
    try {
        return JSON.parse(text);
    } catch (ex) {
        console.log('[Error]：'.yellow.bold + path + ' to JSON >>> ' + 'Fail'.red.bold);
        return {};
    }
}

module.exports = {
    /**
     * 获取一个新应用的所以配置
     * @param root
     * @param cb
     */
    getConfig: function(root, cb){
        root = path.resolve(root);
        if(!fs.existsSync(root)) {
            cb('directory not found');
        }
        var stat = fs.statSync(root);
        if(stat.isFile()) {
            root = path.dirname(root);
        }

        var appName = path.basename(root);
        var config = {};

        var app = {
            root:root
        };

        async.waterfall([
            function(callback){
                finder.findWebroot(root, function(err, result) {
                    if(err) {
                        callback(err);
                    }
                    if(result.length > 0) {
                        app['webRoot'] = result[0];
                        callback(null, result[0]);
                    } else {
                        callback(err);
                    }
                });
            },
            function(webroot, callback){
                finder.findMacros(webroot, function(err, result) {
                    app['macros'] = result;
                    callback(null, webroot);
                });
            },
            function(webroot, callback){
                finder.findSubModule(webroot, function(err, result) {
                    app['subModule'] = result;
                    callback(null, webroot);
                });
            }
//            function(webroot, callback){
//                app['tools'] = {}; //觉着这里没必要查询tools，又慢又容易出错，吃力不讨好
//                callback(null, webroot);
//                finder.findTools(webroot, function(err, result) {
//                    app['tools'] = {};
//                    callback(null, webroot);
//                });
//            }
        ], function (err, result) {
            config[appName] = app;
            cb(err, app);
        });
    },
    getContentSync: function(p, module, config){
        //e.g. order/buynow.vm
        if(module && config['subModule'][module]) {
            return getTemplatesInFileSync(p, module, config);
        } else {
            var result = {};
            result[p] = '';
            return result;
        }
    },
    getDataSync: function(currentModule, contentKeys, config) {
        var basePath = config['webRoot'],
            data = {};
        if(config["data"]) {
            basePath = config["data"];
        }

        //e.g. /auction/order/buynow.vm
        if(currentModule && config['subModule'][currentModule]) {
            contentKeys.forEach(function(vm){
                var t = vm.split('/');
                var type = t.shift(),
                    pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.json'));
                //get data
                if(fs.existsSync(dataPath)) {
                    var json = getFileContentSync(dataPath, config['encoding'] || 'gbk');
                    data[vm] = getDataJSON(json, dataPath);
                } else {
                    data[vm] = '';
                }
            });
        }

        return data;
    },
    getCustomDataSync:function(currentModule, contentKeys, config){
        var basePath = config['webRoot'],
            data = {};
        if(config["data"]) {
            basePath = config["data"];
        }

        //e.g. /auction/order/buynow.vm
        if(currentModule && config['subModule'][currentModule]) {
            contentKeys.forEach(function(vm){
                var t = vm.split('/');
                var type = t.shift(),
                    pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.js'));
                //get data
                if(fs.existsSync(dataPath)) {
                    data[vm] = getFileContentSync(dataPath, config['encoding'] || 'gbk');
                }
            });
        }

        return data;
    },
    getMacroSync: function(config) {
        var content = [];
        if(config['webRoot'] && config['macros']) {
            var macroPath = config['macros'];
            macroPath.forEach(function(macro){
                content.push(getFileContentSync(path.join(config['webRoot'], macro), config['encoding'] || 'gbk'));
            });

            return content.join('\r\n');
        }
        return '';
    },
    findModule: findModule,
    getNormalScreenPath: getNormalScreenPath,
    getScreenUrl: getScreenUrl,
    getIncludeVm: function(p, m, config){
        //e.g. order/buynow.vm
        if(m && config['subModule'][m]) {
            return getTemplatesJSONSync(p, m, config);
        } else {
            var result = {};
            result[p] = '';
            return result;
        }
    },
    getKeys: function(p, m, config){
        var blacklist = [];
        //e.g. order/buynow.vm
        if(m && config['subModule'][m]) {
            return getTemplatesJSONSync(p, m, config);
        } else {
            var result = {};
            result[p] = '';
            return result;
        }
    }
};