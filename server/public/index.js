/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
$(function(){
    var checkValid =function(text){
        return !!text;
    };

    $('#J_AddNewApp').click(function(e){
        e.preventDefault();
        $('#addNewAppModal').modal();
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

        $(this).button('loading');
        $('#addNewAppModal .progress .bar').css('width', '10%').parent().show();

        $.post('/app/find', {
            root:$('#approot').val()
        }, function(data) {
            $('#addNewAppModal .progress .bar').css('width', '60%');
            $.fn.zTree.init($("#configTree"), {
                showLine:true,
                checkable:true
            }, data.tree);
            $('#addNewAppModal .progress .bar').css('width', '100%').parent().fadeOut(function(){
                $("#configTree").fadeIn();
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
        $.fn.zTree.destroy('configTree');
        $('#addNewAppModal .progress .bar').css('width', '0%');
        $('#J_RefreshDir').button('reset');
        $('#addNewAppModal .progress').hide();
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
                    $('.J_AppOperate').show();
                });
                $('#addNewAppModal').modal('hide');
            } else {
                $('#addNewAppModal .error').show();
            }
        });
    });

    //remove app
    $('#J_RemoveApp').click(function(e){
        e.preventDefault();
        $('.J_RemoveAppAlertModal').modal();
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

    $('#J_Vmcommon').blur(function(e){
        $.post('/app/setvmcommon', {
            vmcommon:$('#J_Vmcommon').val()
        }, function(data){
            if(data.success) {
                location.reload();
            } else {
                alert(data.error);
            }
        });
    });

    $('#loadingContent').addClass('fullwidth');
    $.get('/app/getlastest', function(data){
        $('#loadingContent').removeClass('fullwidth');
        if(data.success) {
            if(data.current != data.cfg['dist-tags'].latest) {
                $('#J_UpdateTip .new').text(data.cfg['dist-tags'].latest);
                $('#J_UpdateTip .current').text(data.current);
                $('#J_UpdateTip').slideDown();
            }
        }
    });
});
