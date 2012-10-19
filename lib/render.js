/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */

var Template = require('./webx/template');

module.exports = {
    parse: function(cfg, env){
        var path = cfg.path;
        cfg.target = path + '.vm';

        var template = new Template(cfg);



        return template;
    }
};