/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */

var toolsList = {
    "uri":{
        class:"URL类型(直接输入url即可)",
        props:{
            uri:"http://assets.daily.taobao.net"
        }
    },
    tmsTool: {
        class:"web.tools.webx.TmsTool",
        props:{
            env:["dev","online"]
        }
    },
    cmsTool:{
        class:"web.tools.webx.CmsTool"
    },
    stringUtil:{
        class:"com.alibaba.common.lang.StringUtil"
    },
    tbStringUtil:{
        class:"com.taobao.util.TBStringUtil"
    },
    securityUtil:{
        class:"com.taobao.security.util.SecurityUtil"
    },
    systemUtil:{
        class:"com.alibaba.common.lang.SystemUtil"
    },
    randomUtil:{
        class:"com.taobao.util.RandomUtil"
    },
    calendarUtil:{
        class:"com.taobao.util.CalendarUtil"
    },
    dateUtil:{
        class:"com.taobao.util.DateUtils"
    },
    collectionUtil:{
        class:"com.taobao.util.CollectionUtil"
    },
    mapUtil:{
        class:"com.taobao.util.MapUtil"
    },
    stringEscapeUtil:{
        class:"com.alibaba.common.lang.StringEscapeUtil"
    },
    csrfToken:{
        class:"web.tools.webx.CsrfTokenTool"
    }
};
var tools = {};

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

var propTPLRender = function(data){

    if($.isArray(data.propValue)) {
        var selecttpl = [];
        selecttpl.push('<select>');
        $.each(data.propValue, function(k, v){
            selecttpl.push('<option value="'+v+'">' + v + '</option>');
        });
        selecttpl.push('</select>');

        return ['<div class="control-group">',
            '<label class="control-label" style="width: 60px;">',
            data.propKey,
            '</label>',
            '<div class="controls" style="margin-left: 80px;">',
            selecttpl.join(''),
            '</div></div>'].join('');
    } else {
        return ['<div class="control-group">',
            '<label class="control-label" style="width: 60px;">',
            data.propKey,
            '</label>',
            '<div class="controls" style="margin-left: 80px;">',
            '<input class="span4" type="text" placeholder="',
            data.propValue,
            '"></div></div>'].join('');
    }
};

$(function () {

    $('#J_AddTools').click(function(){
        $('#J_ToolModel').modal('show');
    });

    var tpl = [];
    $.each(toolsList, function(key, value){
        tpl.push("<option value='"+key+"'>"+value.class+"</option>");
    });

    //切换tool select
    $("#J_ToolsList").append(tpl.join('')).change(function(e){
        $('#J_ToolsError').hide();
        $('#J_ToolsProps').html('');
        var key = $(this).val();
        if(key === 'uri') {
            $('#J_ToolsKey').attr('placeholder', 'uiModule');
        } else {
            $('#J_ToolsKey').attr('placeholder', key);
        }

        if(toolsList[key].props) {
            $.each(toolsList[key].props, function(k, v){
                $(propTPLRender({
                    propKey: k,
                    propValue: v
                })).appendTo($('#J_ToolsProps'));
            });
        }
    });

    //添加一个tool
    $('#J_ToolsUse').click(function(e){
        $('#J_ToolsError').hide();
        if(!$('#J_ToolsList').val()) {
            $('#J_ToolsError').text('请先选择一个工具类！').show();
            return;
        }

        if(!$('#J_ToolsKey').val() || $('#J_ToolsKey').val() === $('#J_ToolsKey').attr('placeholder')) {
            $('#J_ToolsError').text('请填写一个和默认变量不同的变量值！').show();
            return;
        }

        if(tools[$('#J_ToolsKey').val()]) {
            $('#J_ToolsError').text('当前变量值已经存在，请添加一个不存在的值或者删除旧值！').show();
            return;
        }

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
