function cache_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=cache&a=cacheCheckOn',data);
}

function cache_add()
{
	var mode = $("#mode").val();
	var cache_value = $("#cache_value").val();
	var max_age = $("#max_age").val();
	if (max_age == "") {
		return alert("缓存时间不能为空");
	}
	if (cache_value == "") {
		return alert("值不能为空");
	}
	var s = $("#static").is(':checked');
	if (!s) {
		s = "";
	}else {
		s = 1;
	}
	ep_ajax('?c=cache&a=cacheAdd', "mode=" + mode + "&cache_value=" + cache_value + "&max_age=" + max_age + "&static=" + s);
}

function cache_help(val)
{
	var content = '';
	if (val == 'url') {
		content = "不能多个，可以用正则表示，如<br>http://www.kanglesoft.com/.*";
	}
	if (val == 'file_ext') {
		content = "可以添加多个，如<br>php|asp|jsp";
	}
	if (val == 'content-type') {
		content = "不能多个，可以用正则表示，如<br>text/ht*,text/*";
	}
	if (!content) {
		return;
	}
	cache_help.index = epDialog('小纸条', content);
}

function cache_del(id)
{
	ep_ajax('?c=cache&a=cacheDel', 'id=' + id, {confirm: '确定要删除?'});
}
