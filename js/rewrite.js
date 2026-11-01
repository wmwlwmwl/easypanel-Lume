function rewrite_add()
{
	var code = $("#code").val();
	var dst = $("#dst").val();
	var host = $("#host").val();
	if (host == "") {
		return alert("域名不能为空");
	}
	if (dst == "") {
		return alert("跳转域名不能为空");
	}
	if (code == "") {
		code = 301;
	}
	ep_ajax('?c=rewrite&a=rewriteAdd', 'host=' + host + '&dst=' + dst + '&code=' + code, {sync: false});
}

function rewrite_del(id)
{
	ep_ajax('?c=rewrite&a=rewriteDel', 'id=' + id, {confirm: '确定要删除?', sync: false});
}

function help()
{
	var msg = "可以将一个域名做301,302跳转到另外一个域名<p><button type='button' class='btn btn-primary' onclick='example();'>例子</button></p>";
	help.index = epDialog('帮助', msg);
}

function example()
{
	document.getElementById('host').value = 'www.kanglesoft.com';
	document.getElementById('dst').value = 'kanglesoft.com';
	layer.close(help.index);
}
