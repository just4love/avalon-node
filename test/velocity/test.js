/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var velocity = require('velocityjs'),
    helper = velocity.Helper,
    Parser = velocity.Parser,
    fs = require('fs'),
    request = require('request'),
    fu = require('fileutil'),
    assert = require("assert"),
    _ = require('underscore');

function parseVM(vm){
    return new helper.Jsonify(Parser.parse(vm)).toVTL();
}

function removeWhite(text){
    return text && text.replace(/\s*/g, '')
}

describe('test velocity', function() {
    it.only('test Jsonify', function(done) {

        request.get('https://api.github.com/gists/5096438', function (error, response, body) {
            var data = JSON.parse(body);
            _.each(data.files, function(file, name){
                if(/\.vm/.test(name)) {
                    var json = data.files[name.replace(/\.vm/g, '') + '.json'];

                    assert.equal(removeWhite(parseVM(file.content)), removeWhite(json.content));
                }
            });
            done();
        });

    });
});