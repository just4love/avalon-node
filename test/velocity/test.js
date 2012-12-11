/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var velocity = require('velocity.js'),
    helper = velocity.Helper,
    Parser = velocity.Parser,
    fs = require('fs');

describe('test velocity', function() {
    var vm = fs.readFileSync('../myCartBeta.vm').toString(),
        asts = Parser.parse(vm);

    it('test structure', function() {
        var Structure = new helper.Structure(asts);
        console.log(Structure.context);
    });

    it('test BackStep', function() {
        var BackStep = new helper.BackStep(asts);
        console.log(BackStep.context);
    });

    it('test Jsonify', function() {
        var Jsonify = new helper.Jsonify(asts);
        console.log(Jsonify);
    });
});