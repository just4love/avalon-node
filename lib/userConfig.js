/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
*/
var nconf = require('nconf'),
    fs = require('fs'),
    fileUtil = require('./util/fileUtil'),
    path = require('path');

module.exports = {
    init:function(cfg, callback){
        console.log(cfg);
        nconf.env()
            .file({ file: cfg });

        // first init
        if(!fs.existsSync(cfg)) {
            nconf.set('apps', {});
            nconf.set('use', '');
            try {
                fileUtil.mkdirp.sync(path.dirname(cfg));

                nconf.save(function(err){
                    if(err) {
                        callback(err);
                    }
                });
            } catch (ex) {
                callback(ex);
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