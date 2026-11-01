function banip_ctrl()
{
	return window.epListController || 'banip';
}

function banip_add()
{
	var ip = $("#ip").val();
	if (ip == ""){
		return alert("IP不能为空");
	}
	ep_ajax('?c=' + banip_ctrl() + '&a=addBanip', 'ip=' + encodeURIComponent(ip));
}

function banurl_add()
{
	var url = $.trim($("#url").val());
	var meth = $("#meth").val();
	if (url === "" && meth === ""){
		return alert("URL和请求方法不能同时为空");
	}
	ep_ajax('?c=' + banip_ctrl() + '&a=addBanurl', 'url=' + encodeURIComponent(url) + '&meth=' + encodeURIComponent(meth));
}

function banip_del(id)
{
	ep_ajax('?c=' + banip_ctrl() + '&a=delBanip', 'id=' + id, {confirm: '确定要删除?'});
}

function banurl_del(id)
{
	ep_ajax('?c=' + banip_ctrl() + '&a=delBanurl', 'id=' + id, {confirm: '确定要删除?'});
}

function banip_del_all()
{
	ep_ajax('?c=' + banip_ctrl() + '&a=delBanipAll', null, {type: 'get', confirm: '确定要清空全部IP?'});
}

function banurl_del_all()
{
	ep_ajax('?c=' + banip_ctrl() + '&a=delBanurlAll', null, {type: 'get', confirm: '确定要清空全部URL?'});
}

function banip_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=' + banip_ctrl() + '&a=switchIp',data);
}

function banurl_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=' + banip_ctrl() + '&a=switchUrl',data);
}
