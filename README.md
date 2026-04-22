# njmetro-railmap-creator

南京地铁屏蔽门上方贴纸生成器的原型项目。当前仓库主要用于编辑线路、站点与方向参数，并在页面中预览生成的 SVG 结果。

## 项目入口

- Cloudflare Pages：在这里填写线上地址
- 仓库文档：参见 [docs/](docs/)

## 项目内容

- 基于 Vite + React + TypeScript 构建
- 页面内可编辑生成参数、站点列表与当前站
- 支持预览 CurrentStationBadge、DirectionBadge、RouteBadge 三类输出
- docs/ 目录用于存放现有资料、方向说明、路线图与参考 SVG

## TODO

- [ ] 实现南京地铁线路号方块生成，替换本项目中的线路号方块
- [ ] 实现线路图中的箭头，以及含箭头时的排版
- [ ] 实现线路图中站名汉字 >= 7 字时的横向压缩
- [ ] 实现终点站情况下的 DirectionBadge
- [ ] 实现换乘双箭头循环标识
- [ ] 实现当前站矩形的正确上下放置