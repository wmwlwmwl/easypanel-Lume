var aceEditor = {
  layer_view: '',
  aceConfig: {"supportedModes":{"Apache_Conf":["^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd"],"BatchFile":["bat|cmd"],"C_Cpp":["cpp|c|cc|cxx|h|hh|hpp|ino"],"CSharp":["cs"],"CSS":["css"],"Dockerfile":["^Dockerfile"],"golang":["go"],"HTML":["html|htm|xhtml|vue|we|wpy"],"Java":["java"],"JavaScript":["js|jsm|jsx"],"JSON":["json"],"JSP":["jsp"],"LESS":["less"],"Lua":["lua"],"Makefile":["^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make"],"Markdown":["md|markdown"],"MySQL":["mysql"],"Nginx":["nginx|conf"],"INI":["ini|conf|cfg|prefs"],"ObjectiveC":["m|mm"],"Perl":["pl|pm"],"Perl6":["p6|pl6|pm6"],"pgSQL":["pgsql"],"PHP_Laravel_blade":["blade.php"],"PHP":["php|inc|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module"],"Powershell":["ps1"],"Python":["py"],"R":["r"],"Ruby":["rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile"],"Rust":["rs"],"SASS":["sass"],"SCSS":["scss"],"SH":["sh|bash|^.bashrc"],"SQL":["sql"],"SQLServer":["sqlserver"],"Swift":["swift"],"Text":["txt"],"Typescript":["ts|typescript|str"],"VBScript":["vbs|vb"],"Verilog":["v|vh|sv|svh"],"XML":["xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml"],"YAML":["yaml|yml"],"Compress":["tar|zip|7z|rar|gz|arj|z"],"images":["icon|jpg|jpeg|png|bmp|gif|tif|emf"]},"encodingList":["UTF-8","GBK","GB2312","BIG5"],"themeList":["chrome","monokai"],"aceEditor":{"editorTheme":"monokai","fontSize":14,"softLabel":false,"useSoftTabs":true,"tabSize":4,"wrap":true,"enableSnippets":true,"enableLiveAutocompletion":true,"highlightActiveLine":true,"highlightSelectedWord":true,"animatedScroll":false,"showInvisibles":true,"showFoldWidgets":true,"showLineNumbers":true,"showGutter":true,"displayIndentGuides":false}},  //ace配置参数
  editor: null,
  ace: null,
  editorStatus: 0,  //编辑器状态 默认还原 0还原 1最大化 -1最小化
  // 事件编辑器-方法，事件绑定
  eventEditor: function () {
    var _this = this, _icon = '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>';
    $(document).off('click.aceEditor').on('click.aceEditor', function (e) {
      $('.ace_toolbar_menu').hide();
      $('.ace_conter_editor .ace_editors').css('fontSize', _this.aceConfig.aceEditor.fontSize + 'px');
      $('.ace_toolbar_menu .menu-tabs,.ace_toolbar_menu .menu-encoding').hide();
    });
    $('.ace_editor_main').off('click.aceEditor').on('click.aceEditor', function () {
      $('.ace_toolbar_menu').hide();
    });
    $('.ace_toolbar_menu').off('click.aceEditor').on('click.aceEditor', function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
    // 显示工具条
    $('.ace_header .pull-down').off('click.aceEditor').on('click.aceEditor', function () {
      if ($(this).find('i').hasClass('glyphicon-menu-down')) {
        $('.ace_header').css({ 'top': '-30px' });
        $('.ace_overall').css({ 'top': '0' });
        $(this).css({ 'top': '30px', 'height': '30px', 'line-height': '30px' });
        $(this).find('i').addClass('glyphicon-menu-up').removeClass('glyphicon-menu-down');
      } else {
        $('.ace_header').css({ 'top': '0' });
        $('.ace_overall').css({ 'top': '30px' });
        $(this).removeAttr('style');
        $(this).find('i').addClass('glyphicon-menu-down').removeClass('glyphicon-menu-up');
      }
      _this.setEditorView();
    });
    $(window).off('keyup.aceEditor').on('keyup.aceEditor', function (e) {
      if (e.keyCode === 116 && $('#ace_conter').length == 1) {
        layer.msg('编辑器模式下无法刷新网页，请关闭后重试');
      }
    });
    // 底部状态栏功能按钮
    $('.ace_conter_toolbar .pull-right span').off('click.aceEditor').on('click.aceEditor', function (e) {
      var _type = $(this).attr('data-type'),
        _item = _this.editor;
      $('.ace_toolbar_menu').show();
      switch (_type) {
        case 'cursor':
          $('.ace_toolbar_menu').hide();
          $('.ace_header .jumpLine').click();
          break;
        case 'tab':
          $('.ace_toolbar_menu .menu-tabs').show().siblings().hide();
          $('.tabsType').find(_item.softTabs ? '[data-value="nbsp"]' : '[data-value="tabs"]').addClass('active').append(_icon);
          $('.tabsSize [data-value="' + _item.tabSize + '"]').addClass('active').append(_icon);
          break;
        case 'encoding':
          _this.getEncodingList(_item.encoding);
          $('.ace_toolbar_menu .menu-encoding').show().siblings().hide();
          break;
        case 'readOnly':
          $('.ace_toolbar_menu').hide();
          layer.msg('当前文件过大，只可阅读，不可修改', { icon: 6 });
          break;
      }
      e.stopPropagation();
      e.preventDefault();
    });
    // 设置换行符
    $('.menu-tabs').off('click.aceEditor').on('click.aceEditor', 'li', function (e) {
      var _val = $(this).attr('data-value'), _item = _this.editor;
      if ($(this).parent().hasClass('tabsType')) {
        _item.ace.getSession().setUseSoftTabs(_val == 'nbsp');
        _item.softTabs = _val == 'nbsp';
      } else {
        _item.ace.getSession().setTabSize(_val);
        _item.tabSize = _val;
      }
      $(this).siblings().removeClass('active').find('.icon').remove();
      $(this).addClass('active').append(_icon);
      _this.currentStatusBar();
      e.stopPropagation();
      e.preventDefault();
    });
    // 设置编码内容
    $('.menu-encoding').off('click.aceEditor').on('click.aceEditor', 'li', function (e) {
      var _item = _this.editor;
      layer.msg('设置文件编码：' + $(this).attr('data-value'));
      $('.ace_conter_toolbar [data-type="encoding"]').html('编码：<i>' + $(this).attr('data-value') + '</i>');
      $(this).addClass('active').append(_icon).siblings().removeClass('active').find('span').remove();
      _item.encoding = $(this).attr('data-value');
      _this.saveFileMethod(_item);
    });
    // 顶部状态栏
    $('.ace_header>span').off('click.aceEditor').on('click.aceEditor', function (e) {
      var type = $(this).attr('class'), _item = _this.editor;
      if (!_this.editor) {
        return false;
      }
      switch (type) {
        case 'saveFile': //保存当时文件
          _this.saveFileMethod(_item);
          break;
        case 'refreshs': //刷新文件
          if (_item.fileType === 0) {
            aceEditor.getFileBody({ path: _item.path }, function (res) {
              _item.ace.setValue(decodeURIComponent(res.content));
              _item.fileType = 0;
              layer.msg('刷新成功', { icon: 1 });
            });
            return false;
          }
          layer.confirm('刷新当前文件会覆盖当前修改,是否继续！', { icon: 0, title: '提示', btn: ['确定', '取消']}, function (index) {
            aceEditor.getFileBody({ path: _item.path }, function (res) {
              layer.close(index);
              _item.ace.setValue(decodeURIComponent(res.content));
              layer.msg('刷新成功', { icon: 1 });
            });
          }, function (index) {
            layer.close(index);
          });
          break;
        // 搜索
        case 'searchs':
          _item.ace.execCommand('find');
          break;
        // 替换
        case 'replaces':
          _item.ace.execCommand('replace');
          break;
        // 跳转行
        case 'jumpLine':
          $('.ace_toolbar_menu').show().find('.menu-jumpLine').show().siblings().hide();
          $('.set_jump_line input').val('').focus();
          var _cursor = aceEditor.editor.ace.selection.getCursor();
          $('.set_jump_line .jump_tips span:eq(0)').text(_cursor.row);
          $('.set_jump_line .jump_tips span:eq(1)').text(_cursor.column);
          $('.set_jump_line .jump_tips span:eq(2)').text(aceEditor.editor.ace.session.getLength());
          $('.set_jump_line input').unbind('keyup').on('keyup', function (e) {
            var _val = $(this).val();
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
              if (_val != '' && typeof parseInt(_val) == 'number') {
                _item.ace.gotoLine(_val);
              };
            }
          });
          break;
        // 字体
        case 'fontSize':
          $('.ace_toolbar_menu').show().find('.menu-fontSize').show().siblings().hide();
          $('.menu-fontSize .set_font_size input').val(_this.aceConfig.aceEditor.fontSize).focus();
          $('.menu-fontSize .menu-conter .set_font_size input').unbind('change').change(function () {
            var _val = $(this).val();
            $('.ace_conter_editor .ace_editors').css('fontSize', _val + 'px');
          });
          $('.set_font_size .btn-save').unbind('click').click(function () {
            var _fontSize = $('.set_font_size input').val();
            _this.aceConfig.aceEditor.fontSize = parseInt(_fontSize);
            _this.saveAceConfig(_this.aceConfig, function () {
              $('.ace_editors').css('fontSize', _fontSize + 'px');
              layer.msg('设置成功', { icon: 1 });
            });
          });
          break;
        //主题
        case 'themes':
          $('.ace_toolbar_menu').show().find('.menu-themes').show().siblings().hide();
          var _html = '', _arry = ['白色主题', '黑色主题'];
          for (var i = 0; i < _this.aceConfig.themeList.length; i++) {
            if (_this.aceConfig.themeList[i] != _this.aceConfig.aceEditor.editorTheme) {
              _html += '<li data-value="' + _this.aceConfig.themeList[i] + '">' + _this.aceConfig.themeList[i] + '【' + _arry[i] + '】</li>';
            } else {
              _html += '<li data-value="' + _this.aceConfig.themeList[i] + '" class="active">' + _this.aceConfig.themeList[i] + '【' + _arry[i] + '】' + _icon + '</li>';
            }
          }
          $('.menu-themes ul').html(_html);
          $('.menu-themes ul li').off('click.aceEditor').on('click.aceEditor', function () {
            var _theme = $(this).attr('data-value');
            $(this).addClass('active').append(_icon).siblings().removeClass('active').find('.icon').remove();
            _this.aceConfig.aceEditor.editorTheme = _theme;
            _this.saveAceConfig(_this.aceConfig, function () {
              _this.editor.ace.setTheme("ace/theme/" + _theme);
              layer.msg('设置成功', { icon: 1 });
            });
          });
          break;
        case 'setUp':
          $('.ace_toolbar_menu').show().find('.menu-setUp').show().siblings().hide();
          $('.menu-setUp .editor_menu li').each(function (index, el) {
            var _type = _this.aceConfig.aceEditor[$(el).attr('data-type')];
            if (_type) $(el).addClass('active').append(_icon);
          })
          $('.menu-setUp .editor_menu li').unbind('click').click(function () {
            var _type = $(this).attr('data-type');
            _this.aceConfig.aceEditor[_type] = !$(this).hasClass('active');
            if ($(this).hasClass('active')) {
              $(this).removeClass('active').find('.icon').remove();
            } else {
              $(this).addClass('active').append(_icon);
            }
            _this.saveAceConfig(_this.aceConfig, function () {
              _this.editor.ace.setOption(_type, _this.aceConfig.aceEditor[_type]);
              layer.msg('设置成功', { icon: 1 });
            });
          });
          break;
      }

      e.stopPropagation();
      e.preventDefault();
    });

    this.setEditorView();
  },
  // 	设置本地存储，设置类型type：session或local
  setStorage: function (type, key, val) {
    if (type != "local" && type != "session") val = key, key = type, type = 'session';
    window[type + 'Storage'].setItem(key, val);
  },
  //获取指定本地存储，设置类型type：session或local
  getStorage: function (type, key) {
    if (type != "local" && type != "session") key = type, type = 'session';
    return window[type + 'Storage'].getItem(key);
  },
  // 设置编辑器视图
  setEditorView: function () {
    var _this = this, aceEditorHeight = $('.aceEditors').height(), attempts = 0;
    var adaptHeight = function () {
      var page_height = $('.aceEditors').height();
      var ace_conter_toolbar = $('.ace_conter_toolbar').height();
      var _height = page_height - ($('.pull-down .glyphicon').hasClass('glyphicon-menu-down') ? 35 : 0) - ace_conter_toolbar - 42;
      $('.ace_conter_editor').height(_height);
      if (aceEditorHeight == $('.aceEditors').height() || attempts++ >= 20) {
        if (_this.editor) _this.editor.ace.resize();
        return;
      }
      aceEditorHeight = $('.aceEditors').height();
      setTimeout(adaptHeight, 200);
    };
    setTimeout(adaptHeight, 200);
  },
  // 获取文件编码列表
  getEncodingList: function (type) {
    var _option = '';
    for (var i = 0; i < this.aceConfig.encodingList.length; i++) {
      var item = this.aceConfig.encodingList[i] == type.toUpperCase();
      _option += '<li data- data-value="' + this.aceConfig.encodingList[i] + '" ' + (item ? 'class="active"' : '') + '>' + this.aceConfig.encodingList[i] + (item ? '<span class="icon"><i class="glyphicon glyphicon-ok" aria-hidden="true"></i></span>' : '') + '</li>';
    }
    $('.menu-encoding ul').html(_option);
  },
  // 更新状态栏
  currentStatusBar: function () {
    var _item = this.editor;
    if (!_item) return false;
    $('.ace_conter_toolbar [data-type="cursor"]').html('行<i class="cursor-row">1</i>,列<i class="cursor-line">0</i>');
    $('.ace_conter_toolbar [data-type="path"]').text('文件位置：' + _item.path).attr('title', _item.path);
    $('.ace_conter_toolbar [data-type="tab"]').html(_item.softTabs ? '空格：<i>' + _item.tabSize + '</i>' : '制表符长度：<i>' + _item.tabSize + '</i>');
    $('.ace_conter_toolbar [data-type="encoding"]').html('编码：<i>' + _item.encoding.toUpperCase() + '</i>');
    var readOnly = $('.ace_conter_toolbar [data-type="readOnly"]')
    if(_item.readOnly){
      readOnly.show().text('只读模式').css('background','#ff9200')
    }else{
      readOnly.hide()
    }
    $('.file_fold').removeClass('bg');
    $('[data-menu-path]').filter(function () { return $(this).attr('data-menu-path') === _item.path; }).find('.file_fold').addClass('bg');
    _item.ace.resize();
  },
  // 创建ACE编辑器-对象
  creationEditor: function (obj) {
    var _this = this;
    this.editor = {
      ace: ace.edit("ace_editor", {
        theme: "ace/theme/" + _this.aceConfig.aceEditor.editorTheme, //主题
        mode: "ace/mode/" + (obj.fileName != undefined ? obj.mode : 'text'), // 语言类型
        showInvisibles: _this.aceConfig.aceEditor.showInvisibles,
        showPrintMargin: false,
        enableBasicAutocompletion: true,
        enableSnippets: _this.aceConfig.aceEditor.enableSnippets,
        enableLiveAutocompletion: _this.aceConfig.aceEditor.enableLiveAutocompletion,
        useSoftTabs: _this.aceConfig.aceEditor.useSoftTabs,
        tabSize: _this.aceConfig.aceEditor.tabSize,
        keyboardHandler: 'sublime',
        readOnly: obj.readOnly === undefined ? false : obj.readOnly
      }), //ACE编辑器对象
      path: obj.path,
      tabSize: _this.aceConfig.aceEditor.tabSize,
      softTabs: _this.aceConfig.aceEditor.useSoftTabs,
      fileName: obj.fileName,
      encoding: (obj.encoding !== undefined ? obj.encoding : 'utf-8'), //编码类型
      type: obj.type,
      fileType: 0, //文件状态
      readOnly: obj.readOnly === undefined ? false : obj.readOnly,
      st_mtime: obj.st_mtime
    };
    var ACE = this.editor;
    ACE.ace.setValue(obj.data || '', -1);
    ACE.ace.resize(); //设置自适应
    if(!ACE.readOnly) ACE.ace.focus()
    ACE.ace.on('focus', function () {
      var active = aceEditor.editor
      if(active.readOnly) layer.msg('当前文件只读，暂不支持修改',{icon:0})
    })
    ACE.ace.commands.addCommand({
      name: '保存文件',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S'
      },
      exec: function (editor) {
        _this.saveFileMethod(ACE);
      },
      readOnly: false // 如果不需要使用只读模式，这里设置false
    });
    ACE.ace.commands.addCommand({
      name: '跳转行',
      bindKey: {
        win: 'Ctrl-I',
        mac: 'Command-I'
      },
      exec: function (editor) {
        $('.ace_header .jumpLine').click();
      },
      readOnly: false // 如果不需要使用只读模式，这里设置false
    })
    // 获取光标位置
    ACE.ace.getSession().selection.on('changeCursor', function (e) {
      var _cursor = ACE.ace.selection.getCursor();
      $('[data-type="cursor"]').html('行<i class="cursor-row">' + (_cursor.row + 1) + '</i>,列<i class="cursor-line">' + _cursor.column + '</i>');
    });

    // 触发修改内容
    ACE.ace.getSession().on('change', function (editor) {
      ACE.fileType = 1;
      $('.ace_toolbar_menu').hide();
    });
    this.currentStatusBar();
  },
  // 保存文件方法
  saveFileMethod: function (ACE,force,callabck) {
		if(!force) force = 0
    var _this = this;
    if (ACE.fileType == 0) {
      layer.msg('当前文件未修改，无需保存!');
      return false;
    }
    layer.msg('保存文件中，请稍候...', {icon: 16,time: 0});
    _this.saveFileBody({
			ACE:ACE,
      path: ACE.path,
      data: ACE.ace.getValue(),
      encoding: ACE.encoding,
      st_mtime: ACE.st_mtime,
			force:force
    }, function (res) {
      ACE.fileType = 0;
      if (res && res.st_mtime !== undefined) {
        ACE.st_mtime = res.st_mtime;
        _this.currentStatusBar();
      } else {
        _this.getFileBody({ path: ACE.path }, function (file) {
          ACE.st_mtime = file.st_mtime;
          _this.currentStatusBar();
        });
      }
      if(callabck) callabck(res)
    }, function (res) {
      ACE.fileType = 1;
      if(callabck) callabck(res)
    });
  },
  // 获取文件模型
  getFileType: function (fileName) {
    var filenames = fileName.match(/\.([0-9A-z]*)$/);
    filenames = (filenames == null ? 'text' : filenames[1]);
    for (var name in this.aceConfig.supportedModes) {
      var data = this.aceConfig.supportedModes[name], suffixs = data[0].split('|'), filename = name.toLowerCase();
      for (var i = 0; i < suffixs.length; i++) {
        if (filenames == suffixs[i]) {
          return { name: name, mode: filename };
        }
      }
    }
    return { name: 'Text', mode: 'text' };
  },
  // 打开编辑器文件-方法
  openEditorView: function (path, callback) {
    //最小化后，再点文件编辑，还原编辑器窗口
    if(aceEditor.editorStatus === -1) $('.layui-layer-maxmin').click()
    if (path === undefined) return false;
    // 文件类型（type，列如：JavaScript） 、文件模型（mode，列如：text）、文件标识（id,列如：x8AmsnYn）、文件编号（index,列如：0）、文件路径 (path，列如：/www/root/)
    var _this = this, paths = path.split('/'), _fileName = paths[paths.length - 1], _fileType = this.getFileType(_fileName), _type = _fileType.name, _mode = _fileType.mode;
    _this.getFileBody({ path: path }, function (res) {
      $('#ace_editor').remove();
      $('.ace_conter_editor').append('<div id="ace_editor" class="ace_editors active" style="font-size:' + aceEditor.aceConfig.aceEditor.fontSize + 'px"></div>');
      $('[data-menu-path]').filter(function () { return $(this).attr('data-menu-path') === path; }).find('.file_fold').addClass('active bg');
      _this.creationEditor({ fileName: _fileName, path: path, mode: _mode, encoding: res.charset, data: decodeURIComponent(res.content), type: _type, size: res.size, st_mtime: res.st_mtime });
      if (callback) callback(res, _this.editor);
    });
    $('.ace_toolbar_menu').hide();
  },
  // 获取文件内容-请求
  getFileBody: function (obj, callback) {
    var loadT = layer.msg('正在获取文件内容，请稍候...', { time: 0, icon: 16, shade: [0.3, '#000'] }), _this = this;
    $.post("?c=webftp&a=editfrom", {file: obj.path}, function (res) {
      layer.close(loadT);
      if (res.code != 200) {
        layer.closeAll();
        layer.msg(res.msg, { icon: 2 });
        return false;
      }
      if (callback) callback(res);
    }, 'json').fail(function () {
      layer.close(loadT);
      layer.alert('读取文件失败，请检查网络或重新登录后重试', {icon: 2});
    });
  },
  // 保存文件内容-请求
  saveFileBody: function (obj, success, error) {
    var _that = this
    $.ajax({
      type: 'post',
      url: '?c=webftp&a=editsave',
      dataType: 'json',
      timeout: 30000,
      data: {
        content: obj.data,
        charset: obj.encoding,
        filename: obj.path,
        st_mtime: obj.st_mtime,
        force: obj.force,
        json: 1,
      },
      success: function (rdata) {
        if (rdata.code == 200) {
          if (success) success(rdata)
        } else {
          rdata.msg = editorSaveMessage(rdata.msg);
          if (error) error(rdata)
        }
        if (!obj.tips){
          if(rdata.code == 200){
            layer.msg(rdata.msg,{icon:1})
          }else {
            layer.msg(rdata.msg,{icon:2})
          }
        }
      },
      error: function (err) {
        layer.msg('保存文件失败，请检查网络后重试', {icon: 2});
        if (error) error(err)
      }
    });
  },
  // 	保存ace配置
  saveAceConfig: function (data, callback) {
    this.setStorage('aceConfig', JSON.stringify(data));
    if (callback) callback();
  }
}

