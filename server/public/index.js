/**
 * @fileoverview
 * @author ��ͦ <zhangting@taobao.com>
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
            name:"���ڵ�1 - չ��",
            open:true,
            children:[
                { name:"���ڵ�11 - �۵�", open:true,
                    children:[
                        { name:"Ҷ�ӽڵ�111"},
                        { name:"Ҷ�ӽڵ�112"},
                        { name:"Ҷ�ӽڵ�113"},
                        { name:"Ҷ�ӽڵ�114", open:true,
                            children:[
                                { name:"Ҷ�ӽڵ�111"},
                                { name:"Ҷ�ӽڵ�112"},
                                { name:"Ҷ�ӽڵ�113"},
                                { name:"Ҷ�ӽڵ�114"}
                            ]}
                    ]}]
        }
    ];

    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
});
