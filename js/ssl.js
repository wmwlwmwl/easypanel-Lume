function ssl_disable(form, scope)
{
	var message = scope === 'domain'
		? '确定关闭该域名的独立SSL证书？'
		: '确定关闭当前账号的默认SSL证书？';
	ep_confirm(message, function () {
		form.elements['certificate'].value = '';
		form.elements['certificate_key'].value = '';
		form.submit();
	});
	return false;
}

var ssl_switch_prev;

function ssl_switch_dirty()
{
	var nodes = document.querySelectorAll('textarea[name=certificate], textarea[name=certificate_key]');
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].value !== nodes[i].defaultValue) return true;
	}
	return false;
}

function ssl_switch_go()
{
	var select = document.getElementById('ssl_switch');
	var domain = select ? select.value : '';
	var go = function () {
		location.href = domain
			? '?c=ssl&a=domainSslForm&domain=' + encodeURIComponent(domain)
			: '?c=ssl&a=sslForm';
	};
	if (ssl_switch_dirty()) {
		ep_confirm('有未提交的证书内容，切换将丢失，是否继续？', go, {
			okText: '继续切换',
			cancel: function () {
				if (select) select.value = ssl_switch_prev;
			}
		});
		return;
	}
	go();
}

(function () {
	var sel = document.getElementById('ssl_switch');
	if (!sel) return;
	ssl_switch_prev = sel.value;
	sel.onchange = ssl_switch_go;
})();

function hsts_checkon(val)
{
	var data = 'status=' + val;
	var domain = document.getElementById('domain');
	if (domain && domain.value) {
		data += '&domain=' + encodeURIComponent(domain.value);
	}
	functoin_checkon('?c=ssl&a=hsts', data);
}

function http2_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=ssl&a=http2',data);
}

function http3_checkon(val)
{
	var data = 'status=' + val;
	functoin_checkon('?c=ssl&a=http3',data);
}
