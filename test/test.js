/**
 * @fileoverview
 * @author Harry <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    fs = require('fs'),
    path = require('path'),
    nconf = require('nconf'),
    render = require('../lib/render'),
    webx = require('../lib/webx/webx'),
    userCfg = require('../lib/config/userConfig'),
    request = require('request'),
    vm = require('vm'),
    util = require('../lib/util/util'),
    easyconf = require('easyconf'),
    _ = require('underscore');

describe('Array', function(){
    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        })
    });
});

describe('nconf', function() {
    it('get env', function(done) {

        //
        // Setup nconf to use (in-order):
        //   1. Command-line arguments
        //   2. Environment variables
        //   3. A file located at 'path/to/config.json'
        //
        nconf.argv()
            .env()
            .file({ file: __dirname + '/test.json' });
        //
        // Set a few variables on `nconf`.
        //
        nconf.set('database:host', '127.0.0.1');
        nconf.set('database:port', 5984);
        nconf.set('home', nconf.get('HOME'));

        console.log('NODE_ENV: ' + nconf.get('NODE_ENV'));
        console.log('key = test & value = %s', nconf.get('test'));

        //
        // Save the configuration object to disk
        //
        nconf.save(function (err) {
            fs.readFile(__dirname + '/test.json', function (err, data) {
                console.dir(JSON.parse(data.toString()));
                done();
            });
        });
    });

    it('get user home', function() {
        nconf.env();
        nconf.file({ file: nconf.get('USERPROFILE') + '/.avalon' });
        console.log(nconf);
        nconf.save();
    });
});

describe('html5', function() {
    it('for each', function() {
        var o = {
            apps: {
                tf:{a:1},
                cart:{b:2}
            }
        };

        for (var key in o.apps) {
            console.log(o.apps[key]);
        }
    });
});

describe('request', function() {
    it('request test', function(done) {
        request.post('http://vcenter.taobao.net:9000/render.do', {
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
                done();
            }
        });
    });
});

describe('get template', function() {
    it('get tempalte', function() {
        var content = 'fdsafdsafdsafds#parse("control/order/address/cartAddressSelect.vm")#parse("control/order/progressBar/progressBar.vm")$control.setTemplate("order/progressBar/progressBar.vm");';

        var result = content.match(/(#parse|\$control.setTemplate).*?\.vm('|")\)/g);

        console.log(result);
    });

    it('test replace', function() {
        var v = '#parse("control/order/progressBar/progressBar.vm " )';

        v = v.replace(/#parse\(('|")\s*/, '');

        v = v.replace(/('|")\s*\)/, '');

        console.log(path.resolve(v));
    });
});

describe('js', function() {
    it('eval test', function() {
        eval('var json = {a:1,B:2}');
        console.log(json);
    });
});

describe('render template', function() {
    it('render', function(done) {
        userCfg.init('C:\\Users\\Harry\\.avalon');

        var content = webx.getContentSync('/auction/order/unityOrderConfirm.vm', userCfg.get('apps')['tradeface']);

        request.post('http://127.0.0.1/render.do', {
            encoding:'utf-8',
            form:{
                target: 'screen/order/unityOrderConfirm.vm',
                templates:JSON.stringify(content),
                data:JSON.stringify({}),
                macros:'',
                tools:{}
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                done();
            }
        })
    });
});

describe('js vm', function() {
    it('render static js logic', function() {
        var content = fs.readFileSync('D:\\project\\avalon-node\\test\\logic.js', '').toString();
        var data = {
            a:1,
            b:{
                c:2
            }
        };
        try {
            vm.runInNewContext(content, data);
        } catch (ex) {
            console.log(ex);
        }

        console.log(data);
    });
});

describe('util', function() {
    it.only('augment', function() {
        var conf1 = new easyconf('./test.json');
        var conf2 = new easyconf('./nconf_demo.json');

        console.log(conf1.get('home'));
        console.log(conf2.get('home'));
    });
});