
/*
 * GET home page.
 */
var webx = require('../../lib/webx/webx'),
    util = require('../../lib/util/util'),
    path = require('path'),
    userCfg = require('../../lib/userConfig');

var App = {
    find: function(params, cb) {
        webx.getConfig(params.root, function(err, result) {
            cb(err, util.json2Tree(result));
        });
    },
    load: function(appName) {
        var json = userCfg.get('apps')[appName];
        return util.json2Tree(json);
    },
    add: function(params, cb){
        webx.getConfig(params.root, function(err, result) {
            var appName = path.basename(params.root);
            var apps = userCfg.get('apps');
            apps[appName] = result;
            userCfg.set('apps', apps);
            userCfg.set('use', appName);
            userCfg.save(function(err){
                cb(err);
            });
        });
    }
};


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
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