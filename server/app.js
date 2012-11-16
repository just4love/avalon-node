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
    , iconv = require('iconv-lite')
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

app.get('*.info', checkConfig, function(req, res, next){
    var useApp = userCfg.get('use');
    var config = util.merge({}, userCfg.get('apps')[useApp]);
    config.vmcommon = userCfg.get('vmcommon');

    res.render('info', render.getInfo({
        app: useApp,
        config: config,
        path: req.params[0]
    }));
});

var isLocalFile = function(uri){
    //过滤时间戳
    uri = uri.replace(/\?.*/, '');
    if(process.platform == 'win32') {
        return uri.indexOf(':') != -1;
    } else {
        if(fs.existsSync(path.resolve(uri))) {
            return true;
        }

        return uri.indexOf('/home') != -1 || uri.indexOf('/Users') != -1;
    }
};

var processUrl = function(uri, domain,  callback){
    var rules = userCfg.get('rules'),
        proxyDomain = userCfg.get('proxyDomain'),
        isMatch = false,
        matchRule;

    rules.forEach(function(rule){
        if(!isMatch && rule.enable) {
            var pattern = new RegExp(rule.pattern, 'g');
            if(pattern.test(uri)) {
                uri = uri.replace(pattern, rule.target);
                matchRule = rule;
                isMatch = true;
            }
        }
    });

    if(!isMatch) {
        if(!proxyDomain[domain]) {
            console.log('请配置一条域名转换以避免死循环, domain='+domain);
        }
        //没匹配到的，必须要过滤域名为ip
        uri = proxyDomain[domain] + uri;
    } else if(!isLocalFile(uri)) {
        if(!proxyDomain[domain]) {
            console.log('请配置一条域名转换以避免死循环, domain='+domain);
        }
        uri = proxyDomain[domain] + uri;
    }

    callback(uri, matchRule);
};

var contentType = {
    '.js':'application/x-javascript;',
    '.css':'text/css;',
    '.swf':'application/x-shockwave-flash;',
    '.png': 'image/png;',
    '.gif': 'image/gif;',
    '.jpg': 'image/jpeg;'
};

app.get('(*??*|*.(css|js|ico|png|jpg|swf|less|gif))', function(req, res, next){
    var host = req.headers.host;

    if(host.indexOf('127.0.0.1') == -1 && host.indexOf('localhost') == -1
        && (/\.(css|js|ico|png|jpg|swf|less|gif)/.test(req.url) || req.url.indexOf("??") != -1)) {
        var paths;
        //combo
        if(req.url.indexOf('??') != -1) {
            var p =  url.parse(req.url);
            paths = comboParser(p.path);
        } else {
            paths = [req.url];
        }

        res.setHeader('Content-type', contentType[path.extname(paths[0].replace(/\?.*/, ''))]);

        async.forEachSeries(paths, function(p, callback){
            processUrl(p, req.headers.host, function(uri, rule){
                if(isLocalFile(uri)) {
                    uri = uri.replace(/\?.*/, '');

                    if(fs.existsSync(uri)) {
                        var stream = fs.createReadStream(uri);
                        res.write('/*'+uri+'*/\r\n');
                        stream.pipe(res, { end: false });
                        stream.on('end', callback);
                        stream.on('error', callback);
                    } else {
                        res.statusCode = 404;
                        res.write('get 404 ' + uri);
                        res.end();
                    }
                } else {
                    request.get({
                        url:  'http://' + uri,
                        encoding: null
                    }, function (error, response, body) {
                        if(error) {
                            res.write(error.toString() + ', uri=http://' + uri);
                        }

                        if(!response) {
                            console.log('connect fail: ' + uri);
                        } else if(response.statusCode == 200) {
                            res.write(error ? error.toString(): body);
                        } else if(response.statusCode == 404) {
                            res.write(error ? error.toString(): body);
                        }
                        callback(error);
                    });
                }
            });
        }, function(err){
            res.end();
        });
    } else {
        next();
    }
});

app.get('/', routes.index);
app.get('/proxy', routes.proxy);
app.post('/proxy/:operate', routes.proxyOperate);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
    console.log('请使用 Control+C 来关闭控制台');
});
