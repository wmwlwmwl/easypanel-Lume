// 统一 ajax 提交封装：成功刷新、失败提示不刷新、网络失败提示
// opts: type, confirm, raw(总是提示原样返回), successText, successMessage,
//       reload(false 不刷新 / 'always' 失败也刷新), sync, trim, dataType, errorText, onSuccess
function ep_ajax(url, data, opts) {
	opts = opts || {};
	if (opts.confirm && !confirm(opts.confirm)) {
		return;
	}
	$.ajax({
		type: opts.type || 'post',
		url: url,
		data: data,
		dataType: opts.dataType,
		success: function (msg) {
			var text = opts.trim ? $.trim(msg) : msg;
			var ok = opts.raw || text == (opts.successText || '成功');
			if (!ok) {
				alert(text);
				if (opts.reload === 'always') {
					window.location.reload();
				}
				return;
			}
			if (opts.raw) {
				alert(text);
			}
			if (opts.successMessage) {
				alert(opts.successMessage);
			}
			if (opts.onSuccess && opts.onSuccess(text) === false) {
				return;
			}
			if (opts.reload === false) {
				return;
			}
			window.location.reload();
		},
		complete: function () {
			if (opts.sync !== false) {
				show_sync();
			}
		},
		error: function () {
			alert(opts.errorText || '请求失败，请稍后重试');
		}
	});
}

// 覆盖框架 public.js 的 show_sync：旧 artDialog 提示改为 layer 提示
function show_sync() {
	layer.msg('正在执行中,请稍后...', {icon: 16, time: 3000, shade: 0.1});
	$("#script").html("<script language='javascript' src='?c=index&a=sync'></scr" + "ipt>");
}

// 统一内容弹窗（layer），返回 layer 索引，可用于 layer.close(index)
function epDialog(title, content, opts) {
	opts = opts || {};
	var area = opts.area || ($(window).width() > 720 ? '460px' : '92%');
	return layer.open({
		type: 1,
		title: title,
		area: [area, 'auto'],
		shade: opts.shade === undefined ? 0.1 : opts.shade,
		content: '<div class="ep-dialog-body">' + content + '</div>',
		time: opts.time || 0,
		btn: opts.btn,
		end: opts.end
	});
}
