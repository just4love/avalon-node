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
    host: '127.0.0.1',
    port: '80',
    cfg: path.join(getUserHome() + '/.avalon'),
    api: 'http://v.taobao.net/render.do'
};