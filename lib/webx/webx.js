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

        var includes = commonFinder.includeTemplate(content[contentKey], _.keys(config.common));
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

    var layout = webxRouter.getLayout(p, baseModule, config, content[p]);

    if(layout != "null") {
        if(layout.indexOf(':') != -1) {
            var layoutSplits = layout.split(':');
            getTemplates(layoutSplits[1], layoutSplits[0]);
        } else {
            getTemplates(layout, baseModule);
        }
    }

    return content;
};

var getTemplatesJSONSync = function(p, baseModule, config){
    var includesCache = {},  //依赖cache
        contentCache = {},
        result = {};

    function getTemplatesTree(p, innerModule, tree){
        var includes,
            contentKey = baseModule === innerModule || p.indexOf('.vm') == -1 ? p : (innerModule + ':' + p);

        tree[contentKey] = {};

        if(includesCache[contentKey]) {
            includes = includesCache[contentKey];
        } else {
            var text;
            if(_.has(contentCache, contentKey)) {
                text = contentCache[contentKey];
            } else {
                text = webxRouter.fileRoute(p, innerModule, config);
                contentCache[contentKey] = text;
            }

            includes = commonFinder.includeTemplate(text, _.keys(config.common));
            includesCache[contentKey] = includes;
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

    var layout = webxRouter.getLayout(p, baseModule, config, contentCache[p]);

    if(layout != "null") {
        if(layout.indexOf(':') != -1) {
            var layoutSplits = layout.split(':');
            getTemplatesTree(layoutSplits[1], layoutSplits[0], result);
        } else {
            getTemplatesTree(layout, baseModule, result);
        }
    }

    return result;
};

var getScreenUrl = function(config, callback){
    var data = {}, screenNameCache = {};
    async.map(_.keys(config['subModule']), function(baseModule, cb){
        var screenRoot = config['subModule'][baseModule]['screen'];
        commonFinder.findScreenFile(screenRoot, function(err, result){
            var newResult = [];
            //先循环一遍把screen整合一次
            _.each(result, function(v){
                var pathPrefix = v.replace(/\..*/, ''), screenCache;
                if(!screenNameCache[pathPrefix]) {
                    screenNameCache[pathPrefix] = [];
                }

                screenCache = screenNameCache[pathPrefix];

                screenCache.push(v);
            });

            //从cache中整理screen结构
            _.each(screenNameCache, function(v, k){
                var r = {};

                var vmPath = _.find(v, function(value){
                    return /\.vm/.test(value);
                });

                if(vmPath) {
                    //如果是包含vm的
                    r['detailPath'] = vmPath.replace('\\', '/');
                    r['showPath'] = vmPath.replace('\\', '/').replace('.vm', '.htm');
                    r['hrefPath'] = vmPath.replace('\\', '/').replace('.vm', '.htm');
                    r['hasData'] = v.length > 1;
                } else {
                    //只有data的
                    vmPath = v[0];
                    r['detailPath'] = vmPath.replace('\\', '/').replace(/\..*/, '.vm');
                    r['showPath'] = vmPath.replace('\\', '/').replace(/\..*/, '.do');
                    r['hrefPath'] = vmPath.replace('\\', '/').replace(/\..*/, '.do');
                    r['hasData'] = true;
                }

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
        console.log('[' + 'WARN'.yellow + '] %s to JSON >>> ' + 'Fail'.red.bold, path.cyan);
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
    /**
     * 获取json数据
     *
     * @param currentModule
     * @param contentKeys
     * @param config
     * @param defaultValue 文件不存在的默认数据
     * @return {{}}
     */
    getDataSync: function(currentModule, contentKeys, config, defaultValue) {
        if(_.isUndefined(defaultValue)) {
            defaultValue = {};
        }

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
                    pathPrefix = type == 'vmcommon' ? config.common[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.json'));
                //get data
                if(fs.existsSync(dataPath)) {
                    var json = fileUtil.getFileContentSync(dataPath, config['encoding'] || 'gbk', '');
                    data[vm] = getDataJSON(json, dataPath);
                } else {
                    data[vm] = defaultValue;
                }
            });
        }

        return data;
    },
    getDataTextSync: function(currentModule, contentKeys, config, defaultValue) {
        if(_.isUndefined(defaultValue)) {
            defaultValue = {};
        }

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
                    pathPrefix = type == 'vmcommon' ? config.common[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.json'));
                //get data
                if(fs.existsSync(dataPath)) {
                    var json = fileUtil.getFileContentSync(dataPath, config['encoding'] || 'gbk', '');
                    data[vm] = {
                        text: json,
                        real: dataPath
                    };
                } else {
                    data[vm] = {
                        text: defaultValue,
                        real: dataPath
                    };
                }
            });
        }

        return data;
    },
    getCustomDataSync:function(currentModule, contentKeys, config, defaultValue, appendRealPath){
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
                    pathPrefix = type == 'vmcommon' ? config.common[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.js'));
                //get data
                if(fs.existsSync(dataPath)) {
                    if(appendRealPath) {
                        data[vm] = {
                            text: fileUtil.getFileContentSync(dataPath, config['encoding'] || 'gbk', ''),
                            real: dataPath
                        };
                    } else {
                        data[vm] = fileUtil.getFileContentSync(dataPath, config['encoding'] || 'gbk', '');
                    }
                } else {
                    if(appendRealPath) {
                        if(!_.isUndefined(defaultValue)) {
                            data[vm] = {
                                text: defaultValue,
                                real: dataPath
                            };
                        }
                    } else {
                        data[vm] = defaultValue;
                    }
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
                content.push(fileUtil.getFileContentSync(path.join(config['webRoot'], macro), config['encoding'] || 'gbk'), '');
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