// 无写权限时后端返回“不能打开文件:路径”，改为可读的只读提示
function editorSaveMessage(msg) {
  if (typeof msg === 'string' && msg.indexOf('不能打开文件') === 0) {
    return '该文件为只读，无法保存';
  }
  return msg;
}

function openEditorView (path, callback) {
  var paths = path.split('/'),
    _fileName = paths[paths.length - 1],
    _aceTmplate = document.getElementById("aceTmplate").innerHTML;
  if (aceEditor.editor !== null) {
    aceEditor.openEditorView(path);
    return false;
  }
  var area = ['80%', '80%'];
  if($(window).width() < $(window).height()) var area = ['95%', '60%'];
  else if($(window).width() > 1200) var area = ['60%', '80%'];
  else if($(window).width() > 992) var area = ['70%', '80%'];
  var r = layer.open({
    type: 1,
    maxmin: true,
    shade: false,
    anim:-1,
    area: area,
    title: "在线文本编辑器",
    skin: 'aceEditors',
    zIndex: 19999,
    content: _aceTmplate,
    success: function (layero, index) {
      function set_edit_file () {
        aceEditor.eventEditor();
        ace.require("ace/ext/language_tools");
        aceEditor.openEditorView(path, callback);
        $('#ace_conter').addClass(aceEditor.aceConfig.aceEditor.editorTheme);
        $('.aceEditors .layui-layer-min').click(function (e) {
          aceEditor.setEditorView();
        });
        $('.aceEditors .layui-layer-max').click(function (e) {
          aceEditor.setEditorView();
        });
      }
      var aceConfig = aceEditor.getStorage('aceConfig');
      if (aceConfig) {
        aceEditor.aceConfig = JSON.parse(aceConfig);
      }
      set_edit_file();
      if ($(window).width() <= 720) {
        layer.full(index);
        setTimeout(function () { aceEditor.setEditorView(); }, 120);
      }
    },
    cancel: function () {
      if (aceEditor.editor){
        var _item = aceEditor.editor
        if (_item.fileType == 1) {
          layer.confirm('检测到文件未保存，是否保存文件更改？', { title: '保存提示', icon: 0, btn: ['保存文件', '不保存文件']}, function (indexs) {
            aceEditor.saveFileMethod(_item, 0, function(result){
              if (result && result.code == 200) {
                aceEditor.editor = null;
                layer.closeAll();
              }
            });
          }, function (indexs) {
            aceEditor.editor = null;
            layer.closeAll();
          });
          return false;
        }
      }
    },
    full: function (layero, index) {
      //最大化
      aceEditor.editorStatus = 1
    },
    min: function (layero, index) {
      //最小化
      aceEditor.editorStatus = -1
    },
    restore: function (layero, index) {
      //还原
      aceEditor.editorStatus = 0
    },
    end: function () {
      aceEditor.editor = null;
    }
  });
}
