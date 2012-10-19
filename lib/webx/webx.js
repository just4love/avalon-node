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
    /**
     * 获取一个新应用的所以配置
     * @param root
     * @param cb
     */
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

        var app = {
            root:root
        };

        async.waterfall([
            function(callback){
                finder.findWebroot(root, function(err, result) {
                    if(err) {
                        callback(err);
                    }
                    console.log(result);
                    if(result.length > 0) {
                        app['webRoot'] = result[0];
                        callback(null, result[0]);
                    } else {
                        callback(err);
                    }
                });
            },
            function(webroot, callback){
                finder.findMacros(webroot, function(err, result) {
                    app['macros'] = result;
                    callback(null, webroot);
                });
            },
            function(webroot, callback){
                finder.findSubModule(webroot, function(err, result) {
                    app['subModule'] = result;
                    callback(null, webroot);
                });
            },
            function(webroot, callback){
                finder.findTools(webroot, function(err, result) {
                    app['tools'] = result;
                    callback(null, webroot);
                });
            }
        ], function (err, result) {
            config[appName] = app;
            cb(err, app);
        });
    },
    getContent: function(path){

    }
};