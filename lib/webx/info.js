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

        return {
            templates: webx.getIncludeVm(cfg),
            keys: webx.getKeys(cfg)
        }
    }
};