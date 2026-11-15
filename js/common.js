// 自绘提示，替代原生 alert；cb 在用户点「确定」后执行
function ep_alert(msg, cb, icon) {
	layer.alert(msg, {
		icon: icon === undefined ? 0 : icon,
		title: '提示',
		shade: 0.1,
		closeBtn: 0
	}, function (index) {
		layer.close(index);
		if (cb) cb();
	});
}

// 自绘二次确认，替代原生 confirm；ok 在点「确定」后执行
function ep_confirm(msg, ok, opts) {
	opts = opts || {};
	layer.confirm(msg, {
		icon: 3,
		title: opts.title || '确认',
		btn: [opts.okText || '确定', opts.cancelText || '取消'],
		shade: 0.1,
		closeBtn: 0
	}, function (index) {
		layer.close(index);
		if (ok) ok();
	}, function () {
		if (opts.cancel) opts.cancel();
	});
}

// 统一 ajax 提交封装：成功刷新、失败提示不刷新、网络失败提示
// opts: type, confirm, raw(总是提示原样返回), successText, successMessage,
//       reload(false 不刷新 / 'always' 失败也刷新), sync, trim, dataType, errorText, onSuccess
function ep_ajax(url, data, opts) {
	opts = opts || {};
	if (opts.confirm) {
		ep_confirm(opts.confirm, function () { ep_send(url, data, opts); });
		return;
	}
	ep_send(url, data, opts);
}

function ep_send(url, data, opts) {
	// 有提示弹层时跳过 show_sync：它的 layer.msg 会关掉提示层，导致提示一闪而过
	var prompted = false;
	$.ajax({
		type: opts.type || 'post',
		url: url,
		data: data,
		dataType: opts.dataType,
		success: function (msg) {
			var text = opts.trim ? $.trim(msg) : msg;
			var ok = opts.raw || text == (opts.successText || '成功');
			if (!ok) {
				prompted = true;
				ep_alert(text, function () {
					if (opts.reload === 'always') {
						window.location.reload();
					}
				});
				return;
			}
			var finish = function () {
				if (opts.onSuccess && opts.onSuccess(text) === false) {
					return;
				}
				if (opts.reload === false) {
					return;
				}
				window.location.reload();
			};
			var tips = [];
			if (opts.raw) {
				tips.push(text);
			}
			if (opts.successMessage) {
				tips.push(opts.successMessage);
			}
			if (tips.length) {
				prompted = true;
				ep_alert(tips.join('<br>'), finish, 1);
				return;
			}
			finish();
		},
		complete: function () {
			if (opts.sync !== false && !prompted) {
				show_sync();
			}
		},
		error: function () {
			prompted = true;
			ep_alert(opts.errorText || '请求失败，请稍后重试', null, 2);
		}
	});
}

// 覆盖框架 public.js 的 show_sync：旧 artDialog 提示改为 layer 提示
function show_sync() {
	layer.msg('正在执行中,请稍后...', {icon: 16, time: 3000, shade: 0.1});
	$("#script").html("<script language='javascript' src='?c=index&a=sync'></scr" + "ipt>");
}

// 覆盖框架 public.js 的 functoin_checkon（函数名拼写保持原样，调用方依赖它）：
// 原生确认框与结果提示改为自绘弹层
function functoin_checkon(url, data) {
	ep_confirm('确认要执行操作?', function () {
		ep_ajax(url, data, {trim: true, reload: 'always'});
	});
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
