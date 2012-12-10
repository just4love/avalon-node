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
    it('test structure', function() {
        var Structure = new helper.Structure();
        var vm = fs.readFileSync('../myCartBeta.vm').toString();
        var asts = Parser.parse(vm);
        var struct = new Structure(asts);
        console.log(struct.context);
    });
});