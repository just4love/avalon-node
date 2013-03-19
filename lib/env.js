/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var path = require('path');

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = {
    port: '80',
    cfg: path.join(getUserHome() + '/.avalon'),
    snapCfg: path.join(getUserHome() + '/.avalon_snapshot')
};