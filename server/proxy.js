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
    , proxyCfg = require('../lib/proxyConfig')
    , argv = require('optimist').argv
    , util = require('../lib/util/util')
    , cons = require('consolidate')
    , _ = require('underscore')
    , httpProxy = require('http-proxy');

proxyCfg.init({
    cfg:argv.cfg,
    api: argv.api
});


var app = express();

app.configure(function () {
    app.set('port', argv.port || 3722);
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

app.get('/', routes.index);

var proxy = new httpProxy.RoutingProxy();

app.get('*.(css|js|ico|png|jpg|swf|less|gif)', function(req, res){
    //判断url路径，读取相应的文件，否则就走日常环境
    if(req.url.indexOf('/apps/tradeface') == 0 && req.url.indexOf("??") == -1) {
        //过滤时间戳
        var url = req.url.replace(/\?.+/, '');

        var filePath = path.join('D:\\project\\tradeface\\assets', url.replace('/apps/tradeface', ''));
        if(fs.existsSync(filePath)) {
            res.write(fs.readFileSync(filePath));
            res.end();
        }
    }
    proxy.proxyRequest(req, res, {
        host: 'assets.daily.taobao.net',
        port: 80
    });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});