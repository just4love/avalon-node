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
            }, data);
            $('#addNewAppModal .progress .bar').css('width', '100%').parent().fadeOut(function(){
                $("#configTree").fadeIn();
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
    });

    $('#J_SaveConfig').click(function(e){
        e.preventDefault();
        $(this).button('loading');
        $.post('/app/add', {
            root:$('#approot').val()
        }, function(data) {
            if(data.success) {
                $("#J_Apps").empty();
                $.post('/app/loadapps', function(data){
                    var tpl = [];
                    $.each(data.apps, function(app){
                        if(app==data.use) {
                            tpl.push('<option selected value="' + app +'">' + app + '</option>');
                        } else {
                            tpl.push('<option  value="' + app +'">' + app + '</option>');
                        }
                    });
                    $("#J_Apps").append(tpl.join(''));
                });
                $('#addNewAppModal').modal('hide');
            } else {
                $('#addNewAppModal .error').show();
            }
        });
    });

    //save config

});
