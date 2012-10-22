/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
$(function(){
    $('#J_AddNewApp').click(function(e){
        e.preventDefault();
        $('#addNewAppModal').modal();
    });

    var setting = {
        showLine:true,
        checkable:true
    };

    var zNodes = [
        {
            name:"父节点1 - 展开",
            open:true,
            children:[
                { name:"父节点11 - 折叠", open:true,
                    children:[
                        { name:"叶子节点111"},
                        { name:"叶子节点112"},
                        { name:"叶子节点113"},
                        { name:"叶子节点114", open:true,
                            children:[
                                { name:"叶子节点111"},
                                { name:"叶子节点112"},
                                { name:"叶子节点113"},
                                { name:"叶子节点114"}
                            ]}
                    ]}]
        }
    ];

    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
});
