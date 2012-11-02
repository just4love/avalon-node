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
});
