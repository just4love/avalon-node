/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var request = require('request'),
    webx = require('./webx'),
    _ = require('underscore');

var renderUrl = 'http://127.0.0.1/render.do';

function Template(cfg){
    if(cfg.target.indexOf('/') == 0) {
        cfg.target = cfg.target.substring(1);
    }
    // 构建json
    this.config = cfg.config;

    //template
    this.content = webx.getContentSync(cfg.target, this.config);

    if(!_.isEmpty(this.content)) {
        this.target = cfg.target;
        var t = this.target.split('/');
        var module = t.shift();
        t.unshift('screen');
        this.target = t.join('/');

        //data
        this.data = webx.getDataSync(module, _.keys(this.content), this.config);

        this.render = function(req, res){
            request.post(renderUrl, {
                encoding:'utf-8',
                form:{
                    target: this.target,
                    templates:JSON.stringify(this.content),
                    data:JSON.stringify(this.data),
                    macros:'',
                    tools:{}
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);
                    if(data.result) {
                        res.setHeader('charset','gbk');
                        res.send(data.content);
                    } else {
                        res.send(body);
                    }
                }
            })
        };
    }
}

module.exports = Template;