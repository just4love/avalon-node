var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    colors = require('colors'),
    util = require('../util/util'),
    fileUtil = require('../util/fileUtil'),
    iconv = require('iconv-lite'),
    webxRouter = require('../finder/webxRouter'),
    commonFinder = require('../finder/common'),
    kvconventer = require('./KVConventer'),
    _ = require('underscore');

/**
 * 获取layout路径，如果不存在，则获取默认路径
 * @param p
 * @param baseModule
 * @return {String|XML}
 */
var getLayout = function(p, baseModule, config) {
    p = p.replace('screen', 'layout');

    var t = p.split('/'),
        type = t.shift(),
        pathPrefix = type == 'vmcommon' ? config.common[type]: config['subModule'][baseModule][type];

    var vmPath = path.join(pathPrefix, t.join(path.sep));
    if(fs.existsSync(vmPath)) {
        return p;
    } else {
        vmPath = path.join(path.dirname(vmPath), 'default.vm');
        p = path.join(path.dirname(p), 'default.vm').replace(/\\/g, '/');

        if(fs.existsSync(vmPath)) {
            return p;
        } else {
            return 'layout/default.vm';
        }
    }
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

    var baseModule = t.shift();
    if(baseModule.indexOf(':') != -1) {
        //trade:test.vm
        if(subModules[baseModule.split(':')[0]]) {
            return baseModule.split(':')[0];
        }
        return null;
    } else {
        //如果module在config里有，才算是真的submodule，否则都算path
        if(subModules[baseModule]) {
            return baseModule;
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


var getNormalScreenPath = function(p, baseModule, config){
    //如果target没有module，则要把默认module追加上去
    if(baseModule != 'noModule' && p.indexOf(baseModule) == -1) {
        p = [baseModule, p].join('/');
    }
    /**
     * auction/order/buynow.vm => screen/order/buynow.vm
     * @type {*}
     */
    if(baseModule && config['subModule'][baseModule]) {
        var t = p.split('/');
        if(baseModule != 'noModule') {
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
    var result = content.match(/(#parse|#include|\$.*(c|C)ontrol.setTemplate).*?\.(vm|htm.*)('|")\)/g);
    _.each(result, function(v) {
        var parseType = v.indexOf('#parse') != -1,
            includeType = v.indexOf('#include') != -1;
        if(parseType) {
            v = v.replace(/#parse\(('|")\s*/, '');
        } else if(includeType) {
            v = v.replace(/#include\(('|")\s*/, '');
        } else {
            //control && vmcommonControl
            v = v.replace(/\$.*(c|C)ontrol.setTemplate\(('|")\s*/, '');
        }
        v = v.replace(/('|")\s*\)/, '');
        if(v.indexOf('/') == 0) {
            v = v.substring(1);
        }

        if(parseType || includeType) {
            includes.push(v);
        } else {
            if(v.indexOf('vmcommon') != -1) {
                includes.push(v);
            } if(v.indexOf(":") != -1) {
                //有可能有$control.setTemplate('trade:test.vm') ->trade:control/test.vm
                var vs = v.split(':');
                includes.push([vs[0], ':control/' + vs[1]].join(''));
            } else {
                includes.push('control/' + v);
            }
        }
    });

    return includes;
};

var getTemplatesInFileSync = function(p, baseModule, config){
    var content = {};

    function getTemplates(p, innerModule){
        var c = webxRouter.fileRoute(p, innerModule, config),
            //module不同的时候，key要加上module，仅对vm有效
            contentKey = baseModule === innerModule || p.indexOf('.vm') == -1 ? p : (innerModule + ':' + p);

        if(!_.isNull(c)) {
            content[contentKey] = c;
        } else {
            content[contentKey] = null;
        }

        var includes = includeTemplate(content[contentKey]);
        _.each(includes, function(include){
            if(!content[include]) {
                if(include.indexOf(':') != -1) {
                    var includeSplits = include.split(':');
                    getTemplates(includeSplits[1], includeSplits[0]);
                } else {
                    getTemplates(include, innerModule);
                }
            }
        });
    }

    getTemplates(p, baseModule);

    var layout = getLayout(p, baseModule, config);
    getTemplates(layout, baseModule);

    return content;
};

var getTemplatesJSONSync = function(p, baseModule, config){
    var depCache = {},  //依赖cache
        result = {};

    function getTemplatesTree(p, innerModule, tree){
        var includes,
            contentKey = baseModule === innerModule || p.indexOf('.vm') == -1 ? p : (innerModule + ':' + p);

        tree[contentKey] = {};

        if(depCache[contentKey]) {
            includes = depCache[contentKey];
        } else {
            var text = webxRouter.fileRoute(p, innerModule, config);

            includes = includeTemplate(text);
            depCache[contentKey] = includes;
        }

        _.each(includes, function(include){
            if(include.indexOf(':') != -1) {
                var includeSplits = include.split(':');
                getTemplatesTree(includeSplits[1], includeSplits[0], tree[contentKey]);
            } else {
                getTemplatesTree(include, innerModule, tree[contentKey]);
            }
        });
    }

    getTemplatesTree(p, baseModule, result);

    var layout = getLayout(p, baseModule, config);
    getTemplatesTree(layout, baseModule, result);

    return result;
};

var getScreenUrl = function(config, callback){
    var data = {};
    async.map(_.keys(config['subModule']), function(baseModule, cb){
        var screenRoot = config['subModule'][baseModule]['screen'];
        commonFinder.findScreenFile(screenRoot, function(err, result){
            var newResult = [];
            _.each(result, function(v){
                var findPrefix = path.join(screenRoot, v.replace('.vm', '')),
                    r = {};

                r['url'] = v.replace('\\', '/').replace('.vm', '.htm');
                r['hasData'] = fs.existsSync(findPrefix + '.json') || fs.existsSync(findPrefix + '.js');

                newResult.push(r);
            });
            data[baseModule] = newResult;
            cb(err, newResult)
        });
    }, function(err, result){
        _.each(data, function(v, k){
            if(_.isEmpty(v)) {
                delete data[k];
            }
        });
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
    getConfig: function(root, type, cb){
        root = path.resolve(root);
        if(!fs.existsSync(root)) {
            cb('您当前填写的目录不存在，请确认后重试');
            return;
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

        webxRouter.finderRoute(app, type, function(err, appCfg){
            config[appName] = appCfg;
            //这里回调应用配置
            cb(err, appCfg);
        });
    },
    getContentSync: function(p, baseModule, config){
        //e.g. order/buynow.vm
        if(baseModule && config['subModule'][baseModule]) {
            return getTemplatesInFileSync(p, baseModule, config);
        } else {
            return {};
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
            _.each(contentKeys, function(vm){
                var t = vm.split('/');
                var type = t.shift(),
                    pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.json'));
                //get data
                if(fs.existsSync(dataPath)) {
                    var json = fileUtil.getFileContentSync(dataPath, config['encoding'] || 'gbk');
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
            _.each(contentKeys, function(vm){
                var t = vm.split('/');
                var type = t.shift(),
                    pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.js'));
                //get data
                if(fs.existsSync(dataPath)) {
                    data[vm] = fileUtil.getFileContentSync(dataPath, config['encoding'] || 'gbk');
                }
            });
        }

        return data;
    },
    getMacroSync: function(config) {
        var content = [];
        if(config['webRoot'] && config['macros']) {
            var macroPath = config['macros'];
            _.each(macroPath, function(macro){
                content.push(fileUtil.getFileContentSync(path.join(config['webRoot'], macro), config['encoding'] || 'gbk'));
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
    /**
     * 返回一个模板的所有变量key树
     * @param contentList
     * @return {Object}
     */
    getKeys: function(contentList){
        var result = {},
            controlParams = {};

        //先收集一下control传的参数
        _.each(contentList, function(v){
            kvconventer.getControlVars(v, controlParams);
        });

        _.each(_.keys(contentList).reverse(), function(k){
            var v = contentList[k];
            var setVars = kvconventer.getSetVars(v),
                forVars = kvconventer.getForVars(v),
                vars = kvconventer.getVars(v);

            kvconventer.mergeVars(vars, setVars, forVars, k, result, controlParams[k]||{});
        });

        //再倒回来
        return kvconventer.reverObj(result);
    }
};