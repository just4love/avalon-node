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
            location.reload();
        });
    });

    $('.J_RemoveDomain').click(function(e){
        e.preventDefault();
        $.post('/proxy/removeDomain', {
            domain:$(this).parent().children('.J_Domain').val()
        }, function(data){
            location.reload();
        });
    });

    $('#J_AddNewRule').click(function(e){
        e.preventDefault();
        $.post('/proxy/addRule', {
            pattern:$('#J_Pattern').val(),
            target:$('#J_Target').val()
        }, function(data){
            location.reload();
        });
    });

});
