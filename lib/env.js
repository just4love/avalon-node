/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var path = require('path'),
    nconf = require('nconf');

nconf.env();

module.exports = {
    host: '127.0.0.1',
    port: '80',
    cfg: path.resolve((process.platform === 'win32' ? nconf.get('USERPROFILE') : nconf.get('HOME')) + '/.avaon')
};