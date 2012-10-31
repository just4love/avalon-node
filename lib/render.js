/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */

var Template = require('./webx/template');

module.exports = {
    parse: function(cfg){
        var path = cfg.path,
            t =  path.split('/'),
            oldNames = t.pop().split('_'),
            newNames = [];

        oldNames.forEach(function(v, idx) {
            if(idx != 0) {
                newNames.push(v.substring(0, 1).toUpperCase() + v.substring(1));
            } else {
                newNames.push(v);
            }
        });

        t.push(newNames.join(''));

        cfg.target = t.join('/') + '.vm';

        var template = new Template(cfg);

        if(template.target) {
            return template;
        } else {
            return null;
        }
    }
};