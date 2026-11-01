function indexfile_add()
{
	var file = $("#file").val();
	if (file == "") {
		return alert("文件名不能为空");
	}
	var id = $("#id").val();
	ep_ajax('?c=indexfile&a=indexfileAdd', 'file=' + file + '&id=' + id, {sync: false});
}

function indexfile_del(val)
{
	ep_ajax('?c=indexfile&a=indexfileDel', 'file=' + val, {confirm: '确定要删除?', sync: false});
}
