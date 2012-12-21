/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
*/
var nconf = require('nconf'),
    fs = require('fs'),
    fileUtil = require('../util/fileUtil'),
    mkdirp = require('mkdirp'),
    path = require('path');

var updateCfg = function(){
    var hasModified = false;
    if(!nconf.get('apps')) {
        nconf.set('apps', {});
        nconf.set('use', '');
        hasModified = true;
    }

    if(!nconf.get('api')) {
        nconf.set('api', 'http://v.taobao.net/render.do');
        hasModified = true;
    }

    if(!nconf.get('rules'))  {
        nconf.set('rules', [
            {
                "pattern":"kissy-min",
                "target":"kissy",
                "charset":"utf-8",
                "enable":false
            }
        ]);
        hasModified = true;
    }

    if(!nconf.get('proxyDomain')) {
        nconf.set('proxyDomain', {
            'assets.daily.taobao.net':'10.232.16.2'
        });
        hasModified = true;
    }

    if(!nconf.get('open')) {
        nconf.set('open', false);
        hasModified = true;
    }

    if(!nconf.get('lastCheckTime')) {
        nconf.set('lastCheckTime', new Date().getTime());
        hasModified = true;
    }

    if(!nconf.get('type')) {
        nconf.set('type', 'taobao');
        hasModified = true;
    }

    if(!nconf.get('common')) {
        nconf.set('common', {});
        hasModified = true;
    }

    if(nconf.get('vmcommon')) {
        var common = nconf.get('common');
        common.vmcommon = nconf.get('vmcommon');
        nconf.set('common', common);
        nconf.set('vmcommon', null);
        hasModified = true;
    }

    return hasModified;
};

module.exports = {
    init:function(argv, callback){
        nconf.env()
            .file({ file: argv.cfg });

        // first init
        if(!fs.existsSync(argv.cfg)) {
            nconf.set('apps', {});
            nconf.set('use', '');
            nconf.set('api', 'http://v.taobao.net/render.do');
            nconf.set('proxyDomain', {
                'assets.daily.taobao.net':'10.232.16.2'
            });
            nconf.set('rules', [
                {
                    "pattern":"kissy-min",
                    "target":"kissy",
                    "charset":"utf-8",
                    "enable":true
                }
            ]);
            nconf.set('open', false);
            nconf.set('lastCheckTime', new Date().getTime());
            nconf.set('common', {});
            try {
                mkdirp.sync(path.dirname(argv.cfg));

                nconf.save(function(err){
                    if(err) {
                        callback(err);
                    }
                });
            } catch (ex) {
                callback(ex);
            }
        } else {
            if(updateCfg()) {
                nconf.save(function(err){
                    if(err) {
                        callback(err);
                    }
                });
            }
        }
    },
    get: function(key){
        return nconf.get(key);
    },
    set: function(key, value){
        nconf.set(key, value);
    },
    save: function(callback){
        nconf.save(function(err){
            if(err) {
                callback(err);
            }else {
                callback();
            }
        });
    }
};