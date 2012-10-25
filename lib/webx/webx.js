var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    colors = require('colors'),
    util = require('../util/util'),
    iconv = require('iconv-lite'),
    finder = require('./finder');

var getLayout = function(p) {
    return p.replace('screen', 'layout');
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
var findModule = function(p){
    var t = p.split('/');

    if(t.length <= 1) {
        return null;
    }

    var module = t.shift();
    if(module.indexOf(':') != -1) {
        //trade:test.vm
        return module.split(':')[0];
    } else {
        return module;
    }
};

/**
 * 查找文件内容中的模板
 * @param content
 */
var includeTemplate = function(content){
    var includes = [];

    var result = content.match(/(#parse|\$control.setTemplate).*?\.vm('|")\)/g);
    result && result.forEach(function(v) {
        var parseType = v.indexOf('#parse') != -1;
        if(parseType) {
            v = v.replace(/#parse\(('|")\s*/, '');
        } else {
            v = v.replace(/\$control.setTemplate\(('|")\s*/, '');
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

/**
 * 从文件中获取模板
 * @param p {String} e.g. screen/test.vm|control/test.vm|layout/test.vm
 * @param module {String} e.g. auction
 * @param config {Object} the config of current module
 * @param content {Object} global config to store the content
 * @param cb
 */
    /*
var getTemplatesInFile = function(p, module, config, content, cb) {

    function getTemplates(p, module, config, content, callback){
        var t = p.split('/'),
            type = t.shift();

        fs.readFile(path.join(config[type], t.join(path.sep)), function(err, data){
            content[p] = data.toString();
            var includes = includeTemplate(content[p]);
            async.forEach(includes, function(include, callback){
                if(!content[include]) {
                    getTemplates(include, module, config, content, callback);
                }
            }, callback);
        });
    }

    getTemplates(p, module, config, content, function(err, result){
        if(err) {
            cb(err);
        } else {
            cb(err, content);
        }
    });
};
*/
var getTemplatesInFileSync = function(p, module, config){
    var content = {};

    function getTemplates(p, module){
        var t = p.split('/'),
            type = t.shift(),
            pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][module][type];

        var vmPath = path.join(pathPrefix, t.join(path.sep));
        content[p] = getFileContentSync(vmPath, 'gbk');

        var includes = includeTemplate(content[p]);
        includes.forEach(function(include){
            if(!content[include]) {
                getTemplates(include, module);
            }
        });
    }

    getTemplates(p, module);

    var layout = getLayout(p);
    getTemplates(layout, module);

    return content;
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
            },
            function(webroot, callback){
                finder.findTools(webroot, function(err, result) {
                    app['tools'] = result;
                    callback(null, webroot);
                });
            }
        ], function (err, result) {
            config[appName] = app;
            cb(err, app);
        });
    },
    getContent: function(p, config, cb){
        var content = {},
            module = findModule(p);

        if(p.indexOf('/') == 0) {
            p = p.substring(1);
        }

        //e.g. /auction/order/buynow.vm
        if(module && config['subModule'][module]) {
            var t = p.split('/');
            t.shift();
            t.unshift('screen');

            getTemplatesInFile(t.join('/'), module, config['subModule'][module], content, function(err){
                if(err) {
                    cb(err);
                } else {
                    cb(err, content);
                }
            });
        }
    },
    getContentSync: function(p, config){
        var module = findModule(p);

        //e.g. /auction/order/buynow.vm
        if(module && config['subModule'][module]) {
            var t = p.split('/');
            t.shift();
            t.unshift('screen');

            return getTemplatesInFileSync(t.join('/'), module, config);
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
            contentKeys.forEach(function(vm){
                var t = vm.split('/');
                var type = t.shift(),
                    pathPrefix = type == 'vmcommon' ? config[type]: config['subModule'][currentModule][type];

                var dataPath = path.join(pathPrefix, t.join(path.sep).replace('.vm', '.json'));
                //get data
                if(fs.existsSync(dataPath)) {
                    var json = getFileContentSync(dataPath, 'gbk');
                    data[vm] = getDataJSON(json, dataPath);
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
                content.push(getFileContentSync(path.join(config['webRoot'], macro), 'gbk'));
            });

            return content.join('\r\n');
        }
        return '';
    }
};