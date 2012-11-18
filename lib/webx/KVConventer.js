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
        s.match(/\$!?{?\w[\w\.]*\}?/g).forEach(function(v){
            var objString = v.match(/\w[\w\.]*/)[0];

            if(!/.*(Module|Util|velocityCount|Server)/.test(objString.split('.')[0])) {
                result.push(objString);
            }
        });
    }

    return result;
};

var getForSetVars = function(s){
    var result = [];
    if(s) {
        s.match(/#(set|SET|foreach|FOREACH)\(.*\)/g).forEach(function(v){
            var vars = getVars(v);
            if(vars.length && vars.length > 1) {

            } else if(vars.length == 1) {
                //说明set或者each的都是常量 e.g. #set(${name}="vapour")
            }
        });
    }

    return result;
};

module.exports = {
    getVars: getVars,
    getForSetVars: getForSetVars
};