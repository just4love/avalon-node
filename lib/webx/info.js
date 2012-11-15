/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var webx = require('./webx'),
    _ = require('underscore');

module.exports = {
    collectInfo:function (cfg) {
        if(cfg.target.indexOf('/') == 0) {
            cfg.target = cfg.target.substring(1);
        }

        var m = webx.findModule(cfg.target, cfg.config);

        var target = webx.getNormalScreenPath(cfg.target, m, cfg.config);

        return {
            templates: webx.getIncludeVm(target, m, cfg.config),
            keys: webx.getKeys(cfg)
        }
    }
};