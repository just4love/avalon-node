/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var express = require('express')
    , routes = require('./routes')
    , proxy = require('./routes/proxy')
    , http = require('http')
    , path = require('path')
    , fs = require('fs')
    , render = require('../lib/render')
    , proxyCfg = require('../lib/proxyConfig')
    , argv = require('optimist').argv
    , util = require('../lib/util/util')
    , cons = require('consolidate')
    , _ = require('underscore')
    , request = require('request');

proxyCfg.init({
    cfg:argv.cfg
});


var app = express();

app.configure(function () {
    app.set('port', argv.port || 10087);
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

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.get('/proxy', proxy.index);

var isLocal = function(url){
    //过滤时间戳
    url = url.replace(/\?.+/, '');
    return fs.existsSync(path.resolve(url));
};

var contentType = {
    '.js':'text/javascript',
    '.css':'text/css'
};

app.get('(*??*|*.(css|js|ico|png|jpg|swf|less|gif))', function(req, res){
    var rules = proxyCfg.get('rules'),
        url = req.url,
        isMatch = false;
console.log(url);
    if(req.url.indexOf('??') != -1) {
        request.get('http://proxy.taobao.net' + url + '&domain=' + req.headers.host.split(':')[0], function (error, response, body) {
            if(error) {
                res.send(error.toString() + ', url=' + url);
            }

            if(response.statusCode == 200) {
                res.setHeader('Content-type', contentType[path.extname(url)]);
                res.send(error ? error.toString(): body);
            } else if(response.statusCode == 404) {
                res.send(error ? error.toString(): body);
            }
        });
    }

    rules.forEach(function(rule){
        if(!isMatch) {
            var pattern;
            if(rule.type == 'string') {
                pattern = rule.pattern;
                if(url.indexOf(pattern) != -1) {
                    url = url.replace(pattern, rule.target);
                    isMatch = true;
                }
            } else if(rule.type == 'regexp'){
                pattern = new RegExp(rule.pattern, 'g');
                if(pattern.test(url)) {
                    url = url.replace(pattern, rule.target);
                    isMatch = true;
                }
            }
        }
    });

    if(isLocal(url)) {
        url = url.replace(/\?.+/, '');
        fs.readFile(url, '', function(err, data){
            res.setHeader('Content-type', contentType[path.extname(url)]);
            res.send(err ? err: data);
        });
    } else {
        request.get('http://proxy.taobao.net' + url, {
            qs:{
                domain:req.headers.host.split(':')[0]
            }
        }, function (error, response, body) {
            if(error) {
                res.send(error.toString() + ', url=' + url);
            }

            if(response.statusCode == 200) {
                res.setHeader('Content-type', contentType[path.extname(url)]);
                res.send(error ? error.toString(): body);
            } else if(response.statusCode == 404) {
                res.send(error ? error.toString(): body);
            }
        });
    }
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});