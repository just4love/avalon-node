/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
_ = require('underscore');

/*
 This function is loosely based on the one found here:
 http://www.weanswer.it/blog/optimize-css-javascript-remove-comments-php/
 */
function removeComments(str) {
    str = ('__' + str + '__').split('');
    var mode = {
        singleQuote: false,
        doubleQuote: false,
        regex: false,
        blockComment: false,
        lineComment: false,
        condComp: false
    };
    for (var i = 0, l = str.length; i < l; i++) {

        if (mode.regex) {
            if (str[i] === '/' && str[i-1] !== '\\') {
                mode.regex = false;
            }
            continue;
        }

        if (mode.singleQuote) {
            if (str[i] === "'" && str[i-1] !== '\\') {
                mode.singleQuote = false;
            }
            continue;
        }

        if (mode.doubleQuote) {
            if (str[i] === '"' && str[i-1] !== '\\') {
                mode.doubleQuote = false;
            }
            continue;
        }

        if (mode.blockComment) {
            if (str[i] === '*' && str[i+1] === '/') {
                str[i+1] = '';
                mode.blockComment = false;
            }
            str[i] = '';
            continue;
        }

        if (mode.lineComment) {
            if (str[i+1] === '\n' || str[i+1] === '\r') {
                mode.lineComment = false;
            }
            str[i] = '';
            continue;
        }

        if (mode.condComp) {
            if (str[i-2] === '@' && str[i-1] === '*' && str[i] === '/') {
                mode.condComp = false;
            }
            continue;
        }

        mode.doubleQuote = str[i] === '"';
        mode.singleQuote = str[i] === "'";

        if (str[i] === '/') {

            if (str[i+1] === '*' && str[i+2] === '@') {
                mode.condComp = true;
                continue;
            }
            if (str[i+1] === '*') {
                str[i] = '';
                mode.blockComment = true;
                continue;
            }
            if (str[i+1] === '/') {
                str[i] = '';
                mode.lineComment = true;
                continue;
            }
            mode.regex = true;

        }

    }
    return str.join('').slice(2, -2);
}

var json2Tree = function(json) {

    function getTree(root){
        var tree = [];
        _.forEach(root, function(v, k){
            var subTree = {};
            subTree['name'] = k;
            if((_.isArray(v) || _.isObject(v)) && !_.isEmpty(v)) {
                subTree['open'] = true;
                subTree['children'] = getTree(v);
            } else if(_.isString(v)) {
                subTree['open'] = true;
                subTree['children'] = [{name:v}];
            } else {
                subTree['isParent'] = true;
            }

            tree.push(subTree);
        });

        return tree;
    }

    return getTree(json);
};

module.exports = {
    merge: function(a, b, whiteList){
        var o = {};
        var i;
        for(i in a) {
            if(whiteList && whiteList.length) {
                if(_.include(whiteList, a[i])) {
                    o[i] = a[i];
                }
            } else {
                o[i] = a[i];
            }
        }

        for(i in b) {
            if(whiteList && whiteList.length) {
                if(_.include(whiteList, b[i])) {
                    o[i] = b[i];
                }
            } else {
                o[i] = b[i];
            }

        }

        return o;
    },
    removeComments:removeComments,
    /**
     * json转成树json
     */
    json2Tree: json2Tree
};