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
function domain_subdir_value()
{
	if ($("#subdir_base").length === 0) {
		return $("#subdir").val();
	}
	var base = $.trim($("#subdir_base").val());
	var second = $.trim($("#subdir_second").val()).replace(/^\/+|\/+$/g, '');
	if (base === '') {
		return second;
	}
	return second === '' ? base : base + '/' + second;
}
function domain_subdir_set(value, keepFocus)
{
	value = value || '';
	if ($("#subdir_base").length === 0) {
		$("#subdir").val(value).focus();
		return;
	}
	var idx = value.indexOf('/');
	var base = idx === -1 ? value : value.substring(0, idx);
	var second = idx === -1 ? '' : value.substring(idx + 1);
	$("#subdir_base").val(base);
	$("#subdir_second").val(second);
	subdir_base_last = base;
	subdir_base_dirty = false;
	if (!keepFocus) {
		$("#subdir_second").focus();
	}
	domain_subdir_refresh();
}
// 目录候选：抓取文件管理列表页解析目录名，不依赖后端接口。
// ponytail: 抓取会顺带改写 webftp 会话的当前目录，抓完统一复位到根目录；
// 候选按目录缓存到刷新页面为止。需要更干净的实现时升级路径是加一个返回 JSON 的列目录接口。
var subdir_list_cache = {};
var subdir_base_last = null;
var subdir_base_dirty = false;
var subdir_restore_timer = null;
function domain_subdir_restore()
{
	// 把在线文件的默认入口目录复位到根，避免下次打开时停在抓取过的目录
	clearTimeout(subdir_restore_timer);
	subdir_restore_timer = setTimeout(function () {
		$.get('?c=index&a=webftp&dir=');
	}, 500);
}
// 从文件管理列表页里取目录名；不是列表页（未登录、目录不存在等）返回 null
function domain_subdir_parse(html)
{
	// 目录名取链接文字：后端用 htmlspecialchars 输出，解析后即原名；
	// getfile() 参数里是 addslashes 转义过的，不能直接用
	var $wrap = $('<div>').append($.parseHTML(typeof html === 'string' ? html : ''));
	if ($wrap.find('#fileblock').length === 0) return null;
	var names = [], seen = {};
	$wrap.find('a[title="进入目录"]').each(function () {
		var n = $.trim($(this).text());
		// 与原后端口径一致：跳过隐藏目录、上级目录与日志目录
		if (!n || n === '..' || n.charAt(0) === '.' || n === 'logs' || seen[n]) return;
		seen[n] = 1;
		names.push(n);
	});
	names.sort();
	return names;
}
function domain_subdir_list(base, done)
{
	if (subdir_list_cache[base]) {
		done(subdir_list_cache[base]);
		return;
	}
	$.get('?c=index&a=webftp&dir=' + encodeURIComponent(base), function (html) {
		var names = domain_subdir_parse(html);
		if (!names) return;
		subdir_list_cache[base] = names;
		done(names);
	}).always(domain_subdir_restore);
}
function domain_subdir_fill(sel, names)
{
	var list = $(sel);
	if (list.length === 0) return;
	list.empty();
	$.each(names, function (i, name) {
		list.append($("<option>").val(name));
	});
}
// 二级候选：按当前一级目录取子目录，一级为空取根目录候选
function domain_subdir_refresh()
{
	if ($("#subdir_second_list").length === 0) return;
	clearTimeout(domain_subdir_refresh.timer);
	domain_subdir_refresh.timer = setTimeout(function () {
		var base = $.trim($("#subdir_base").val()).replace(/^\/+|\/+$/g, '');
		if (base.indexOf('..') !== -1) return;
		domain_subdir_list(base, function (names) {
			// 请求期间一级目录又变了则丢弃过期结果
			var cur = $.trim($("#subdir_base").val()).replace(/^\/+|\/+$/g, '');
			if (cur !== base) return;
			domain_subdir_fill('#subdir_second_list', names);
		});
	}, 200);
}
// 目录候选下拉：自绘弹层替代浏览器原生 datalist 下拉（原生弹层内部样式不可控）
var ep_combo = { $in: null, $box: null, index: -1 };
function ep_combo_close()
{
	if (ep_combo.$box) {
		ep_combo.$box.hide().empty();
	}
	if (ep_combo.$in) {
		ep_combo.$in.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
	}
	ep_combo.$in = null;
	ep_combo.index = -1;
}
function ep_combo_mark()
{
	var $items = ep_combo.$box.children('.ep-combo-item');
	$items.removeClass('is-on');
	var $cur = $items.eq(ep_combo.index).addClass('is-on');
	ep_combo.$in.attr('aria-activedescendant', $cur.attr('id'));
	var box = ep_combo.$box[0];
	var top = $cur[0].offsetTop;
	if (top < box.scrollTop) {
		box.scrollTop = top;
	} else if (top + $cur[0].offsetHeight > box.scrollTop + box.clientHeight) {
		box.scrollTop = top + $cur[0].offsetHeight - box.clientHeight;
	}
}
function ep_combo_open($in, filter)
{
	ep_combo_close();
	var val = $.trim($in.val()).toLowerCase();
	var values = [];
	$in.siblings('datalist').find('option').each(function () {
		var v = String($(this).val());
		if (v === '') return;
		if (!filter || val === '' || v.toLowerCase().indexOf(val) !== -1) {
			values.push(v);
		}
	});
	if (!values.length) return;
	if (!ep_combo.$box) {
		ep_combo.$box = $('<div id="ep_combo_list" class="ep-combo-list" role="listbox"></div>').appendTo('body');
	}
	ep_combo.$in = $in;
	$.each(values, function (i, v) {
		ep_combo.$box.append($('<div class="ep-combo-item" role="option"></div>').attr('id', 'ep_combo_opt_' + i).attr('title', v).text(v));
	});
	ep_combo.index = 0;
	$in.attr({'aria-expanded': 'true', 'aria-activedescendant': 'ep_combo_opt_0'});
	ep_combo.$box.show();
	ep_combo_place();
	ep_combo_mark();
}
function ep_combo_place()
{
	// 优先输入框下方，空间不足翻转到上方；滚动/缩放时保持跟随而不是关闭
	if (!ep_combo.$in || !ep_combo.$box) return;
	var r = ep_combo.$in[0].getBoundingClientRect();
	var h = ep_combo.$box[0].offsetHeight;
	var top = r.bottom + 4;
	if (r.bottom + 4 + h > window.innerHeight && r.top - 4 - h > 0) {
		top = r.top - 4 - h;
	}
	ep_combo.$box.css({left: r.left + 'px', top: top + 'px', width: r.width + 'px'});
}
function ep_combo_pick(v)
{
	var $in = ep_combo.$in;
	ep_combo_close();
	if ($in) {
		$in.val(v).trigger('change').focus();
	}
}
function ep_combo_init()
{
	$('.ep-combo').each(function () {
		var $wrap = $(this);
		var $in = $wrap.find('input').first();
		if (!$in.length || !$wrap.find('datalist').length) return;
		$in.attr({'aria-haspopup': 'listbox', 'aria-expanded': 'false'});
		$in.on('keydown', function (e) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				if (!ep_combo.$in || ep_combo.$in[0] !== this) {
					ep_combo_open($in, false);
					return;
				}
				var n = ep_combo.$box.children('.ep-combo-item').length;
				ep_combo.index = (ep_combo.index + (e.key === 'ArrowDown' ? 1 : -1) + n) % n;
				ep_combo_mark();
			} else if (e.key === 'Enter') {
				if (ep_combo.$in && ep_combo.$in[0] === this) {
					e.preventDefault();
					ep_combo_pick(ep_combo.$box.children('.ep-combo-item').eq(ep_combo.index).text());
				}
			} else if (e.key === 'Escape') {
				if (ep_combo.$in) {
					e.preventDefault();
					e.stopPropagation();
					ep_combo_close();
				}
			}
		});
		// 输入时按内容过滤候选，无匹配则收起（可继续自由输入）
		$in.on('input', function () {
			ep_combo_open($in, true);
		});
		$in.on('blur', ep_combo_close);
		// 点箭头：阻止默认聚焦行为，避免先 blur 关闭导致开关状态判断错乱
		$wrap.on('mousedown', '.ep-combo-arrow', function (e) {
			e.preventDefault();
		});
		$wrap.on('click', '.ep-combo-arrow', function () {
			$in.focus();
			if (ep_combo.$in && ep_combo.$in[0] === $in[0]) {
				ep_combo_close();
			} else {
				ep_combo_open($in, false);
			}
		});
	});
	// 选择项：mousedown 先于 blur 执行并阻止失焦，click 兼容触屏
	$(document).on('mousedown click', '.ep-combo-item', function (e) {
		e.preventDefault();
		ep_combo_pick($(this).text());
	});
	$(document).on('mousedown', function (e) {
		if (ep_combo.$box && !$(e.target).closest('.ep-combo, .ep-combo-list').length) {
			ep_combo_close();
		}
	});
	$(window).on('scroll resize', ep_combo_place);
}
function domain_add()
{
	var domain = normalize_domain($("#domain").val());
	$("#domain").val(domain);
	var subdir = domain_subdir_value();
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
	var html = '<label class="ep-inline-check"><input id="replace" name="replace" type="checkbox" value="1" checked> 覆盖已绑定域名</label>';
		html += '<div class="ep-hint">一行一个，域名和 IP（或目录）用空格分割</div>';
		html += '<textarea id="domain_import_value" rows="8" placeholder="www.cdn.com 192.168.1.2"></textarea>';
		html += '<div class="ep-dialog-actions"><button type="button" class="btn btn-default" onclick="layer.close(dialog.index)">取消</button><button type="button" class="btn btn-primary" onclick="domain_import()">导入</button></div>';
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
					addmsg += ' class="ep-text-success">';
				}else {
					addmsg +=' class="ep-text-danger">';
				}
				addmsg += domain + a + '</b><br>';
			},
			error:function() {
				addmsg += '<b class="ep-text-danger">' + domain + '请求失败</b><br>';
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
				domain_subdir_set(data.subdir);
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
	domain_subdir_set(subdir_base_default || '');
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

var subdir_base_default = null;
$(function () {
	ep_combo_init();
	if ($("#subdir_base").length) {
		// 模板只提供完整默认目录，先拆成一级/二级两段
		subdir_base_default = $("#subdir_base").val();
		domain_subdir_set(subdir_base_default || '', true);
		// 一级候选 = 站点根目录下的目录列表
		domain_subdir_list('', function (names) {
			domain_subdir_fill('#subdir_base_list', names);
		});
	}
	// 输入一级时只刷新二级候选，并记录一级确实被改过（不比较最终值，改回原值也算改过）
	$("#subdir_base").on('input', function () {
		if ($.trim($(this).val()) !== subdir_base_last) {
			subdir_base_dirty = true;
		}
		domain_subdir_refresh();
	});
	// 离开一级输入框或点选下拉项时，若一级被改过（含改回原值）就清空二级
	$("#subdir_base").on('change', function () {
		var cur = $.trim($(this).val());
		// 下拉选择不触发 input，所以还要比较当前值
		if (subdir_base_dirty || cur !== subdir_base_last) {
			// 后端不校验目录是否存在，留着旧二级值会绑定到不存在的目录
			$("#subdir_second").val('');
			subdir_base_last = cur;
			subdir_base_dirty = false;
		}
		domain_subdir_refresh();
	});
	$("#domain").on('blur', function () {
		this.value = normalize_domain(this.value);
	});
});
