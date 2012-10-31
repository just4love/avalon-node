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
    util = require('./util/util');

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
        env = util.merge(Env, env, ['host', 'cfg', 'port', 'api']);

        var consoleParam = [];
        _.each(env, function(value, idx){
            consoleParam.push('--'+idx);
            consoleParam.push(value);
        });

        var child = cp.fork(path.resolve(__dirname, '../server/app.js'), consoleParam, {
            env : {
                'NODE_ENV': 'production'
                // 'NODE_ENV': 'development'
            }
        });

        var proxyParam = [],
            proxyEnv = {
                cfg:Env.proxyCfg,
                port: Env.proxyPort
            };
        _.each(proxyEnv, function(value, idx){
            proxyParam.push('--'+idx);
            proxyParam.push(value);
        });

        cp.fork(path.resolve(__dirname, '../server/proxy.js'), proxyParam, {
            env : {
                'NODE_ENV': 'production'
            }
        });

        if(env.open === 'true') {
            startWeb([
                'http://',
                env.host,
                ':',
                env.port
            ].join(''));
        }
    },
    help: function(){

    }
};