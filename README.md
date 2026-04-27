# njmetro-railmap-creator

南京地铁屏蔽门上方贴纸生成器的原型项目。当前仓库主要用于编辑线路、站点与方向参数，并在页面中预览生成的 SVG 结果。

## 项目入口

- Cloudflare Pages：https://njmetro-railmap-creator.umamichi.moe
- GitHub 仓库：https://github.com/unnamed2964/njmetro-railmap-creator
- 个人网站：https://umamichi.moe/
- 仓库文档：参见 [docs/](docs/)

## 项目内容

- 基于 Vite + React + TypeScript 构建
- 页面内可编辑生成参数、站点列表与当前站
- 支持预览 CurrentStationBadge、DirectionBadge、RouteBadge 三类输出
- docs/ 目录用于存放现有资料、方向说明、路线图与参考 SVG

## 示例

### 终点站示例

![Terminus example](docs/svgs/terminus.svg)

### 方向贴纸示例

![Direction badge example](docs/svgs/to%20xxx,%20next%20station%20xxx.svg)

### 路线图示例

![Route map example](docs/svgs/route2.svg)

## TODO

- 暂无

## 字体策略

- 页面和 SVG 文本统一使用无衬线字体栈，中文优先尝试微软雅黑、苹方、冬青黑体、Noto Sans CJK、思源黑体等，最后回退到系统 sans-serif。
- 不直接内嵌微软雅黑、方正黑体、Helvetica 字体文件；是否可用取决于用户设备是否已安装。
- 如需跨平台保持更高一致性，应优先选用允许网页分发的开源字体，例如 Noto Sans CJK 或思源黑体；若需要绝对一致的导出效果，建议将关键文字转为路径。