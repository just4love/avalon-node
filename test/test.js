/**
 * @fileoverview
 * @author Harry <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    fs = require('fs'),
    nconf = require('nconf'),
    request = require('request');


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
    it.only('request test', function(done) {
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