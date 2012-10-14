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
    , _ = require('underscore');

userCfg.load(argv.cfg);

var checkConfig = function(req, res, next){
    var apps = userCfg.get('apps');
    console.log(apps);
    if(apps && !_.isEmpty(apps)) {
        next();
    }
    res.redirect('/');
};

var app = express();

app.configure(function () {
    app.set('port', argv.port || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
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

var useApp = userCfg.get('use');
app.all('/*.*htm*', checkConfig, function(req, res){
    var template = render.parse({
        app: useApp,
        path: req.params[0],
        parameters: req.method == 'get' ? req.query : req.body
    }, apps[useApp]);

    template.render(req, res);
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});