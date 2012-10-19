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
    load:function(cfg){console.log(cfg);
        nconf.env()
             .file({ file: cfg });

        // first init
        if(!fs.existsSync(cfg)) {
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
    save: function(){

    }
};