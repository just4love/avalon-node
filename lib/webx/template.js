/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var request = require('request'),
    webx = require('./webx'),
    vm = require('vm'),
    _ = require('underscore');

var getNormalScreenPath = function(p, module, config){
    //如果target没有module，则要把默认module追加上去
    if(module != 'noModule' && p.indexOf(module) == -1) {
        p = [module, p].join('/');
    }
    /**
     * auction/order/buynow.vm => screen/order/buynow.vm
     * @type {*}
     */
    if(module && config['subModule'][module]) {
        var t = p.split('/');
        if(module != 'noModule') {
            t.shift();
        }
        t.unshift('screen');

        return t.join('/');
    } else {
        return '';
    }
};

function Template(cfg){
    var that = this;

    if(cfg.target.indexOf('/') == 0) {
        cfg.target = cfg.target.substring(1);
    }
    // 构建json
    this.config = cfg.config;

    this.module = webx.findModule(cfg.target, this.config);

    this.target = getNormalScreenPath(cfg.target, this.module, this.config);

    //模板内容
    this.content = webx.getContentSync(this.target, this.module, this.config);

    //说明没有模板
    if(!_.isEmpty(this.content) && this.content[this.target]) {
        this.macro = webx.getMacroSync(this.config);
    }

    //data
    this.data = webx.getDataSync(this.module, _.keys(this.content), this.config);

    this.render = function(req, res){
        var customData = webx.getCustomDataSync(this.module, _.keys(this.content), this.config);
        if(!_.isEmpty(customData)) {
            //当前只渲染target的customdata
            try {
                vm.runInNewContext(customData[this.target], {
                    request:req,
                    response: res,
                    data: this.data[this.target],
                    console: console,
                    require: require,
                    appConfig: this.config
                });
            } catch (ex) {
                res.send('["' + this.target.replace('.vm', '.js') + '"]:\t' + ex);
            }
        }

        //无模板情况下直接输出json数据
        if(_.isEmpty(this.content) || !this.content[this.target]) {
            res.send(this.data[this.target]);
        }

        request.post(cfg.api, {
            encoding:'utf-8',
            form:{
                target: this.target,
                templates:JSON.stringify(this.content),
                data:JSON.stringify(this.data),
                macros:this.macro,
                tools:JSON.stringify(this.config.tools)
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
                    res.render('error', {
                        errors:data.errors,
                        content:data.content,
                        stack:{
                            '渲染模板': that.target,
                            '包含模板':_.keys(that.content)
//                            '数据':JSON.stringify(that.data),
//                            '宏':that.macro,
//                            '工具类':{}
                        }
                    });
                }
            } else {
                if(error) {
                    res.send(error);
                } else {
                    res.send(response.statusCode);
                }
            }
        });
    };
}

module.exports = Template;