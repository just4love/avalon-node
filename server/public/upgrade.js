/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
$(function(){

    $('<img src="/loading/loading-4.gif" alt="" style="margin-top: 10px;display:none;" id="J_UpdateLoadingImg">').appendTo($('.nav')[0]).fadeIn();

    $.get('/app/getlastest', function(data){
        if(data.success) {
            $('#J_UpdateLoadingImg').hide();
            if(data.current != data.cfg['dist-tags'].latest) {
                $('<a class="btn btn-info btn-small" id="J_UpdateTip" style="display:none;background-color:#8D46B0" href="https://github.com/czy88840616/avalon-node/blob/master/CHANGELOG.md" target="_blank">亲，有新版本可以升级哦 <button type="button" style="float:none;" class="close" data-dismiss="alert">×</button></a>')
                    .appendTo($('.nav')[0])
                    .fadeIn()
                    .one('mouseover', function(ev){
                        $.get('/app/updatechecktime');
                    });

                $('#J_UpdateTip').tooltip({
                    placement:"bottom",
                    title:"当前版本：" + data.current + "，最新版本："+ data.cfg['dist-tags'].latest
                });

                $('#J_UpdateTip .close').click(function(ev){
                    ev.preventDefault();
                    $('#J_UpdateTip').tooltip('hide');
                });
            }
        }
    });
});