function calculate_directory_size(element)
{
	var link = jQuery(element);
	if (link.data('calculating')) { return false; }
	link.data('calculating', true).attr('aria-disabled', 'true');
	var loading = layer.load(2, {shade: [0.1, '#fff']});
	jQuery.ajax({
		type: 'POST',
		url: '?c=webftp&a=directorySize',
		data: {file: link.attr('data-file')},
		dataType: 'json',
		success: function (result) {
			if (result && result.code === 200) {
				link.text(result.formatted).attr('title', result.bytes + ' 字节，点击重新计算');
			} else {
				layer.alert(result && result.msg ? result.msg : '计算失败，请重试', {icon: 2});
			}
		},
		error: function () { layer.alert('计算失败，请检查网络后重试', {icon: 2}); },
		complete: function () {
			layer.close(loading);
			link.data('calculating', false).removeAttr('aria-disabled');
		}
	});
	return false;
}

function webftp_request(action, data, refreshAfter)
{
	var loading = layer.load(2, {shade: [0.1, '#fff']});
	return jQuery.ajax({
		url: '?c=webftp&a=' + action,
		type: 'POST', data: data, dataType: 'json',
		success: function (result) {
			if (!result || result.code != 200) {
				layer.alert(result && result.msg ? result.msg : '操作失败，请重试', {icon: 2});
				return;
			}
			if (refreshAfter) { refresh(); }
			else { layer.msg(result.msg || '操作成功', {icon: 1}); }
		},
		error: function () { layer.alert('请求失败，请检查网络或重新登录后重试', {icon: 2}); },
		complete: function () { layer.close(loading); }
	});
}

function webftp_selected()
{
	var files = get_file_selected();
	if (!files.length) { layer.msg('请选择文件或目录'); }
	return files;
}

function syncaccess() { webftp_request('syncaccess', {}, true); }

function UrlEncode(str) {
	var ret = "";
	for ( var i = 0; i < str.length; i++) {
		var chr = str.charAt(i);
		if (chr == '+') {
			ret += '%2B';
		} else {
			ret += escape(chr);
		}
	}
	return ret;
}
	/**
	 * 文件编辑
	 * @param file
	 */

function editfrom(file) {
    if (typeof ace !== 'undefined') { openEditorView(file); return; }
    editfrom.pending = file;
    if (editfrom.loading) { return; }
    editfrom.loading = true;
    var load = function (src, next) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = next;
        script.onerror = function () {
            editfrom.loading = false;
            editfrom.pending = null;
            layer.alert('代码编辑器未能加载，请检查网络后重试', {icon: 2});
        };
        document.head.appendChild(script);
    };
    load('https://lib.baomitu.com/ace/1.43.3/ace.js', function () {
        load('https://lib.baomitu.com/ace/1.43.3/ext-language_tools.js', function () {
            var target = editfrom.pending || file;
            editfrom.loading = false;
            editfrom.pending = null;
            openEditorView(target);
        });
    });
}
	function addwget(dir)
	{
		var area = $(window).width() > 720 ? '460px' : '92%';
		var index = layer.open({
			type: 1,
			title: '下载文件',
			area: [area, 'auto'],
			shade: 0.1,
			content: '<div class="ep-dialog-body">'
				+ '<form name="wget" action="?c=shell&a=wget" method="post" data-shell-command="1">'
				+ '<label>下载地址</label><input name="url" id="wgeturl">'
				+ '<label>存放文件名</label><input name="filename">'
				+ '<label class="ep-inline-check"><input name="-c" type="checkbox" value="1"> 断点续传</label>'
				+ '<input name="dir" id="wgetdir" type="hidden">'
				+ '</form></div>',
			btn: ['提交', '取消'],
			yes: function () {
				$('form[name=wget]').submit();
				layer.close(index);
			},
			success: function () {
				$('#wgetdir').val(cwd);
				$('#wgeturl').focus();
			}
		});
	}
	/**
	 * 创建目录
	 */
	function mkdir()
	{
		var area = $(window).width() > 720 ? '420px' : '92%';
		var index = layer.open({
			type: 1,
			title: '创建目录',
			area: [area, 'auto'],
			shade: 0.1,
			content: '<div class="ep-dialog-body"><label>目录名</label><input id="mkdirvalue" autocomplete="off"></div>',
			btn: ['确定', '取消'],
			yes: function () {
				var name = $('#mkdirvalue').val();
				if (!name) { layer.msg('目录名称不能为空'); return; }
				webftp_request('mkdir', {dir: name}, true);
				layer.close(index);
			},
			success: function () { $('#mkdirvalue').focus(); }
		});
	}

	function newfile()
	{
		var area = $(window).width() > 720 ? '420px' : '92%';
		var index = layer.open({
			type: 1,
			title: '新建文件',
			area: [area, 'auto'],
			shade: 0.1,
			content: '<div class="ep-dialog-body"><label>文件名</label><input id="newfilename" placeholder="例如 index.php" autocomplete="off"></div>',
			btn: ['创建', '取消'],
			yes: function () {
				var name = $.trim($('#newfilename').val());
				if (!name) { layer.msg('文件名不能为空'); return; }
				if (name.indexOf('/') !== -1) { layer.msg('文件名不能包含 /'); return; }
				var exists = false;
				$('input[name="files[]"]').each(function () {
					var path = $(this).val();
					var base = path.substring(path.lastIndexOf('/') + 1);
					if (base === name) { exists = true; return false; }
				});
				if (exists) { layer.msg('同名文件或目录已存在'); return; }
				var filename = (cwd === '/' ? '' : cwd) + '/' + name;
				$.ajax({
					url: '?c=webftp&a=editsave',
					type: 'POST',
					data: {filename: filename, content: '', charset: 'UTF-8', json: 1},
					dataType: 'json',
					success: function (result) {
						if (!result || result.code != 200) {
							layer.msg(result && result.msg ? result.msg : '新建失败', {icon: 2});
							return;
						}
						layer.close(index);
						refresh();
					},
					error: function () {
						layer.msg('请求失败，请检查网络或重新登录后重试', {icon: 2});
					}
				});
			},
			success: function () { $('#newfilename').focus(); }
		});
	}

