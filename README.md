# 十四行记

> 自驾 · 行旅 · 记录

两个人，各十四画，一起走过的路。

---

## 关于这里

这是一本轻量级的数字旅行日记。每一次自驾出行，都化作一个独立的 HTML 文件 — 不依赖框架，不需要构建工具，打开即是那段路途的全部。

纯静态，可离线浏览，亦通过 GitHub Pages 在线呈现：
https://sortinn.github.io/14-travel/

---

## 目录结构

```
.
├── index.html                  # 首页，旅行总览与入口
├── trips/                      # 行程页（一个文件 = 一段旅途）
│   ├── 2026-05-xiy-bjs.html
│   └── 2026-09-suzhou.html
├── assets/                     # 旅行地图与图片
│   └── suzhou/
├── guides/                     # 出发前的路线、车辆与装备参考
│   └── 2026-family-car-shortlist.html
├── demos/                      # 视觉/技术预览
│   └── travel-status-demo.html
├── docs/                       # 文档
│   └── 更新日志.md
├── tests/                      # 静态页面与链接完整性检查
│   └── site-integrity.mjs
└── README.md                   # 项目说明
```

---

## 旅行记录

| 行程                                           | 时间           | 里程        |
| ---------------------------------------------- | -------------- | ----------- |
| [周末两日 · BJS → TSN](./trips/2026-05-bjs-tsn.html) | 2026.5.16 – 5.17 | 约 260 km |
| [五一自驾 · XIY → BJS](./trips/2026-05-xiy-bjs.html) | 2026.5.1 – 5.7 | 约 1,380 km |

---

## 城市漫游

- [在苏州，顺便走走](./trips/2026-09-suzhou.html)：同系列旅行手账，一周建议安排、大字手绘地图、夜游网师园、市区位置和 10 段高德路程。
- [路程数值与资料来源](./docs/2026-09-suzhou-notes.md)
- Pages 分享地址：https://sortinn.github.io/14-travel/trips/2026-09-suzhou.html

---

## 出发之前

行程之外，也记录和长途自驾直接相关的准备材料。

- [家庭长途用车候选清单](./guides/2026-family-car-shortlist.html)
- Pages 分享地址：https://sortinn.github.io/14-travel/guides/2026-family-car-shortlist.html

---

## 命名规则

行程文件遵循固定命名约定：

```
{年份}-{月份}-{出发城三字码}-{目的城三字码}.html
```

例：`2026-05-xiy-bjs.html` — 2026年5月，西安出发，北京抵达。

单城漫游使用 `{年份}-{月份}-{城市}.html`，如 `2026-09-suzhou.html`。

---

## 本地预览

双击任意 `.html` 文件即可在浏览器中打开，无需安装任何依赖。

运行静态完整性检查：

```bash
node tests/site-integrity.mjs
```

---

## 更新日志

详见 [更新日志.md](./docs/更新日志.md)

---

*sortinn · enseymiss*
