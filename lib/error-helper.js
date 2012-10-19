var util = require('util');
exports.printError = function (err) {
    util.debug(err.stack);
    delete err.stack;
    util.debug(JSON.stringify(err, null, 2));
};