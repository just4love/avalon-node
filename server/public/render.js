/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */

var toolsList = {
    control:"web.tools.webx.ControlTool",
    rundata:"web.tools.webx.RundataTool",
    vmcommonControl:"web.tools.webx.VmcommonControl",
    tmsTool:"web.tools.webx.TmsTool",
    cmsTool:"web.tools.webx.CmsTool",
    stringUtil:"com.alibaba.common.lang.StringUtil",
    tbStringUtil:"com.taobao.util.TBStringUtil",
    securityUtil:"com.taobao.security.util.SecurityUtil",
    systemUtil:"com.alibaba.common.lang.SystemUtil",
    randomUtil:"com.taobao.util.RandomUtil",
    calendarUtil:"com.taobao.util.CalendarUtil",
    dateUtil:"com.taobao.util.DateUtils",
    collectionUtil:"com.taobao.util.CollectionUtil",
    mapUtil:"com.taobao.util.MapUtil",
    stringEscapeUtil:"com.alibaba.common.lang.StringEscapeUtil",
    csrfToken:"web.tools.webx.CsrfTokenTool"
};
var tools = {};

$(function () {

    $('#J_AddTools').click(function(){
        $('#J_ToolModel').modal('show');
    });

    var tpl = [];
    $.each(toolsList, function(value, key){
        tpl.push("<option value='"+value+"'>"+key+"</option>");
    });

    //切换tool select
    $("#J_ToolsList").append(tpl.join('')).change(function(e){
        $('#J_ToolsError').hide();
        $('#J_ToolsKey').attr('placeholder', $(this).val());
    });

    //添加一个tool
    $('#J_ToolsUse').click(function(e){
        $('#J_ToolsError').hide();
        if(!$('#J_ToolsList').val()) {
            $('#J_ToolsError').text('请先选择一个工具类！').show();
            return;
        }

        if(!$('#J_ToolsKey').val() || $('#J_ToolsKey').val() === $('#J_ToolsKey').attr('placeholder')) {
            $('#J_ToolsError').text('请填写一个和默认key不同的key值！').show();
            return;
        }

        if(tools[$('#J_ToolsKey').val()]) {
            $('#J_ToolsError').text('当前key值已经存在，请添加一个不存在的值或者删除旧值！').show();
            return;
        }

        var TPL = ['<div class="btn-group" data-toolkey="',
            $('#J_ToolsKey').val(),
            '"><a class="btn btn-small btn-info J_Tooltip" rel="tooltip"',
            'href="#" data-placement="top" data-original-title="',
            $('#J_ToolsList option:selected').text(),
            '"><i class="icon-wrench icon-white"></i> ',
            $('#J_ToolsKey').val(),
            '</a><a class="btn btn-small btn-info dropdown-toggle" data-toggle="dropdown" href="#">',
            '<span class="caret"></span></a> <ul class="dropdown-menu"><li>',
            '<a href="#" class="J_DeleteTool"><i class="icon-trash"></i> Delete</a></li></ul></div>'].join('');

        $(TPL).appendTo($('#J_ToolslistMock')).find('.J_DeleteTool').click(function(e){
            e.preventDefault();
            //delete data
            delete tools[$(this).parents('.btn-group').attr('data-toolkey')];
            //remove dom
            $(this).parents('.btn-group').remove();
        }).end().find('.J_Tooltip').tooltip();

        tools[$('#J_ToolsKey').val()] = $('#J_ToolsList option:selected').text();

        $("#J_ToolsList").get(0).selectedIndex = 0;
        $('#J_ToolsKey').val('').attr('placeholder', 'key');
    });

    $('#J_BtnConfirm').click(function(e){
        e.preventDefault();
        $('#J_ToolslistConfirm').append($('#J_ToolslistMock').children());
        //hide model
        $('#J_ToolModel').modal('hide');
    });

});
