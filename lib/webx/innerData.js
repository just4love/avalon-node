/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
 module.exports = {
    data:{
        companys:{
            taobao: {
                common: {
                    vmcommon:"假如您的模板中使用了vmcommon，请checkout到本地，填写文件夹绝对路径"
                }
            },
            b2b: {
                common: {
                    adcms: "假如您的模板中使用了adcms，请放到本地，然后填写本地文件夹绝对路径"
                }
            }
        },
        apis: {
            '内网API':'http://v.taobao.net/render.do',
            'DEBUG API': 'http://127.0.0.1:8000/render.do'
        }
    }
 };