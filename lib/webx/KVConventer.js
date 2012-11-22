/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
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

    _.uniq(result);

    return result;
};

var getForSetVars = function(s){
    var result = {};
    if(s) {
        var keys = s.match(/#(set|SET|foreach|FOREACH)\(.*\)/g);
        keys && keys.forEach(function(v){
            var vars = getVars(v);
            if(vars.length && vars.length > 1) {
                //#set($campaignPromotionStr = $campaignPromotionStr + "活动可省")
                if(vars[0] != vars[1]) {
                    result[vars[0]] = vars[1];
                }
            } else if(vars.length == 1) {
                //说明set或者each的都是常量 e.g. #set(${name}="vapour")
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
 * @param rootKey {String}
 * @param newKeys {Array}
 */
var moveValue = function(result, rootKey, newKeys){
    var newRoot = result, i, l = newKeys.length;

    for(i = 0; i < l; i++) {
        newRoot = newRoot[newKeys[i]] || {};
    }

    if(result[rootKey]) {
        //从根对象上移动到新的位置
        newRoot[rootKey] = JSON.parse(JSON.stringify(result[rootKey]));
//        delete result[rootKey];
    }
};

var mergeVars = function(vars, forSetVars, templateName, result){
    //解析变量，放到对象中
    _.each(vars, function(v){
        var vs = v.split('.');
        setValue(result, vs);
    });

    //处理set和foreach的情况
    _.each(vars, function(v){
        var vs = v.split('.');

        //v => d.xxx
        while(forSetVars[vs[0]]) {
            moveValue(result, vs[0], forSetVars[vs[0]].split('.'));

            //说明有一个新的变量 .e.g #set($d = $a.b.c) $d.xxx => [a,b,c,xxx]
            vs = forSetVars[vs[0]].split('.').concat(vs.splice(0, 1));
        }

        console.log(vs);
    });
};

module.exports = {
    getVars: getVars,
    getForSetVars: getForSetVars,
    mergeVars: mergeVars
};