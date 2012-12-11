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
                urls: result,
                checkUpgrade: new Date().getTime() - userCfg.get('lastCheckTime') >= 259200000 //大于3天升级
            });
        });
    } else {
        res.render('list', {
            apps:_.keys(apps),
            checkUpgrade: new Date().getTime() - userCfg.get('lastCheckTime') >= 259200000 //大于3天升级
        });
    }
};