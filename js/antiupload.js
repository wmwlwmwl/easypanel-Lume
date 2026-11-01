function antiupload_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=antiupload&a=antiuploadStart',data);
}

function antiupload_empty()
{
	ep_ajax('?c=antiupload&a=antiuploadEmpty', null, {confirm: '确定要清除所有防上传的设置吗?'});
}

function antiupload_add()
{
	var filename = $("#filename").val();
	if (filename == "") {
		return alert("文件后缀不能为空");
	}
	ep_ajax('?c=antiupload&a=antiuploadAdd', 'filename=' + filename);
}

function antiupload_del(id)
{
	ep_ajax('?c=antiupload&a=antiuploadDel', 'id=' + id, {confirm: '确定要删除设置?'});
}
