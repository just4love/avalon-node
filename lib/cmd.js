/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var cp = require('child_process'),
    path = require('path'),
    Env = require('./env'),
    _ = require('underscore'),
    util = require('./util/util');

module.exports = {

    web: function (bin, callback) {
        var env = bin.argv;
        env = util.merge(Env, env, ['cfg', 'port']);

        var p = [];
        _.each(env, function(value, idx){
            p.push('--'+idx);
            p.push(value);
        });

        var child = cp.fork(path.resolve(__dirname, '../server/app.js'), p, {
            env : {
                'NODE_ENV': 'production'
                // 'NODE_ENV': 'development'
            }
        });
    },
    help: function(){
        util.startWeb("https://github.com/czy88840616/avalon-node/wiki");
    }
};