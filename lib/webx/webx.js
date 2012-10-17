var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    finder = require('./finder');

var isWindows = function(){
    return process.platform == 'win32';
};

var getLayout = function() {

};

module.exports = {
    getConfig: function(root, cb){
        root = path.resolve(root);
        if(!fs.existsSync(root)) {
            cb('directory not found');
        }
        var stat = fs.statSync(root);
        if(stat.isFile()) {
            root = path.dirname(root);
        }

        var appName = path.basename(root);
        var config = {};
        config[appName] = {};
        config[appName]['root'] = root;

        async.waterfall([
            function(callback){
                finder.findWebroot(root, function(result) {
                    if(result.length > 0) {
                        config[appName]['webRoot'] = result[0];
                        callback(null, result[0]);
                    } else {
                        callback('webRoot not found');
                    }
                });
            },
            function(webroot, callback){
                finder.findMacros(webroot, function(result) {

                });
            },
            function(callback){
                finder.findSubModule(root, function(result) {

                });
            },
            function(callback){
                finder.findTools(root, function(result) {

                });
            }
        ], function (err, result) {
                // result now equals 'done'
        });
    },
    getContent: function(path){

    }
};