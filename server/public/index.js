/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */

var later = function (fn, when, periodic, context, data) {
    when = when || 0;
    var m = fn,
        d = $.makeArray(data),
        f,
        r;

    if (typeof fn == 'string') {
        m = context[fn];
    }

    if (!m) {
//        S.error('method undefined');
    }

    f = function () {
        m.apply(context, d);
    };

    r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

    return {
        id:r,
        interval:periodic,
        cancel:function () {
            if (this.interval) {
                clearInterval(r);
            } else {
                clearTimeout(r);
            }
        }
    };
};

$(function(){
    var checkValid =function(text){
        return !!text;
    };

    $('#J_AddNewApp').click(function(e){
        e.preventDefault();
        $('#addNewAppModal').modal({
            backdrop:'static'
        });
    });

    //blur and check
    $('#approot').blur(function(e){
        $(this).parents('.control-group').removeClass('error').removeClass('success');
        if(!checkValid($(this).val())) {
            $(this).parents('.control-group').addClass('error');
        } else {
            $(this).parents('.control-group').addClass('success');
        }
    });

    //update dir
    $('#J_RefreshDir').click(function(e){
        e.preventDefault();
        $.fn.zTree.destroy('configTree');
        $('#J_SubModuleSelect').parents('.control-group').hide();
        $('#J_SubModuleSelect option').remove();
        $('#J_SubModuleSelect').append('<option value="">无</option>');

        $('#approot').parents('.control-group').removeClass('error').removeClass('success');
        if(!checkValid($('#approot').val())) {
            $('#approot').parents('.control-group').addClass('error');
            return;
        } else {
            $('#approot').parents('.control-group').addClass('success');
        }

        $('#J_RefreshProgress').fadeIn();

        var timeChecker = later(function(){
            if(!$('#configTree').html()) {
                $('#J_BusyTip').addClass('in').fadeIn();
            } else {
                $('#J_BusyTip').removeClass('in').fadeOut();
            }
        }, 7000);

        $.post('/app/find', {
            root:$('#approot').val()
        }, function(data) {
            timeChecker.cancel();
            timeChecker = null;

            data = $.parseJSON(data);
            if(!data.success) {
                alert(data.msg);
                $('#J_RefreshProgress').fadeOut();
                $('#J_RefreshDir').button('reset');
                return;
            }

            data = data.data;
            $.fn.zTree.init($("#configTree"), {
                showLine:true,
                checkable:true
            }, data.tree);
            $('#J_RefreshProgress').fadeOut(function(){
                $("#configTree").parents('.control-group').show();
                $("#configTree").fadeIn();
                $('#J_BusyTip').removeClass('in').fadeOut();
                if(data.subModule && data.subModule.length) {
                    if(!(data.subModule.length == 1 && data.subModule[0] == 'noModule')) {
                        var tpl = [];
                        $.each(data.subModule, function(idx){
                            tpl.push('<option  value="' + data.subModule[idx] +'">' + data.subModule[idx] + '</option>');
                        });
                        $('#J_SubModuleSelect').append(tpl.join(''));
                        $('#J_SubModuleSelect').parents('.control-group').show();
                    }
                }
            });

            $('#J_RefreshDir').button('reset');
            $('#J_SaveConfig').button('reset');
        });
    });

    //cancel popup
    $('#addNewAppModal').on('hidden', function (e) {
        $("#configTree").parents('.control-group').hide();
        $.fn.zTree.destroy('configTree');
        $('#J_RefreshDir').button('reset');
        $('#J_RefreshProgress').hide();
        $(this).parents('.control-group').removeClass('error').removeClass('success');
        $('#J_SubModuleSelect').parents('.control-group').hide();
        $('#J_SubModuleSelect option').remove();
        $('#J_SubModuleSelect').append('<option value="">无</option>');
        $('#J_Encoding').attr('checked', true);
    });

    //save config
    $('#J_SaveConfig').click(function(e){
        e.preventDefault();
        if(!checkValid($('#approot').val()) || !$('#configTree').html()){
            alert('请先填写应用根目录并等待系统分析目录完成');
            return;
        }

        $(this).button('loading');
        $.post('/app/add', {
            root:$('#approot').val(),
            encoding:$('#J_Encoding').attr('checked') ? 'gbk':'utf8',
            defaultModule: $('#J_SubModuleSelect').val()||""
        }, function(data) {
            if(data.success) {
                $("#J_Apps").empty();
                $.post('/app/loadapps', function(data){
                    var tpl = [];
                    $.each(data.apps, function(idx){
                        if(data.apps[idx]==data.use) {
                            tpl.push('<option selected value="' + data.apps[idx] +'">' + data.apps[idx] + '</option>');
                        } else {
                            tpl.push('<option  value="' + data.apps[idx] +'">' + data.apps[idx] + '</option>');
                        }
                    });
                    $("#J_Apps").append(tpl.join(''));
                    //变更查看链接
                    $('#J_DetailApp').attr('href', '/list/' + data.use);
                    $('.J_AppOperate').show();
                });
                $('#addNewAppModal').modal('hide');
            } else {
                $("#addNewAppModal .error").show();
            }
        });
    });

    //remove app
    $('#J_RemoveApp').click(function(e){
        e.preventDefault();
        $('.J_RemoveAppAlertModal').modal({
            backdrop:'static'
        });
    });

    $('#J_RemoveAppAlertConfirm').click(function(e){
        e.preventDefault();

        $.post('/app/remove', {
            appName:$('#J_Apps').val()
        }, function(data){
            location.reload();
        });

    });

    $('#J_Apps').change(function(){
        $.post('/app/change', {
            appName:$('#J_Apps').val()
        }, function(data){
            location.reload();
        });
    });

    $('.J_CommonValue').blur(function(e){
        if($(this).val() === $(this).prev().val()) {
            return;
        }

        $.post('/app/setcommon', {
            key: $(this).attr('name'),
            value: $(this).val()
        }, function(data){
            if(data.success) {
                location.reload();
            } else {
                alert(data.error);
            }
        });
    });

    $('#J_AutoOpen').click(function(ev){
        $.post('/app/setopen', {
            open: !!$('#J_AutoOpen').attr('checked')
        }, function (data) {
            if (data.success) {
                location.reload();
            } else {
                alert(data.error);
            }
        });
    });

    $('#J_SwitchAppTypeModal .btn-primary').click(function(ev){
        ev.preventDefault();
        $.post('/app/changetype', {
            type: $('input[name="appType"]:checked').val()
        }, function (data) {
            if (data.success) {
                location.reload();
            } else {
                alert(data.error);
            }
        });
    });

    $('#J_Engine').change(function(ev){
        $.post('/app/changeapi', {
            api: $(this).val()
        }, function (data) {
            if (data.success) {
                location.reload();
            } else {
                alert(data.error);
            }
        });
    });

    $('#J_SwitchAppTypeModalTrigger').tooltip();
});

Global = {
    showTypeModal: function(){
        later(function(){
            $('#J_SwitchAppTypeModal').modal({
                backdrop:'static'
            });
        }, 500);
    }
};