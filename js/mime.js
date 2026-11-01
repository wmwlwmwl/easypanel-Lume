function mime_add()
{
	var file_ext = $("#file_ext").val();
	if (file_ext == "") {
		return alert("文件扩展名不能为空");
	}
	var mime_type = $("#mime_type").val();
	if (mime_type == "") {
		return alert("mime类型不能为空");
	}
	var cache_time = $("#cache_time").val();
	var gzip = 0;
	if ($("#gzip").is(':checked')) {
		gzip = 1;
	}
	ep_ajax('?c=mime&a=mimeAdd', 'file_ext=' + file_ext + '&mime_type=' + mime_type + '&cache_time=' + cache_time + '&gzip=' + gzip, {sync: false});
}

function del_mime(val)
{
	ep_ajax('?c=mime&a=mimeDel', 'file_ext=' + val, {confirm: '确认删除?', sync: false});
}
