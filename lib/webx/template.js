/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var request = require('request'),
    webx = require('./webx'),
    _ = require('underscore');

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

        this.macro = webx.getMacroSync(this.config);

        this.render = function(req, res){
            request.post(cfg.api, {
                encoding:'utf-8',
                form:{
                    target: this.target,
                    templates:JSON.stringify(this.content),
                    data:JSON.stringify(this.data),
                    macros:this.macro,
                    tools:{}
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data;
                    try {
                        data = JSON.parse(body);
                    } catch(ex) {
                        data = {result:false,error:ex};
                    }

                    if(data.result) {
//                        res.setHeader('Content-Type','text/html;charset=GBK');
                        res.send(data.content);
                    } else {
                        res.send(body);
                    }
                } else {
                    if(error) {
                        res.send(error);
                    } else {
                        res.send(response.statusCode);
                    }
                }
            })
        };
    }
}

module.exports = Template;