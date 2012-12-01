var path = require('path'),
    userCfg = require('../../lib/config/userConfig'),
    _ = require('underscore'),
    webx = require('../../lib/webx/webx');
/*
 * GET users listing.
 */

exports.list = function(req, res){
    var appname = req.params.appname,
        apps = userCfg.get('apps');
    if(appname && apps[appname]) {
        webx.getScreenUrl(apps[appname], function(err, result){
            res.render('detail', {
                appname:appname,
                data:apps[appname],
                urls: result
            });
        });
    } else {
        res.render('list', {
            apps:_.keys(apps)
        });
    }
};