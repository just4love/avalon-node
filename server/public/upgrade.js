/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */
$(function(){
    $.get('/app/getlastest', function(data){
        if(data.success) {
            if(data.current != data.cfg['dist-tags'].latest) {
                $('#J_UpdateTip .new').text(data.cfg['dist-tags'].latest);
                $('#J_UpdateTip .current').text(data.current);
                $('#J_UpdateTip').slideDown();
            }
        }
    });
});