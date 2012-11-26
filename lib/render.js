/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */

var Template = require('./webx/template'),
    info = require('./webx/info'),
    _ = require('underscore');

var getTarget = function(p) {
    var t =  p.split('/'),
        oldNames = t.pop().split('_'),
        newNames = [];

    _.each(oldNames, function(v, idx) {
        if(idx != 0) {
            newNames.push(v.substring(0, 1).toUpperCase() + v.substring(1));
        } else {
            newNames.push(v);
        }
    });

    t.push(newNames.join(''));

    return t.join('/') + '.vm';
};

module.exports = {
    parse: function(cfg){
        cfg.target = getTarget(cfg.path);

        var template = new Template(cfg);

        if(template.target) {
            return template;
        } else {
            return null;
        }
    },
    getInfo: function(cfg) {
        cfg.target = getTarget(cfg.path);

        return info.collectInfo(cfg);
    }
};