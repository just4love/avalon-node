/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
*/
var easyconf = require('easyconf'),
    fs = require('fs'),
    path = require('path'),
    conf;

var _save = function(callback){
    conf.save(function(err){
        if(err) {
            callback(err);
        }else {
            callback(null);
        }
    });
};

module.exports = {
    init:function(argv, callback){
        conf = new easyconf(argv.cfg);
    },
    getSnapShot: function(key){
        var snaps  = conf.get('snapshots') || {};
        return snaps[key];
    },
    setSnapShot: function(key, value, callback){
        var snaps  = conf.get('snapshots') || {};
        snaps[key] = value;
        conf.set('snapshots', snaps);

        _save(callback);
    },
    deleteSnapShot: function(key, callback){
        var snaps  = conf.get('snapshots') || {};
        delete snaps[key];
        conf.set('snapshots', snaps);

        _save(callback);
    },
    getSnapShots: function(){
        return conf.get('snapshots') || {};
    },
    save: _save
};