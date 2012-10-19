/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
_ = require('underscore');

module.exports = {
    merge: function(a, b, whiteList){
        var o = {};
        var i;
        for(i in a) {
            if(_.include(whiteList, i)) {
                o[i] = a[i];
            }
        }

        for(i in b) {
            if(_.include(whiteList, i)) {
                o[i] = b[i];
            }
        }

        return o;
    }
};