function rename(file) {
    file = file.replace(/^\/+/, '/');
    var base = file.substring(file.lastIndexOf('/') + 1);
    var area = $(window).width() > 720 ? '420px' : '92%';
    var index = layer.open({
        type: 1,
        title: '重命名文件',
        area: [area, 'auto'],
        shade: 0.1,
        content: '<div class="ep-dialog-body"><label>新文件名</label><input id="renamefile" autocomplete="off"></div>',
        btn: ['确定', '取消'],
        yes: doRename,
        success: function () {
            $('#renamefile').val(base).focus().select().on('keydown', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    doRename();
                }
            });
        }
    });
    function doRename() {
        var name = $('#renamefile').val();
        if (!name) { layer.msg('新文件名不能为空'); return; }
        var newname = name.charAt(0) === '/' ? name : ((cwd === '/' ? '' : cwd) + '/' + name);
        webftp_request('rename', {oldname: file, newname: newname}, true);
        layer.close(index);
    }
}
	function upload()
	{
		uploadFiles.init_upload_path(cwd);
		uploadFiles.upload_layer();
	}
	/**
	 * 压缩文件
	 */

function compress() {
    var files = webftp_selected();
    if (!files.length) return;
    var area = $(window).width() > 720 ? '420px' : '92%';
    var index = layer.open({
        type: 1,
        title: '压缩文件',
        area: [area, 'auto'],
        shade: 0.1,
        content: '<div class="ep-dialog-body"><label>压缩文件名</label><input id="compressdst" autocomplete="off"><label>密码（可留空）</label><input id="compresspassword" autocomplete="off"></div>',
        btn: ['压缩', '取消'],
        yes: function () {
            var filename = $('#compressdst').val();
            if (!filename) { layer.msg('压缩文件名不能为空'); return; }
            webftp_request('compress', {dst: filename, files: files, password: $('#compresspassword').val()}, true);
            layer.close(index);
        },
        success: function () {
            $('#compressdst').val(files[files.length - 1] + '.zip').focus();
        }
    });
}

