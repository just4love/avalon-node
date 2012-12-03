/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */

var TPLReader =  function(data){
    var reals = data.real.split('_'),
        p = reals[0],
        t = new Date(parseInt(reals[1]));

    return ['<div class="btn-group"><a class="btn btn-small btn-inverse J_Tooltip" rel="tooltip" data-guid="',
        data.guid,
        '"',
        'href="',
        location.pathname.replace(/\.vm/, '.cache'),,
        '" data-placement="top" data-original-title="该缓存生成于',
        t.getFullYear(),
        '年',
        t.getMonth(),
        '月',
        t.getDay(),
        '日',
        t.getHours(),
        '时',
        t.getMinutes(),
        '分',
        t.getSeconds(),
        '秒',
        '"><i class="icon-time icon-white"></i> ',
        data.real,
        '</a><a class="btn btn-small btn-inverse dropdown-toggle" data-toggle="dropdown" href="#">',
        '<span class="caret"></span></a> <ul class="dropdown-menu"><li>',
        '<a href="#" class="J_DeleteTool"><i class="icon-trash"></i> Delete</a></li></ul></div>'].join('');
};

var createSnapShot = function(snapshot){
    $(TPLReader(snapshot)).appendTo($('#J_SnapShotsContainer')).find('.J_DeleteTool').click(function(e){
        e.preventDefault();
        var el = $(this);
        var toolKey = el.parents('.btn-group').attr('data-guid');
        //删除
        $.post('/app/removesnap', {
            guid:toolKey
        }, function(data){
            if(data.success) {
                //remove dom
                $(el).parents('.btn-group').remove();
            } else {
                alert(data.msg);
            }
        });
    }).end().find('.J_Tooltip').tooltip();
};

$(function () {
    $('#J_AddSnap').click(function(ev){
        ev.preventDefault();

        $('#J_Progress').fadeIn();

        $.post('/app/createsnap', {
            appName:$('#J_CurrentApp').val(),
            uri: location.pathname.replace(/\.vm/, ''),
            parameters:location.search.replace(/^\?/, '')
        }, function(data){
            if(data.success) {
                createSnapShot();
            } else {
                alert(data.error);
            }
        });
    });

    $.post('/app/loadsnap', {
        uri: location.pathname.replace(/\.vm/, '')
    }, function(data){
        if(data.success) {
            $.each(data.snapshots, function(idx, snapshot){
                createSnapShot(snapshot);
            });

            $('#J_SnapShotsContainer').fadeIn();
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