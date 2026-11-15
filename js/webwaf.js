function webwafSwitch(status) {
    ep_confirm(status === 1 ? '确定开启Web安全防护吗？' : '确定关闭Web安全防护吗？', function () {
        ep_ajax('?c=webwaf&a=webwafSwitch', {status: status}, {trim: true, errorText: '操作失败，请稍后重试'});
    });
}
