var replace = 0;
function cname_target()
{
	var note = $("#domain_note").text();
	var prefix = 'CNAME解析到：';
	if (note.indexOf(prefix) === 0) {
		return $.trim(note.substring(prefix.length)).toLowerCase();
	}
	return '';
}
function is_cname_domain(domain)
{
	var target = cname_target();
	return target !== '' && $.trim(domain).toLowerCase() === target;
}
function normalize_domain(domain)
{
	domain = $.trim(domain);
	domain = domain.replace(/^(?:https?:\/\/|\/\/)/i, '');
	domain = domain.replace(/\/.*$/, '');
	return $.trim(domain);
}
function domain_add()
{
	var domain = normalize_domain($("#domain").val());
	$("#domain").val(domain);
	var subdir = $("#subdir").val();
	var proto = $("#proto").val();
	if(domain == ''){
		return alert('域名不能为空');
	}
	if(is_cname_domain(domain)){
		return alert('该域名为CNAME接入域名,不能绑定');
	}
	if($("#proto").length>0 && subdir==''){
		return alert('源站IP不能为空');
	}
	ep_ajax('?c=domain&a=add', {domain:domain, subdir:subdir, proto:proto, replace:replace}, {reload:'always'});
}
var dialog = null;
function domain_import_dialog()
{
	var html = '<div>覆盖:<input id="replace" name="replace" type=checkbox value=1 checked></div>';
		html += '<div class="piao_div">一行一个，域名和IP(或目录)用空格分割</div>';
		html += '<div class="piao_div"><textarea id="domain_import_value" rows=10 cols=60 placeholder="www.cdn.com 192.168.1.2"></textarea></div>';
		html += '<div><button type="button" class="btn btn-primary" onclick="domain_import()">导入</button></div>';
		var index = epDialog('批量添加域名绑定', html, {area: $(window).width() > 720 ? '520px' : '92%'});
		dialog = { index: index };
}
function domain_import()
{
	var values = $("#domain_import_value").val();
	var doReplace = $("#replace").prop('checked') ? 1 : 0;
	if (!values) {
		return false;
	}
	layer.close(dialog.index);
	var addmsg = '';
	var last = null;
	var index = 0;
	var rows = values.split(/\r?\n/).map(function (row) {
		return $.trim(row);
	}).filter(function (row) {
		return row !== '';
	});
	var showResult = function () {
		if (!addmsg) return;
		epDialog('批量导入', addmsg, {
			area: $(window).width() > 720 ? '520px' : '92%',
			end: function () {
				window.location = window.location;
			}
		});
	};
	var next = function () {
		if (index >= rows.length) {
			showResult();
			return;
		}
		var row = rows[index++].split(' ');
		var domain = normalize_domain(row[0]);
		if (!domain) {
			next();
			return;
		}
		if (is_cname_domain(domain)) {
			addmsg += domain + '为CNAME接入域名,不能绑定<br>';
			next();
			return;
		}
		var ip = row[1];
		if (!ip) {
			if (last) {
				ip = last;
			}else {
				addmsg += domain + '没有值,增加失败<br>';
				next();
				return;
			}
		}
		$.ajax({
			url:'?c=domain&a=add',
			type:'get',
			data:{
				domain:domain,subdir:ip,replace:doReplace
			},
			success:function(a) {
				addmsg += "<b";
				if (a =='成功') {
					last = ip;
					addmsg += ' class="green">';
				}else {
					addmsg +=' class="red">';
				}
				addmsg += domain + a + '</b><br>';
			},
			error:function() {
				addmsg += '<b class="red">' + domain + '请求失败</b><br>';
			},
			complete:next
		});
	};
	next();
}
function domain_del(val)
{
	if (!confirm("确定要删除?")) {
		return;
	}
	ep_ajax('?c=domain&a=del', {domain:val}, {reload:'always'});
}
function domain_edit(val)
{
	$.ajax({
		type:'GET',
		url: '?c=domain&a=info&domain=' + val,
		dataType: "json",
		success:function(data){
			if(data.code == 0){
				$("#domain").val(val);
				$("#domain").attr("disabled", true);
				$("#domain_edit_tip").show();
				$("#subdir").val(data.subdir).focus();
				$("#proto").val(data.proto);
				$("#button_import").hide();
				$("#button_cancel").show();
				replace = 1;
			}else{
				return alert(data.msg);
			}
		}
	});
}
function cancel_edit()
{
	$("#domain").val("");
	$("#domain").attr("disabled", false);
	$("#domain_edit_tip").hide();
	if($("#proto").length>0){
		$("#subdir").val("");
		$("#proto").val('http');
	}
	$("#button_import").show();
	$("#button_cancel").hide();
	replace = 0;
}

function domain_note_value()
{
	var note = $.trim($("#domain_note").text());
	var idx = note.indexOf('：');
	if (idx == -1) idx = note.indexOf(':');
	return idx == -1 ? note : $.trim(note.substring(idx + 1));
}
function copy_domain_note()
{
	var val = domain_note_value();
	if (val == '') return alert('暂无可复制内容');
	var done = function(){
		var b = $("#domain_note_copy");
		var o = b.text();
		b.text('已复制');
		setTimeout(function(){ b.text(o); }, 1500);
	};
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(val).then(done).catch(function(){ fallback_copy(val, done); });
	} else {
		fallback_copy(val, done);
	}
}
function fallback_copy(text, done)
{
	var ta = document.createElement('textarea');
	ta.value = text;
	ta.setAttribute('readonly', '');
	ta.style.position = 'fixed';
	ta.style.left = '-9999px';
	document.body.appendChild(ta);
	ta.select();
	var ok = false;
	try { ok = document.execCommand('copy'); } catch(e) { ok = false; }
	document.body.removeChild(ta);
	if (ok) done();
	else alert('复制失败，请手动复制：' + text);
}

$(function () {
	$("#domain").on('blur', function () {
		this.value = normalize_domain(this.value);
	});
});
