/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var request = require('request');

var renderUrl = 'http://vmarket.taobao.net/render.do';

function Template(cfg){
    // 构建json
    this.target = cfg.target;

    this.content = {};

    this.render = function(req, res){

        request.post(renderUrl, {
            encoding:'utf-8',
            form:{
                target: 'test.vm',
                templates:JSON.stringify({
                    'test.vm': "你好, $name,今天是个好天气"
                }),
                data:JSON.stringify({
                    "name": "UED"
                }),
                macros:'',
                tools:{}
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body); // Print the google web page.
            }
        })
    };
}

exports.module = Template;