/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var cp = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    Env = require('./env'),
    _ = require('underscore'),
    util = require('./util/util'),
    http = require('http'),
    https = require('https');

function startWeb (url) {
    switch (process.platform) {
        case 'win32':
            console.log('opening...');
            cp.exec('start ' + url);
            break;
        case 'darwin':
            console.log('opening...');
            cp.exec('open ' + url);
            break;
        case 'linux':
            console.log('opening...');
            cp.exec('open ' + url);
            break;
        default:
            console.log('please open %s in your browser', url);
    }
}

module.exports = {

    web: function (bin, callback) {
        var env = bin.argv;
        env = util.merge(Env, env, ['host', 'cfg', 'port', 'api', 'open']);

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

        if(env.open === 'true') {
            setTimeout(function () {
                startWeb([
                    'http://',
                    env.host,
                    ':',
                    env.port
                ].join(''));
            }, 300);
        }
    },
    help: function(){
        startWeb("https://github.com/czy88840616/avalon-node/wiki");
    }
};