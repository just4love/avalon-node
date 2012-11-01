/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , render = require('../lib/render')
    , userCfg = require('../lib/userConfig')
    , argv = require('optimist').argv
    , util = require('../lib/util/util')
    , cons = require('consolidate')
    , _ = require('underscore')
    , url = require('url')
    , fs = require('fs')
    , comboParser = require('combo-url-parser')
    , request = require('request')
    , async = require('async');

userCfg.init({
    cfg:argv.cfg,
    api: argv.api
});

var checkConfig = function(req, res, next){
    var apps = userCfg.get('apps');
    if(apps && !_.isEmpty(apps)) {
        next();
    } else {
        res.redirect('/');
    }
};

var app = express();

app.configure(function () {
    app.set('port', argv.port || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.engine('html', cons.jazz);
    app.use(express.favicon());
//    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.get('/list/(:appname)?', user.list);
app.all('/app/:operate', routes.operate);

app.all('/*.(*htm*|do)', checkConfig, function(req, res, next){
    var useApp = userCfg.get('use');
    var config = util.merge({}, userCfg.get('apps')[useApp]);
    config.vmcommon = userCfg.get('vmcommon');

    var template = render.parse({
        app: useApp,
        config: config,
        path: req.params[0],
        api: userCfg.get('api'),
        parameters: req.method == 'get' ? req.query : req.body
    });

    if(template) {
        template.render(req, res);
    } else {
        res.render('404', { url: req.url });
    }
});

var isLocal = function(url){
    //过滤时间戳
    url = url.replace(/\?.+/, '');
    return fs.existsSync(path.resolve(url));
};

var processUrl = function(url){
    var rules = userCfg.get('rules'),
        isMatch = false;

    rules.forEach(function(rule){
        if(!isMatch) {
            var pattern;
            if(rule.type == 'string') {
                pattern = rule.pattern;
                if(url.indexOf(pattern) != -1) {
                    url = url.replace(pattern, rule.target);
                    if(rule.proxyDomain) {
                        url = 'http://' + rule.proxyDomain + url;
                    }
                    isMatch = true;
                }
            } else if(rule.type == 'regexp'){
                pattern = new RegExp(rule.pattern, 'g');
                if(pattern.test(url)) {
                    url = url.replace(pattern, rule.target);
                    if(rule.proxyDomain) {
                        url = 'http://' + rule.proxyDomain + url;
                    }
                    isMatch = true;
                }
            }
        }
    });

    return url;
};

var contentType = {
    '.js':'text/javascript',
    '.css':'text/css'
};

app.get('(*??*|*.(css|js|ico|png|jpg|swf|less|gif))', function(req, res, next){
    if(req.headers.host.indexOf('127.0.0.1') == -1
        && (/\.(css|js|ico|png|jpg|swf|less|gif)/.test(req.url) || req.url.indexOf("??") != -1)) {
        var paths;
        //combo
        if(req.url.indexOf('??') != -1) {
            var p =  url.parse(req.url);
            paths = comboParser(p.path);
        } else {
            paths = [req.url];
        }

        res.setHeader('Content-type', contentType[path.extname(paths[0])]);

        async.forEach(paths, function(p, callback){
            var url = processUrl(p);

            if(isLocal(url)) {
                url = url.replace(/\?.+/, '');
                fs.readFile(url, '', function(err, data){
                    res.write(err ? err: data);
                    callback(err);
                });
            } else {
                request.get(url, function (error, response, body) {
                    if(error) {
                        res.write(error.toString() + ', url=' + url);
                    }

                    if(response.statusCode == 200) {
                        res.write(error ? error.toString(): body);
                    } else if(response.statusCode == 404) {
                        res.write(error ? error.toString(): body);
                    }
                    callback(error);
                });
            }
        }, function(err){
            res.end();
        });
    } else {
        next();
    }
});

app.get('/', routes.index);
app.get('/proxy', routes.proxy);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});