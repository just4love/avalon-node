/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */

var TPLReader =  function(data){
    return ['<div class="btn-group"><a class="btn btn-small btn-inverse J_Tooltip" rel="tooltip"',
        'href="#" data-placement="top" data-original-title="',
        data.className + ' ' + data.propString,
        '"><i class="icon-wrench icon-white"></i> ',
        data.key,
        '</a><a class="btn btn-small btn-inverse dropdown-toggle" data-toggle="dropdown" href="#">',
        '<span class="caret"></span></a> <ul class="dropdown-menu"><li>',
        '<a href="#" class="J_DeleteTool"><i class="icon-trash"></i> Delete</a></li></ul></div>'].join('');
};

$(function () {
    $('#J_AddSnap').click(function(ev){
        ev.preventDefault();

        $('#J_Progress').fadeIn();

        $.post('/app/createSnap', {
            appName:$('#J_CurrentApp').val(),
            uri: location.pathname,
            parameters:location.search.replace(/^\?/, '')
        }, function(data){
            if(data.success) {
                $.each(data.snapshots, function(snapshot){
                    $(TPLReader({
                        key:idx,
                        className:tool.class
                    })).appendTo($('#J_ToolContainer')).find('.J_DeleteTool').click(function(e){
                            e.preventDefault();
                            var el = $(this);
                            var toolKey = el.parents('.btn-group').attr('data-toolkey');
                            //и╬ЁЩ
                            $.post('/app/removetool', {
                                app:$('#J_CurrentApp').val(),
                                toolkey:toolKey
                            }, function(data){
                                if(data.success) {
                                    //delete data
                                    delete window.tools[toolKey];
                                    //remove dom
                                    $(el).parents('.btn-group').remove();
                                } else {
                                    alert(data.msg);
                                }
                            });
                        }).end().find('.J_Tooltip').tooltip();
                });
            } else {
                alert(data.error);
            }
        });
    });

    $.post('/app/loadSnap', {
        uri: location.pathname
    }, function(data){
        if(data.success) {

        } else {
            alert(data.error);
        }
    });

    var data = $('#J_TreeData').val();
    $.fn.zTree.init($("#configTree"), {
        showLine: true,
        checkable: true
    }, $.parseJSON(data));

    SyntaxHighlighter.config.clipboardSwf = '/syntaxhighlighter/scripts/clipboard.swf';
    SyntaxHighlighter.all();
});