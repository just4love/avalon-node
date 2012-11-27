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

function removeVelocityComments(str) {
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

        if (str[i] === '#') {

            if (str[i+1] === '*' && str[i+2] === '@') {
                mode.condComp = true;
                continue;
            }
            if (str[i+1] === '*') {
                str[i] = '';
                mode.blockComment = true;
                continue;
            }
            if (str[i+1] === '#') {
                str[i] = '';
                mode.lineComment = true;
                continue;
            }
            mode.regex = true;

        }

    }
    return str.join('').slice(2, -2);
}

var json2Tree = function(json, option) {
    if(!option) {
        option = {};
    }

    function getTree(root){
        var tree = [];
        _.each(root, function(v, k){
            var subTree = {};
            if(k === 'noModule') {
                //展现的更好看
                k = '/';
            }

            subTree['name'] = k;
            if((_.isArray(v) || _.isObject(v)) && !_.isEmpty(v)) {
                subTree['open'] = true;
                subTree['children'] = getTree(v);
            } else if(_.isString(v)) {
                subTree['open'] = true;
                subTree['children'] = [{name:v}];
            } else {
                if(option.isLeafParent) {
                    subTree['isParent'] = true;
                }
            }

            tree.push(subTree);
        });

        return tree;
    }

    return getTree(json);
};

var JsonUti = {
    //定义换行符
    n: "\n",
    //定义制表符
    t: "\t",
    //转换String
    prettyJSON: function(obj) {
        return JsonUti.__writeObj(obj, 1);
    },
    //写对象
    __writeObj: function(obj //对象
        , level //层次（基数为1）
        , isInArray) { //此对象是否在一个集合内
        //如果为空，直接输出null
        if (obj == null) {
            return "null";
        }
        //为普通类型，直接输出值
        if (obj.constructor == Number || obj.constructor == Date || obj.constructor == String || obj.constructor == Boolean) {
            var v = obj.toString();
            var tab = isInArray ? JsonUti.__repeatStr(JsonUti.t, level - 1) : "";
            if (obj.constructor == String || obj.constructor == Date) {
                //时间格式化只是单纯输出字符串，而不是Date对象
                return tab + ("\"" + v + "\"");
            }
            else if (obj.constructor == Boolean) {
                return tab + v.toLowerCase();
            }
            else {
                return tab + (v);
            }
        }
        //写Json对象，缓存字符串
        var currentObjStrings = [];
        //遍历属性
        for (var name in obj) {
            var temp = [];
            //格式化Tab
            var paddingTab = JsonUti.__repeatStr(JsonUti.t, level);
            temp.push(paddingTab);
            //写出属性名
            temp.push(name + " : ");
            var val = obj[name];
            if (val == null) {
                temp.push("null");
            }
            else {
                var c = val.constructor;
                if (c == Array) { //如果为集合，循环内部对象
                    temp.push(JsonUti.n + paddingTab + "[" + JsonUti.n);
                    var levelUp = level + 2; //层级+2
                    var tempArrValue = []; //集合元素相关字符串缓存片段
                    for (var i = 0; i < val.length; i++) {
                        //递归写对象
                        tempArrValue.push(JsonUti.__writeObj(val[i], levelUp, true));
                    }
                    temp.push(tempArrValue.join("," + JsonUti.n));
                    temp.push(JsonUti.n + paddingTab + "]");
                }
                else if (c == Function) {
                    temp.push("[Function]");
                }
                else {
                    //递归写对象
                    temp.push(JsonUti.__writeObj(val, level + 1));
                }
            }
            //加入当前对象“属性”字符串
            currentObjStrings.push(temp.join(""));
        }
        return (level > 1 && !isInArray ? JsonUti.n: "") //如果Json对象是内部，就要换行格式化
            + JsonUti.__repeatStr(JsonUti.t, level - 1) + "{" + JsonUti.n //加层次Tab格式化
            + currentObjStrings.join("," + JsonUti.n) //串联所有属性值
            + JsonUti.n + JsonUti.__repeatStr(JsonUti.t, level - 1) + "}"; //封闭对象
    },
    __isArray: function(obj) {
        if (obj) {
            return obj.constructor == Array;
        }
        return false;
    },
    __repeatStr: function(str, times) {
        var newStr = [];
        if (times > 0) {
            for (var i = 0; i < times; i++) {
                newStr.push(str);
            }
        }
        return newStr.join("");
    }
};

var _mix = function (p, r, s, ov, deep) {
    if (ov || !(p in r)) {
        var target = r[p], src = s[p];
        // prevent never-end loop
        if (target === src) {
            return;
        }
        // 来源是数组和对象，并且要求深度 mix
        if (deep && src && (_.isArray(src) || _.isObject(src))) {
            // 目标值为对象或数组，直接 mix
            // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
            var clone = target && (_.isArray(target) || _.isObject(target)) ?
                target :
                (_.isArray(src) ? [] : {});
            r[p] = S.mix(clone, src, ov, undefined, true);
        } else if (src !== undefined) {
            r[p] = s[p];
        }
    }
};

var mix = function (r, s, ov, wl, deep) {
    if (!s || !r) {
        return r;
    }
    if (ov === undefined) {
        ov = true;
    }
    var i, p, len;

    if (wl && (len = wl.length)) {
        for (i = 0; i < len; i++) {
            p = wl[i];
            if (p in s) {
                _mix(p, r, s, ov, deep);
            }
        }
    } else {
        for (p in s) {
            _mix(p, r, s, ov, deep);
        }
    }
    return r;
};

module.exports = {
    merge: function(a, b, whiteList){
        var o = {};
        var i;
        for(i in a) {
            if(whiteList && whiteList.length) {
                if(_.include(whiteList, i)) {
                    o[i] = a[i];
                }
            } else {
                o[i] = a[i];
            }
        }

        for(i in b) {
            if(whiteList && whiteList.length) {
                if(_.include(whiteList, i)) {
                    o[i] = b[i];
                }
            } else {
                o[i] = b[i];
            }

        }

        return o;
    },
    removeComments:removeComments,
    removeVelocityComments: removeVelocityComments,
    /**
     * json转成树json
     */
    json2Tree: json2Tree,
    prettyJSON: JsonUti.prettyJSON,
    mix: mix
};