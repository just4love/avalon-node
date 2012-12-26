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
    , userCfg = require('../lib/config/userConfig')
    , snapCfg = require('../lib/config/snapConfig')
    , argv = require('optimist').argv
    , util = require('../lib/util/util')
    , cons = require('consolidate')
    , _ = require('underscore')
    , url = require('url')
    , fs = require('fs')
    , comboParser = require('combo-url-parser')
    , request = require('request')
    , iconv = require('iconv-lite')
    , colors = require('colors')
    , async = require('async');

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
    //这里编码就取当前使用的应用编码
    var useApp = userCfg.get('use'),
        config = util.merge({}, userCfg.get('apps')[useApp]);

    //真正的渲染
    config.type = userCfg.get('type');
    config.common = userCfg.get('common');

    var template = render.parse({
        app: useApp,
        config: config,
        path: req.params[0],
        api: userCfg.get('api'),
        parameters: req.method == 'GET' ? req.query : req.body
    });

    if(template) {
        template.render(req, res);
    } else {
        res.render('404', {
            app:useApp,
            url: req.url
        });
    }
});

app.get('*.snap', checkConfig, function(req, res, next){
    var useApp = userCfg.get('use'),
        config = util.merge({}, userCfg.get('apps')[useApp]);

    if(req.query['guid']) {
        //快照
        var guid = req.query['guid'],
            snap = snapCfg.getSnapShot(guid) || '';

        if(snap.indexOf('{') == 0) {
            var data = JSON.parse(snap);
            res.render('error', {
                errors:data.errors,
                content:data.content,
                body:snap
            });
        } else {
            var encoding = config['encoding'] || 'gbk';
            if(encoding == 'gbk') {
                res.setHeader('Content-Type','text/html;charset=GBK');
            } else {
                res.setHeader('Content-Type','text/html');
            }
            if(encoding == 'gbk') {
                res.send(iconv.encode(snap, 'gbk') || '');
            } else {
                res.send(snap || '');
            }
        }
    }
});

app.get('*.vm', checkConfig, function(req, res, next){
    var useApp = userCfg.get('use');
    var config = util.merge({}, userCfg.get('apps')[useApp]);
    config.type = userCfg.get('type');
    config.common = userCfg.get('common');

    render.getInfo({
        app: useApp,
        config: config,
        path: req.params[0]
    }, function(obj) {
        if(_.isEmpty(obj)) {
            res.render('404', {
                app: useApp
            });
        } else {
            res.render('info', util.merge(obj, {
                checkUpgrade: new Date().getTime() - userCfg.get('lastCheckTime') >= 259200000 //大于3天升级
            }));
        }
    });
});

var processUrl = function(uri, domain,  callback){
    var rules = userCfg.get('rules'),
        proxyDomain = userCfg.get('proxyDomain'),
        isMatch = false,
        matchRule;

    _.each(rules, function(rule){
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
    } else if(!util.isLocalFile(uri)) {
        if(!proxyDomain[domain]) {
            console.log('请配置一条域名转换以避免死循环, domain='+domain);
        }
        uri = proxyDomain[domain] + uri;
    }

    if(_.isUndefined(proxyDomain[domain])) {
        uri = uri.replace('undefined', '127.0.0.1');
    }

    callback(uri, matchRule);
};

var contentType = {
    '.js':'application/x-javascript;',
    '.css':'text/css;',
    '.swf':'application/x-shockwave-flash;',
    '.png': 'image/png;',
    '.gif': 'image/gif;',
    '.jpg': 'image/jpeg;',
    '.ico': 'image/x-icon;',
    '.less': 'text/css;'
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
                if(util.isLocalFile(uri)) {
                    uri = uri.replace(/\?.*/, '');

                    if(fs.existsSync(uri)) {
                        var stream = fs.createReadStream(uri);
                        res.write('/*url: ['+uri+'], matched pattern: [' + rule.pattern.replace(/\//g, ' /') + ']*/\r\n');
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
    userCfg.init({
        cfg:argv.cfg
    });

    snapCfg.init({
        cfg:argv.snapCfg
    });
    console.log('Status:', 'Success'.bold.green);
    console.log("Listen Port： " + app.get('port').toString().cyan);
    console.log("Help：" + "(sudo) vm help".cyan);
    console.log('请使用 '+ 'Control+C'.bold +  ' 来关闭控制台，配置页:http://127.0.0.1' + (app.get('port').toString() === '80' ? '' : ':' + app.get('port')));

    if(userCfg.get('open')) {
        setTimeout(function () {
            util.startWeb('http://127.0.0.1:' + app.get('port'));
        }, 300);
    }
}).on('error', function(err){
    console.log('Status:', 'Fail'.bold.red);
    console.log('Error:', err.message.toString().bold.red, '可能是端口被占用');
    console.log('请使用 '+ 'Control+C'.bold +  ' 来关闭控制台');
});
