/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
$(function(){

    $('<img src="/loading/loading-4.gif" alt="" style="margin-top: 10px;display:none;" id="J_UpdateLoadingImg">').appendTo($('.nav')).fadeIn();

    $.get('/app/getlastest', function(data){
        if(data.success) {
            if(data.current != data.cfg['dist-tags'].latest) {
                $('#J_UpdateLoadingImg').hide();
                $('<a class="btn btn-info btn-small" id="J_UpdateTip" style="display:none" href="https://github.com/czy88840616/avalon-node/blob/master/CHANGELOG.md" target="_blank">亲，有新版本可以升级哦</a>').appendTo($('.nav')).fadeIn();
                $('#J_UpdateTip').tooltip({
                    placement:"bottom",
                    title:"当前版本：" + data.current + "，最新版本："+ data.cfg['dist-tags'].latest
                });
            }
        }
    });
});