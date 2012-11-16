/**
 * @fileoverview
 * @author уем╕ <zhangting@taobao.com>
 *
 */
$(function () {
    var data = $('#J_TreeData').val();
    $.fn.zTree.init($("#configTree"), {
        showLine: true,
        checkable: true
    }, $.parseJSON(data));
});