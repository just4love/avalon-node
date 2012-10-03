/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var os = require('os'),
    cp = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    nconf = require('nconf'),
    fileUtil = require('./file/fileUtil'),
    App = require('../server/app'),
    Env = require('./env');

function startWeb (url) {
    switch (os.platform()) {
        case 'win32':
            console.log('opening...');
            cp.exec('start ' + url);
            break;
        case 'darwin':
            console.log('opening...');
            cp.exec('open ' + url);
            break;
        default:
            console.log('please open %s in your browser', url);
    }
}

function loadConfig(env, callback) {
    // load env vars
    nconf.env();

    var localConfigPath = path.resolve(env.cfg || nconf.get('HOME') + Env.defaultConfigName);
    // save config path
    nconf.file({ file: localConfigPath });

    // first init
    if(!fs.existsSync(localConfigPath)) {
        try {
            fileUtil.mkdirp.sync(path.dirname(localConfigPath));

            nconf.save(function(err){
                if(err) {
                    callback(err);
                }
            });
        } catch (ex) {
            callback(ex);
        }
    }

    return {
        host: Env.defaultHost,
        port: env.port || Env.defaultPort,
        cfg: env.cfg || Env.defaultConfigName,
        nconf: nconf
    }
}

module.exports = {

    web: function (bin, callback) {
        var env = bin.argv;
        var cfg = loadConfig(env, callback);

        App.init(cfg);

        startWeb([
            'http://',
            cfg.host,
            ':',
            cfg.port
        ].join(''));
    },
    help: function(){

    }
};