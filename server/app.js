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
    , _ = require('underscore');

function init(cfg) {

    var app = express(),
        nconf = cfg.nconf;

    app.configure(function () {
        app.set('port', cfg.port || 3000);
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
    app.get('/users', user.list);

    var apps = nconf.get('apps');
    if(_.isEmpty(apps)) {

    }

    var useApp = nconf.get('use');
    app.all('/*.*htm*', function(req, res){
        var template = render.parse({
            app: useApp,
            path: req.params[0],
            parameters: require('url').parse(req.url).query
        }, apps[useApp]);

        template.render(req, res);
    });

    http.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });

}

module.exports.init = init;