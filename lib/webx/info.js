/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var webx = require('./webx'),
    util = require('../util/util'),
    fs = require('fs'),
    _ = require('underscore'),
    FILE_NOT_EXIST = 'NOT_EXIST_FILE';

module.exports = {
    collectInfo:function (cfg) {
        if(cfg.target.indexOf('/') == 0) {
            cfg.target = cfg.target.substring(1);
        }

        var m = webx.findModule(cfg.target, cfg.config);

        var target = webx.getNormalScreenPath(cfg.target, m, cfg.config);

        var contentList = webx.getContentSync(target, m ,cfg.config);

        var staticData = webx.getDataSync(m, _.keys(contentList), cfg.config, FILE_NOT_EXIST, true);

        var dynamicData = webx.getCustomDataSync(m, _.keys(contentList), cfg.config, FILE_NOT_EXIST, true);

        //说明没有模板
        if(_.isEmpty(contentList) || !_.has(contentList, target)) {
            return {};
        } else {
            return {
                appname: cfg.app,
                templates: JSON.stringify(util.json2Tree(webx.getIncludeVm(target, m, cfg.config))),
                keys: JSON.stringify(webx.getKeys(contentList), null, 4),
                staticData: JSON.stringify(staticData[target].text, null, 4),
                dynamicData: dynamicData[target].text
            }
        }
    }
};