
/*
 * GET home page.
 */
var webx = require('../../lib/webx/webx'),
    util = require('../../lib/util/util'),
    path = require('path'),
    _ = require('underscore'),
    userCfg = require('../../lib/userConfig');

var App = {
    find: function(params, cb) {
        webx.getConfig(params.root, function(err, result) {
            if(err) {
                cb(err);
            } else {
                var data = {
                    tree:util.json2Tree(result),
                    subModule:_.keys(result['subModule'])
                };
                cb(err, data);
            }
        });
    },
    load: function() {
        return {
            apps:_.keys(userCfg.get('apps')),
            use:userCfg.get('use'),
            vmcommon:userCfg.get('vmcommon')
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

        webx.getConfig(root, function(err, result) {
            var appName = path.basename(root);
            result.encoding = encoding;
            result.defaultModule = defaultModule;

            var apps = userCfg.get('apps');
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
        vmcommon = path.resolve(vmcommon);

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