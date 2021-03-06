/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var webx = require('./webx'),
    util = require('../util/util'),
    fs = require('fs'),
    _ = require('underscore'),
    velocityParser = require('velocity-parser'),
    FILE_NOT_EXIST = 'NOT_EXIST_FILE';

module.exports = {
    collectInfo:function (cfg, callback) {
        if(cfg.target.indexOf('/') == 0) {
            cfg.target = cfg.target.substring(1);
        }

        var m = webx.findModule(cfg.target, cfg.config);

        var target = webx.getNormalScreenPath(cfg.target, m, cfg.config);

        var contentList = webx.getContentSync(target, m ,cfg.config);

        var staticData = webx.getDataTextSync(m, _.keys(contentList), cfg.config, FILE_NOT_EXIST, true);

        var dynamicData = webx.getCustomDataSync(m, _.keys(contentList), cfg.config, FILE_NOT_EXIST, true);

        webx.getLayouts(target, m, cfg.config, function(err, layouts){

            var globalData = util.removeComments(staticData[target].text);

            //说明没有模板
            if(_.isEmpty(contentList) || !_.has(contentList, target)) {
                callback(err, {});
            } else {
                callback(err, {
                    appname: cfg.app,
                    target: target,
                    templates: JSON.stringify(util.json2Tree(webx.getIncludeVm(target, m, cfg.config))),
                    keys: velocityParser.toJSONTree(target, contentList)[target],
                    staticData: staticData[target].text,
                    staticPath: staticData[target].real,
                    dynamicData: dynamicData[target].text,
                    dynamicPath: dynamicData[target].real,
                    layouts: layouts,
                    isJsonData: globalData===staticData[target].text
                });
            }
        });
    }
};