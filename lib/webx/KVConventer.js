/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var util = require('../util/util');
/**
 * 查找文本内容中的所有变量
 * @param s
 * @return {Array}
 */
var getVars = function(s) {
    var result = [];
    //匹配json键值对的正则
    if(s) {
        var vars = s.match(/\$!?{?\w[\w\.]*\}?/g);
        vars && vars.forEach(function(v){
            if(s.indexOf(v + '(') == -1) {
                var objString = v.match(/\w[\w\.]*/)[0];

                if(!/.*(Module|Util|velocityCount|Server|tool|Tool|screen_placeholder).*/.test(objString.split('.')[0])) {
                    result.push(objString);
                }
            }
        });
    }

    var t = {};
    _.each(result, function(v){
        t[v] = '';
    });
    result = _.keys(t);
//    _.unique(result);

    return result;
};

var getSetVars = function(s){
    var result = {};
    if(s) {
        var keys = s.match(/#(set|SET)\(.*\)/g);
        keys && keys.forEach(function(v){
            var vars = getVars(v);
            if(vars.length && vars.length > 1) {
                //#set($campaignPromotionStr = $campaignPromotionStr + "活动可省")
                if(vars[0] != vars[1]) {
                    result[vars[0]] = vars[1];
                }
            } else if(vars.length == 1) {
                //说明set是常量 e.g. #set(${name}="vapour")
            }
        });
    }

    return result;
};

var getForVars = function(s){
    var result = {};
    if(s) {
        var keys = s.match(/#(foreach|FOREACH)\(.*\)/g);
        keys && keys.forEach(function(v){
            var vars = getVars(v);
            if(vars.length && vars.length > 1) {
                //#forerach($campaignPromotionStr in $campaignPromotionStr)
                if(vars[0] != vars[1]) {
                    result[vars[0]] = vars[1];
                }
            } else if(vars.length == 1) {
                //说明each的都是常量 e.g. #foreach($a in [1,2,2])
            }
        });
    }

    return result;
};

//给对象赋值
var setValue = function (o, p) {
    if(!o) o = {};

    var i, j, l = p.length;

    for (i = 0; i < l; i++) {
        o = o[p[i]] = o[p[i]] || { };
    }
};

/**
 *
 * @param result {Object}
 * @param srcKey {String} 主对象上的key
 * @param targetKeys {Array}
 */
var moveValue = function(result, srcKey, targetKeys, newType){
    var targetObjRoot = result, i, l = targetKeys.length,
        isArray = _.isArray(newType) || _.isArray(result[srcKey]);

    for(i = 0; i < l; i++) {
        //取到最后一级如果是数组类型时处理成数组
        if(i == l -1 && isArray) {
            if(!_.isArray(targetObjRoot[targetKeys[i]])) {
                targetObjRoot = targetObjRoot[targetKeys[i]] = [];
            } else {
                //如果是数组，直接取引用
                targetObjRoot = targetObjRoot[targetKeys[i]];
            }
        } else {
            targetObjRoot = targetObjRoot[targetKeys[i]] = targetObjRoot[targetKeys[i]] || {};
        }
    }

    if(result[srcKey]) {
        if(isArray) {
            if(targetObjRoot.length) {
                //合并已经存在的数组里的对象key
                util.mix(targetObjRoot[0], JSON.parse(JSON.stringify(result[srcKey])));
            } else {
                var src = JSON.parse(JSON.stringify(result[srcKey]));
                if(_.isArray(src)) {
                    //如果待合并的也是数组，那么是#set($a = $array)的情况
                    targetObjRoot.push(JSON.parse(JSON.stringify(result[srcKey]))[0]);
                } else {
                    targetObjRoot.push(JSON.parse(JSON.stringify(result[srcKey])));
                }
            }
        } else {
            util.mix(targetObjRoot, JSON.parse(JSON.stringify(result[srcKey])));
        }

        delete result[srcKey];
    }
};

var mergeVars = function(vars, setVars, forVars, templateName, result){
    //解析变量，放到对象中
    _.each(vars, function(v){
        var vs = v.split('.');
        setValue(result, vs);
    });

    //处理set和foreach的情况，倒过来循环
    _.each(vars.reverse(), function(v){
        var vs = v.split('.');

        if(forVars[vs[0]]) {
            moveValue(result, vs[0], forVars[vs[0]].split('.'), []);
        }
    });

    _.each(vars.reverse(), function(v){
        var vs = v.split('.');
        if(setVars[vs[0]]) {
            if(setVars[vs[0]]) {
                moveValue(result, vs[0], setVars[vs[0]].split('.'));

                //说明有一个新的变量 .e.g #set($d = $a.b.c) $d.xxx => [a,b,c,xxx]
//                vs = setVars[vs[0]].split('.').concat(vs.splice(0, 1));
            }
        }
    });
};

module.exports = {
    getVars: getVars,
    getSetVars: getSetVars,
    getForVars: getForVars,
    mergeVars: mergeVars
};