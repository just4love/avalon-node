/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */

var TPLReader =  function(data){
    var t = new Date(data.t);

    return ['<li><a href="',
        location.pathname.replace(/\.vm/, '.htm'),
        '?guid=',
        data.guid,
        '"><i class="icon-time"></i>该缓存生成于',
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
        '<i class="icon-remove J_RemoveSnap" data-guid="',
        data.guid,
        '"></i></a></li>'].join('');
};

var removeSnap = function(el) {
    if(confirm('确定删除一个快照吗？')) {
        var guid = el.attr('data-guid');
        //删除
        $.post('/app/removesnap', {
            guid:guid
        }, function(data){
            if(data.success) {
                //remove dom
                $(el).parents('li').fadeOut(function() {
                    $(el).parents('li').remove();
                });
            } else {
                alert(data.msg);
            }
        });
    }
};

var createSnapShot = function(snapshot){
    $(TPLReader(snapshot)).appendTo($('#J_SnapShotsContainer')).find('.J_RemoveSnap').click(function(e){
        e.preventDefault();
        var el = $(this);
        removeSnap(el);
    }).end();
};

var insertSnapShot = function(snapshot){
    $(TPLReader(snapshot)).insertBefore($('#J_SnapShotsContainer')).find('.J_RemoveSnap').click(function(e){
        e.preventDefault();
        var el = $(this);
        removeSnap(el);
    }).end();
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
            if(data.snapshots['24hour'] && data.snapshots['24hour'].length) {
                $('<li class="nav-header">1天内</li>').appendTo($('#J_SnapShotsContainer'));
                $.each(data.snapshots['24hour'], function(idx, snapshot){
                    createSnapShot(snapshot);
                });
            }

            if(data.snapshots['72hour'] && data.snapshots['72hour'].length) {
                $('<li class="nav-header">3天内</li>').appendTo($('#J_SnapShotsContainer'));
                $.each(data.snapshots['72hour'], function(idx, snapshot){
                    createSnapShot(snapshot);
                });
            }

            if(data.snapshots['more'] && data.snapshots['more'].length) {
                $('<li class="nav-header">更早</li>').appendTo($('#J_SnapShotsContainer'));
                $.each(data.snapshots['more'], function(idx, snapshot){
                    createSnapShot(snapshot);
                });
            }


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