/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
$(function () {
    $('.J_RuleEnabled').each(function(idx, el){
        $(el).click(function(e){
            $(this).button('toggle').toggleClass('btn-success');
        });

        if($(el).attr('data-enable') == 'true') {
            $(el).button('toggle').addClass('btn-success');
        }
    });

    $('#J_SortRules').dragsort();

    //添加代理域名转ip
    $('#J_AddNewDomain').click(function(e){
        e.preventDefault();
        $.post('/proxy/addDomain', {
            domain:$('#J_Domain').val(),
            proxyDomain:$('#J_ProxyIp').val()
        }, function(data){
            if(data.success) {
                location.reload();
            } else {
                alert(data.msg);
            }
        });
    });

    $('.J_RemoveDomain').click(function(e){
        e.preventDefault();
        $.post('/proxy/removeDomain', {
            domain:$(this).parent().children('.J_Domain').val()
        }, function(data){
            if(data.success) {
                location.reload();
            } else {
                alert(data.msg);
            }
        });
    });

    $('#J_AddNewRule').click(function(e){
        e.preventDefault();
        $.post('/proxy/addRule', {
            pattern:$('#J_Pattern').val(),
            target:$('#J_Target').val(),
            charset: $('#J_Charset').attr('checked') ? 'utf-8' : 'gbk'
        }, function(data){
            if(data.success) {
                location.reload();
            } else {
                alert(data.msg);
            }
        });
    });

    $('#J_Save').click(function(e){
        e.preventDefault();
        var rules = [];
        $('#J_SortRules .J_Sort').each(function(idx, el){
            rules.push({
                pattern: $('.J_RulePattern', el).val(),
                target: $('.J_RuleTarget', el).val(),
                charset: $('.J_RuleCharset', el).attr('checked') ? 'utf-8' : 'gbk',
                enable: $('.J_RuleEnabled', el).hasClass('active')
            });
        });

        $.post('/proxy/updateRule', {
            rules: JSON.stringify(rules)
        }, function(data){
            if(data.success) {
                location.reload();
            } else {
                alert(data.msg);
            }
        });
    });

    $('.J_RuleRemove').click(function(ev){
        ev.preventDefault();
        $(this).parent().remove();
    });
});
