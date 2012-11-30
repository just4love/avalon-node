/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */
$(function () {
    $('#J_AddSnap').click(function(ev){
        ev.preventDefault();

        $('#J_Progress').fadeIn();

    });

    var data = $('#J_TreeData').val();
    $.fn.zTree.init($("#configTree"), {
        showLine: true,
        checkable: true
    }, $.parseJSON(data));

    SyntaxHighlighter.config.clipboardSwf = '/syntaxhighlighter/scripts/clipboard.swf';
    SyntaxHighlighter.all();
});