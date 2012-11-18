/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var webx = require('./webx'),
    util = require('../util/util'),
    _ = require('underscore');

module.exports = {
    collectInfo:function (cfg) {
        if(cfg.target.indexOf('/') == 0) {
            cfg.target = cfg.target.substring(1);
        }

        var m = webx.findModule(cfg.target, cfg.config);

        var target = webx.getNormalScreenPath(cfg.target, m, cfg.config);

        var contentList = webx.getContentSync(cfg.target, m ,cfg.config);

        return {
            appname: cfg.app,
            templates: JSON.stringify(util.json2Tree(webx.getIncludeVm(target, m, cfg.config))),
            keys: webx.getKeys(contentList, cfg)
        }
    }
};