function decompress(file) {
    var area = $(window).width() > 720 ? '420px' : '92%';
    var index = layer.open({
        type: 1,
        title: '文件解压',
        area: [area, 'auto'],
        shade: 0.1,
        content: '<div class="ep-dialog-body"><label>解压目录</label><input id="decompressdst" autocomplete="off"><label>密码（可留空）</label><input id="decompresspassword" autocomplete="off"></div>',
        btn: ['解压', '取消'],
        yes: function () {
            var dst = $('#decompressdst').val();
            if (!dst) { layer.msg('解压目录不能为空'); return; }
            webftp_request('decompress', {files: [file], dst: dst, password: $('#decompresspassword').val()}, true);
            layer.close(index);
        },
        success: function () {
            $('#decompressdst').val(cwd || '/').focus();
        }
    });
}
	function file_access(file,is_dir,action)
	{
		var msg = '<form name="file_access_form">';
			msg += '<input type="hidden" name="file" id="accessfile" />';
			msg += '<input type="hidden" name="is_dir" id="is_dir" />';
			msg += '<p><input type="radio" name="act" id="clear" value="clear"/>清除</p>';
			msg += '<p><input type="radio" name="act" id="deny" value="deny"/>锁定</p>';
			msg += '<p><input type="radio" name="act" id="static" value="static"/>静态</p>';
			msg += '<p><input type="radio" name="act" id="authuser" value="auth"/>http认证';
			msg += '<input name="auth_user" id="auth_user" onclick="file_access_form.act[3].checked=true">(允许用户,正则)</p>';
			msg += '<p><input type="radio" name="act" id="ip" value="ip">允许ip段';
			msg += '<input name="ip" id="ip_value" onclick="file_access_form.act[4].checked=true">(cidr格式,多个由,分开)</p>';
			msg += '</form>';
		var area = $(window).width() > 720 ? '480px' : '92%';
		var index = layer.open({
			type: 1,
			title: '设置文件或目录属性',
			area: [area, 'auto'],
			shade: 0.1,
			content: '<div class="ep-dialog-body">' + msg + '</div>',
			btn: ['设置', '取消'],
			yes: function () {
				webftp_fileaccess($('form[name=file_access_form]')[0]);
				layer.close(index);
			},
			success: function () {
				$('#accessfile').val(file);
				$('#is_dir').val(is_dir);
				$('#auth_user').val("");
				if (action=='') {
					$('#clear').prop("checked", true);
				} else if (action=='deny'){
					$('#deny').prop("checked", true);
				} else if (action=='static') {
					$('#static').prop("checked", true);
				} else 	if (action.substr(0,5)=='auth:') {
					$('#authuser').prop("checked", true);
					$('#auth_user').val(action.substr(5));
				} else 	if (action.substr(0,3)=='ip:') {
					$('#ip').prop("checked", true);
					$('#ip_value').val(action.substr(3));
				}
			}
		});
	}
	/**
	 * mysql导入
	 * @param file
	 */
	function mysqldumpin(file)
	{
		var area = $(window).width() > 720 ? '440px' : '92%';
		var index = layer.open({
			type: 1,
			title: '导入数据库',
			area: [area, 'auto'],
			shade: 0.1,
			content: '<div class="ep-dialog-body"><form name="mysqldumpin" action="?c=shell&a=mysqldumpin" method="post" data-shell-command="1"><label>数据库密码</label><input name="passwd" id="mysqldumpinpasswd" type="password" autocomplete="off"><input name="file" id="mysqldumpinfile" type="hidden"></form></div>',
			btn: ['导入', '取消'],
			yes: function () {
				if (!$('#mysqldumpinpasswd').val()) { layer.msg('数据库密码不能为空'); return; }
				$('form[name=mysqldumpin]').submit();
				layer.close(index);
			},
			success: function () {
				$('#mysqldumpinfile').val(file);
				$('#mysqldumpinpasswd').focus();
			}
		});
	}
	//网站恢复
	function restoreweb(file)
	{
		var area = $(window).width() > 720 ? '440px' : '92%';
		var index = layer.open({
			type: 1,
			title: '恢复网站文件',
			area: [area, 'auto'],
			shade: 0.1,
			content: '<div class="ep-dialog-body"><form name="restoreweb" action="?c=shell&a=restoreweb" method="post" data-shell-command="1"><p class="ep-dialog-tip">这将导致您现在的数据丢失</p><label>解压密码（如无则空）</label><input type="text" name="password" autocomplete="off"><label class="ep-inline-check"><input name="coverfile" type="checkbox" value="1"> 覆盖文件</label><input name="file" id="restorewebfile" type="hidden"></form></div>',
			btn: ['恢复', '取消'],
			yes: function () {
				$('form[name=restoreweb]').submit();
				layer.close(index);
			},
			success: function () {
				$('#restorewebfile').val(file);
			}
		});
	}

function rmfile(file) {
    layer.confirm('确定要删除该文件或目录吗？', {icon: 3, title: '确认删除'}, function (index) {
        layer.close(index); webftp_request('rm', {files: [file]}, true);
    });
}

	function getfile(file, dir) {
		window.location = '?c=webftp&a=getfile&dir=' + dir + '&file='
				+ UrlEncode(file);
	}

function reversSelectAll() {
		var aa = $('input[name="files[]"]');
		for ( var i = 0; i < aa.length; i++) {
			aa[i].checked = !aa[i].checked;
		}
	}

function readonly(ro) {
    var files = webftp_selected();
    if (files.length) webftp_request('readonly', {ro: ro, files: files}, true);
}

function rmall() {
    var files = webftp_selected();
    if (!files.length) return;
    layer.confirm('确定要删除选中的文件或目录吗？', {icon: 3, title: '确认删除'}, function (index) {
        layer.close(index); webftp_request('rm', {files: files}, true);
    });
}
	function get_file_selected() {
		var files = [];
		var aa = $('input[name="files[]"]');
		for ( var i = 0; i < aa.length; i++) {
			if (aa[i].checked) {
				files.push(aa[i].value);
			}
		}
		return files;
	}

function cutall() {
    var files = webftp_selected();
    if (files.length) webftp_request('cut', {files: files}, false);
}

function copyall() {
    var files = webftp_selected();
    if (files.length) webftp_request('copy', {files: files}, false);
}

function parseall() { webftp_request('parse', {}, true); }

function refresh() {
	window.location = '?c=webftp&a=index';
}

function webftp_fileaccess(form) {
    webftp_request('fileaccess', $(form).serialize(), true);
    return false;
}
