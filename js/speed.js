function speed_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=speed&a=speedCheckOn',data);
}

function speed_mode_inputs(mode)
{
	var concurrent = mode === 'per_ip';
	document.getElementById('speed-bandwidth-input').style.display = concurrent ? 'none' : '';
	document.getElementById('speed-concurrency-input').style.display = concurrent ? '' : 'none';
	document.getElementById('limit').disabled = concurrent;
	document.getElementById('per_ip_max').disabled = !concurrent;
}

function speed_add()
{
	var mode = $("#mode").val();
	var limit = $("#limit").val();
	var max = $.trim($("#per_ip_max").val());
	if (mode === 'per_ip') {
		if (!/^[0-9]+$/.test(max) || Number(max) < 1 || Number(max) > 2147483647) {
			return alert("单IP并发数必须是1到2147483647之间的整数");
		}
	} else if ($.trim(limit) === "") {
		return alert("带宽值不能为空");
	}
	var path = $("#path").val();
	if (path == document.getElementById("path").defaultValue) {
		path = "";
	}
	if (mode == 'gspeed_limit' && path == "") {
		return alert("该模式目录不能为空!");
	}
	var data = {mode: mode, path: path};
	if (mode === 'per_ip') {
		data.max = max;
	} else {
		data.limit = limit;
	}
	ep_ajax('?c=speed&a=speedAdd', data);
}

function speed_help(mode)
{
	speed_mode_inputs(mode);
	if ($.cookie('not_piao') == 1) {
		return;
	}
	var content = '';
	switch (mode) {
		case 'per_ip':
			content = "限制同一IP同时保持的连接数，超过后拒绝访问<br>";
			break;
		case 'speed_limit':
			content = "该模式可以将某个目录的<b class='ep-text-danger'>每次请求</b>进行带宽限制<br>";
			break;
		case 'ip_speed_limit':
			document.getElementById("path").value = document.getElementById("path").defaultValue;
			content = "该模式可以将<b class='ep-text-danger'>每个IP</b>的连接带宽进行限制<br>";
			break;
		case 'gspeed_limit':
			document.getElementById("path").value='';
			content = "该模式可以将某个目录的<b class='ep-text-danger'>所有请求</b>分为一组，对这一组的总连接带宽进行限制<br>";
			break;
		default:
			content = "错误哦!!!!!!";
			break;
	}
	if (content) {
		speed_help.index = epDialog('小纸条', content);
	}
}

function speed_del(id)
{
	ep_ajax('?c=speed&a=speedDel', 'id=' + id, {confirm: '确认要删除?'});
}

function check_onfocus_value(id)
{
	document.getElementById(id).style.color="#000000"
	document.getElementById(id).value = "";
}

function check_onblur_value(id)
{
	if (document.getElementById(id).value == "" ) {
		document.getElementById(id).style.color="#999999"
		document.getElementById(id).value = document.getElementById(id).defaultValue;
	}
}

$(document).ready(function(){
	speed_mode_inputs($("#mode").val());
	var limit = document.getElementById("limit");
	limit.onblur = function(){
		if (isNaN(limit.value)) {
			alert("输入错误，输入值必需是数字");
		}
	};
});
