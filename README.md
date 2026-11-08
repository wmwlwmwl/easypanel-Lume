# Easypanel Lume

Easypanel（Kangle 面板）虚拟主机控制面板模板，浅色现代卡片风格，电脑端与手机端自适应。

> 本模板基于 [wmwlwmwl/easypanel](https://github.com/wmwlwmwl/easypanel) 的 `vhost/view/default` 改造而来。
> 上游仓库的 `vhost/view/default` 如果发生改动，本模板需要同步更新，否则可能出现新增功能页缺失、旧逻辑不一致等问题。

## 特性

- 登录页、首页仪表盘、顶部导航、公共头尾统一为浅色卡片 + 蓝色渐变风格
- 电脑和手机使用同一套模板，通过媒体查询适配 1080px / 720px
- 不依赖图片素材，开关、文件图标、编辑器工具条等全部使用内联 SVG
- 已重绘核心页面：登录、登录失败、修改密码、域名绑定、首页仪表盘、计划任务
- 域名绑定支持一级/二级目录选择，下拉为面板自绘；目录候选由模板抓取在线文件列表生成，不依赖后端新增接口
- 其余功能页沿用原模板结构，通过兼容样式统一外观
- 保留原有功能逻辑和接口，不修改后端

## 安装

1. 将本目录复制到服务器 `/vhs/kangle/nodewww/webftp/vhost/view/<模板名>`，例如 `/vhs/kangle/nodewww/webftp/vhost/view/ws`
2. 目录内必须包含完整 HTML 模板文件（框架在模板异常时会回退到 `/vhs/kangle/nodewww/webftp/vhost/view/default`）
3. 设置属主与权限：

```bash
chown -R www:www /vhs/kangle/nodewww/webftp/vhost/view/<模板名>
find /vhs/kangle/nodewww/webftp/vhost/view/<模板名> -type d -exec chmod 755 {} \;
find /vhs/kangle/nodewww/webftp/vhost/view/<模板名> -type f -exec chmod 644 {} \;
```

4. 在后台“模板目录”中选择该模板，或更新数据库 `setting` 表中的 `view_dir`
5. 清理模板编译缓存：

```bash
rm -rf /vhs/kangle/nodewww/webftp/framework/templates_c/<模板名>
```

## 手机端说明

本模板按“手机和电脑使用同一套模板”设计。若使用旧版框架，手机访问可能被强制切换到 `/vhs/kangle/nodewww/webftp/vhost/view/ws`，需要确认框架选择逻辑，或在服务器上创建 `/vhs/kangle/nodewww/webftp/vhost/view/ws` 目录。

## 上游基线

本模板以以下上游状态为基线改造，后续用于判断上游 `vhost/view/default` 是否发生变更：

| 项目 | 记录 |
| --- | --- |
| 上游仓库 | https://github.com/wmwlwmwl/easypanel |
| 基准路径 | `vhost/view/default` |
| 同步基线（上次同步时的上游 HEAD） | `3d931a1805426762a829dc86499525a2e5b783fb` |
| 同步基线时间 | 2026-11-08 18:21:46 +08:00 |
| 模板内容版本（路径最后变更） | `3d931a1805426762a829dc86499525a2e5b783fb` |
| 路径最后变更时间 | 2026-11-08 18:21:46 +08:00 |
| 路径最后变更说明 | 修复部分安全性bug |
| 记录日期 | 2026-11-08 |

说明：

- 同步基线是上次同步上游模板时的仓库快照。用它作为 diff 起点，能准确得到“上次同步之后该路径发生的变化”。
- 模板内容版本是 `vhost/view/default` 最后一次变更的提交，用于说明模板内容对应哪个路径版本。
- 本次两项相同：上游最新的路径变更（缓存清理页健壮性修复）已同步进本模板，下次同步从这里继续对比即可。
- 不要用一个更早的提交作为同步 diff 起点：如果它与上次同步点之间还有提交改过该路径，这些改动可能已经包含在当前模板里，会造成重复同步。

上游更新后，按同步基线对比该路径的变化：

```bash
git fetch origin
git diff 3d931a1805426762a829dc86499525a2e5b783fb..origin/HEAD -- vhost/view/default
```

对比结果中新增或修改的功能页，需要同步进本模板；本模板已重写的核心文件仍需保留。

## 与上游模板的关系

本仓库只包含虚拟主机面板模板，不是完整的 Easypanel 程序。

上游 `vhost/view/default` 更新时，建议按以下方式同步：

1. 对比上游 `vhost/view/default` 与本地模板的文件差异
2. 将新增或修改的功能页同步进本模板
3. 保留本模板已重写的核心文件：登录页、首页、导航、公共头尾、全局样式、域名绑定、计划任务和已适配的在线文件页面

核心文件位于：

- `login.html`、`loginerror.html`、`changePassword.html`
- `kfinfo.html`、`top.html`、`noframe.html`
- `common/head.html`、`common/foot.html`
- `style/style.css`、`style/login.css`
- `webftp/ls.html`、`webftp/editor.html`、`webftp/style.css`、`webftp/utils.js`
- `domain/show.html`、`js/domain.js`（域名绑定的自绘目录下拉）
- `cron/index.html`（计划任务页）

## 兼容性

- PHP 与 Smarty 3（分隔符 `{{ }}`）
- 面向 `vhost` 面板；`admin` 面板始终使用自己的 `admin/view/default`
- 所有功能页均保留原控制器的参数和链接，不改变后端行为

## 许可证

本模板基于上游项目改造，相关授权请遵循上游仓库的许可说明。
