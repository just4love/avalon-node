
/*
 * GET home page.
 */
var webx = require('../../lib/webx/webx'),
    util = require('../../lib/util/util'),
    path = require('path'),
    _ = require('underscore'),
    userCfg = require('../../lib/userConfig'),
    request = require('request');

var App = {
    find: function(params, cb) {
        webx.getConfig(params.root, function(err, result) {
            if(err) {
                cb(JSON.stringify({success:false, msg:err}));
            } else {
                var data = {
                    tree:util.json2Tree(result, {isLeafParent: true}),
                    subModule:_.keys(result['subModule'])
                };
                cb(err, JSON.stringify({success:true, data:data}));
            }
        });
    },
    load: function() {
        return {
            apps:_.keys(userCfg.get('apps')),
            use:userCfg.get('use'),
            vmcommon:userCfg.get('vmcommon'),
            open: userCfg.get('open')
        }
    },
    loadapps: function(params, cb){
        cb(null, {
            apps:_.keys(userCfg.get('apps')),
            use:userCfg.get('use')
        });
    },
    get: function(appName) {
        var json = userCfg.get('apps')[appName];
        return util.json2Tree(json)
    },
    add: function(params, cb){
        var root = params.root,
            encoding = params.encoding;
            defaultModule = params.defaultModule;

        root = root.replace(/(\\|\/)$/, '');
        webx.getConfig(root, function(err, result) {
            var appName = path.basename(root);
            result.encoding = encoding;
            result.defaultModule = defaultModule;

            var apps = userCfg.get('apps');
            if(apps[appName]) {
                //合并新旧同名应用
                var oldapp = apps[appName];
                result.tools = oldapp.tools || {};
            }

            apps[appName] = result;
            userCfg.set('apps', apps);
            userCfg.set('use', appName);
            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false,msg:err});
                } else {
                    cb(null, {success:true});
                }
            });
        });
    },
    remove: function(params, cb){
        var appName = params.appName;
        var apps = userCfg.get('apps');
        delete apps[appName];
        userCfg.set('apps', apps);
        var appsNames = _.keys(apps);
        userCfg.set('use', appsNames.length ? appsNames[0] : '');
        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    change: function(params, cb) {
        var appName = params.appName;
        userCfg.set('use', appName);
        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    setvmcommon: function(params, cb){
        var vmcommon = params.vmcommon;
        vmcommon = vmcommon.replace(/(\\|\/)$/, '');
        vmcommon = vmcommon ? path.resolve(vmcommon):vmcommon;

        if(vmcommon == userCfg.get('vmcommon')) {
            //cache
            cb(null, {success:true});
        } else {
            userCfg.set('vmcommon', vmcommon);
            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false,msg:err});
                } else {
                    cb(null, {success:true});
                }
            });
        }
    },
    setopen: function(params, cb) {
        var open = params.open === 'true';

        userCfg.set('open', open);
        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    settools: function(params, cb){
        var tools = params.tools,
            appname = params.app;

        var apps = userCfg.get('apps');
        apps[appname].tools = tools;
        userCfg.set('apps', apps);

        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    removetool: function(params, cb){
        var key = params.toolkey,
            appname = params.app;

        var apps = userCfg.get('apps');
        delete apps[appname].tools[key];
        userCfg.set('apps', apps);

        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    loadtools: function(params, cb){
        var appname = params.app;
        var apps = userCfg.get('apps');
        cb(null, {success:true, tools:apps[appname].tools});
    },
    getlastest: function(params, cb){
        var pjson = require('../../package.json');
        request.get('https://registry.npmjs.org/avalon-node', function (error, response, body) {
            cb(null, {success:true, current:pjson.version, cfg: JSON.parse(body)});
        });
    },
    update: function(params, cb){
        var appname = params.app,
            apps = userCfg.get('apps'),
            oldapp = apps[appname];

        if(!oldapp) {
            cb(null, {success:false,msg:'当前应用配置不存在'});
        } else {
            var root = oldapp.root;
            webx.getConfig(root, function(err, result) {
                var appName = path.basename(root);

                //合并新旧同名应用
                result.tools = oldapp.tools || {};

                apps[appName] = result;
                userCfg.set('apps', apps);
                userCfg.save(function(err){
                    if(err) {
                        cb(null, {success:false,msg:err});
                    } else {
                        cb(null, {success:true});
                    }
                });
            });
        }
    }
};


exports.index = function(req, res){
  res.render('index', App.load());
};

exports.operate = function(req, res){
    var operate = req.params.operate;

    var params = req.method == 'GET' ? req.query : req.body;

    App[operate](params, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
};

exports.proxy = function(req, res){
    res.render('proxy', {
        proxyDomain:userCfg.get('proxyDomain'),
        rules:userCfg.get('rules')
    });
};

var Proxy = {
    addDomain: function(params, cb){
        var domain = params.domain,
            proxyDomain = params.proxyDomain;

        var proxyDomains = userCfg.get('proxyDomain') || {};
        proxyDomains[domain] = proxyDomain;
        userCfg.set('proxyDomain', proxyDomains);

        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    removeDomain: function(params, cb){
        var domain = params.domain;

        var proxyDomains = userCfg.get('proxyDomain') || {};
        if(proxyDomains[domain]) {
            delete proxyDomains[domain];
        }

        userCfg.set('proxyDomain', proxyDomains);

        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    addRule: function(params, cb){
        var pattern = params.pattern,
            target = params.target,
            charset = params.charset || 'gbk';

        var rules = userCfg.get('rules') || [];
        rules.push({
            pattern: pattern,
            target: target,
            enable: true,
            charset: charset
        });

        userCfg.set('rules', rules);

        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    updateRule: function(params, cb){
        var rules = JSON.parse(params.rules) || [];

        userCfg.set('rules', rules);
        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    }
};

exports.proxyOperate = function(req, res){
    var operate = req.params.operate;

    var params = req.method == 'GET' ? req.query : req.body;

    Proxy[operate](params, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
};
