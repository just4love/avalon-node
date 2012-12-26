var path = require('path');
var async = require('async');
var fs = require('fs');
var _ = require('underscore');
var walk = require('walkdir');
var iconv = require('iconv-lite');

var findDirectory = exports.findDirectory = function(path_name, feature, cb){
    var emitter = walk(path_name),
        result = [];

    emitter.on('directory', function(filename,stat) {
        if(filename.indexOf('.svn') > -1 || filename.indexOf('.git') > -1) return;

        if(_.isFunction(feature)) {
            if(feature(filename)) {
                result.push(filename);
            }
        } else {
            if(feature.test(filename)) {
                result.push(filename);
            }
        }
    });

    emitter.on('end', function(){
        cb(null, result);
    });

    emitter.on('error', function(err){
        cb(err);
    });

    emitter.on('fail', function(err){
        cb(err);
    });
};

var findInDir = exports.findInDir = function (path_name, reg, callback) {

    if (!callback && typeof reg === 'function') {
        callback = reg;
        reg = null;
    }

    path_name = path.resolve(path_name);

    function listdir(dir, callback) {

        fs.readdir(dir, function (err, list) {
            if (err) {
                return callback(err);
            }

            list = list.filter(function (file) {
                if (file) {
                    return file !== '.svn' || file !== '.git';
                }
            });

            async.map(list, function (p, callback) {
                var abs = path.resolve(dir, p);

                fs.stat(abs, function (err, stat) {
                    if (err) {
                        return callback(err);
                    }
                    if (stat.isDirectory()) {
                        listdir(abs, callback);
                    } else {
                        callback(null, abs);
                    }
                })
            }, callback);
        });
    }

    fs.exists(path_name, function (exist) {
        if (!exist) {
            return callback(new Error('findInDir: path ' + path_name + ' not exist;'));
        }
        listdir(path_name, function (err, list) {
            if (err) {
                return callback(err);
            }
            var result = _.chain(list)
                .flatten()
                .map(function (p) {
                    return path.relative(path_name, p);
                })
                .filter(function (p) {
                    if (reg instanceof RegExp) {
                        return reg.test(p);
                    } else if(_.isFunction(reg)) {
                        return reg(p);
                    }
                    return true;
                })
                .value();
            callback(null, result);
        });
    });


};

/**
 * copy the entire directory
 * @param  {String} src_path    path of the directory copy from
 * @param  {String} target_path path of the directory to copy to
 * @param  {Object} config      config of copy
 * @return {[type]}             [description]
 */
var copyDirSync = exports.copyDirSync = function (src_path, target_path, config) {

    src_path = path.resolve(src_path);
    target_path = path.resolve(target_path);

    config = config || {};

    if (src_path === target_path) {
        throw new Error('copyDirSync: src_path is target_path!')
    }

    if (!fs.existsSync(src_path)) {
        throw new Error('copyDirSync: path not exist;');
    }

    if (!fs.existsSync(target_path)) {
        fs.mkdirSync(target_path);
    }


    fs.readdirSync(src_path).forEach(function (p) {
        var skip = false;
        if (config.excludes) {
            config.excludes.forEach(function (reg) {
                if (reg instanceof RegExp) {
                    if (!skip && reg.test(p)) {
                        skip = true;
                    }
                } else if (reg instanceof String) {
                    if (!skip && reg.test(p)) {
                        skip = true;
                    }
                }
            });
        }

        if (skip) {
            return;
        }

        var src = path.resolve(src_path, p),
            dst = path.resolve(target_path, p),
            stat = fs.statSync(src);
        if (stat.isDirectory(src)) {
            copyDirSync(src, dst);
        } else {
            fs.writeFileSync(dst, fs.readFileSync(src));
        }
    });
}

var findInBuffer = exports.findInBuffer = function(text, content){
    if(content) {
        return content.toString().indexOf(text) > -1;
    }
    return false;
};

var getFileContentSync = exports.getFileContentSync = function(p, encoding, defaultValue) {
    if(_.isUndefined(defaultValue)) {
        defaultValue = '';
    }

    if(encoding == 'gbk') {
        encoding = '';
    }
    //get data
    if(fs.existsSync(p)) {
        var content = fs.readFileSync(p, encoding);
        if(encoding == '') {
            content = iconv.decode(content, 'gbk');
        }

        return content || '';
    }
    return defaultValue;
};