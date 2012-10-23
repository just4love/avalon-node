
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
            cb(err, util.json2Tree(result));
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
        webx.getConfig(params.root, function(err, result) {
            var appName = path.basename(params.root);
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