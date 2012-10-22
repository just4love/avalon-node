
/*
 * GET home page.
 */
var webx = require('../../lib/webx/webx'),
    util = require('../../lib/util/util'),
    userCfg = require('../../lib/userConfig');

var App = {
    find: function(p, cb) {
        webx.getConfig(params.root, function(err, result) {
            cb(err, result);
        });
    },
    load: function(appName) {
        var json = userCfg.get('apps')[appName];
        return util.json2Tree(json);
    }
};


exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.operate = function(req, res){
    var operate = req.operate;

    var params = req.method == 'GET' ? req.query : req.body;

    App[operate](params, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });

};