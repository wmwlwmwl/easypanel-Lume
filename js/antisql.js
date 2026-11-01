function antisql_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=antisql&a=antisqlCheckOn',data);
}

function antisql_del(id)
{
	ep_ajax('?c=antisql&a=antisqlDel', {id: id}, {confirm: '确定要删除?'});
}

function antisql_add()
{
	var param = $("#param").val();
	if (param == "") {
		return alert("参数值不能为空");
	}
	var charset = $("#charset").val();
	ep_ajax('?c=antisql&a=antisqlAdd', {param_value: param, charset: charset});
}

function copy_code()
{
	document.getElementById('param').value = "'.*[; ]?((or)|(insert)|(select)|(union)|(update)|(delete)|(replace)|(create)|(drop)|(alter)|(grant)|(load)|(show)|(exec))[\\s(]";
	layer.close(antisql_help.index);
}

function antisql_help()
{
	var msg = "正则输入，如需防sql注入，可用以下正则:<br>";
		msg += "'.*[; ]?((or)|(insert)|(select)|(union)|(update)|(delete)|(replace)|(create)|(drop)|(alter)|(grant)|(load)|(show)|(exec))[\\s(]<br>";
		msg += "<p><button type='button' class='btn btn-primary' onclick='copy_code();'>复制代码</button></p>";
	antisql_help.index = epDialog('帮助', msg);
}
