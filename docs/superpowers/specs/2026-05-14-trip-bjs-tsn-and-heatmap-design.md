# 2026-05-14 设计 · BJS→TSN 周末行程页 + 项目级热力图

## 概述

本次迭代在 `feature/add_new_travel_for_20260516` 分支上完成两件相关工作：

1. 新增 **2026-05-16 北京→天津周末自驾**行程页（行前规划态上线，行后补实录）
2. 新增 **项目级旅行热力图** 与 **趟次朱印徽章** 系统（贯穿首页 + 详情页）

两项工作通过共用一个 `trips` 数据源完成联调，统一在同一 PR 内交付。

---

## 范围

### 在范围内

- 新建 `trips/2026-05-bjs-tsn.html`，沿用上次 hero + day-card 模板，2 个 day-card
- 在 `index.html` 内引入 `trips` 数据数组（内联 JS）
- 引入 `tripBadge(n)` SVG 模板函数（朱印方章风格）
- 引入热力图 section：月度（年×12 月网格） / 年度（单行年格）切换
- hero-stats 由数据数组自动算（`trip-count` / `km-count`）；`city-count` 暂保留手填
- 卡片左上角 + 行程详情页 hero 区 + 热力图格子内统一显示朱印徽章
- `README.md` 行程表新增一行

### 不在范围内

- 卡片本身改为 JS 渲染（保持 HTML，靠 `id` 与数组对齐）
- 城市统计自动化（`city-count` 仍手填，需要 route 字段时再说）
- 多语言 / SEO / sitemap
- 后端 / 数据库 / 任何构建步骤
- 跨年趟次的复杂分摊（如有则归到开始月）

---

## 文件与分支

| 项 | 值 |
|---|---|
| 分支 | `feature/add_new_travel_for_20260516` |
| 行程文件 | `trips/2026-05-bjs-tsn.html` |
| 模板来源 | 复制 `trips/2026-05-xiy-bjs.html` 后裁剪到 2 个 day-card |
| 行程日期 | 2026.5.16 (周六) – 5.17 (周日) |
| 出行方式 | 自驾，约 130 km × 2 |
| 状态生命周期 | `planning` → 行后改 `completed`，无需改结构 |

---

## 行程页结构（BJS→TSN）

### 骨架

```
HERO
  ├─ hero-badge: "2026 周末 · 京津"
  ├─ h1: 北京 → 天津 · 周末两日
  ├─ hero-sub: 自驾 · 约 260 km · 5.16-5.17
  ├─ trip-status [planning]
  ├─ tripBadge(#2)  ← hero 右上角朱印
  └─ hero-stats: 2 天 / ~260 km / 1 城

§ 路书概览
  ├─ 路线: 京津高速 ~1.5h
  ├─ 出发: 5.16 早 8:30
  └─ 返程: 5.17 下午

§ 行程 (DAY BY DAY)
  ├─ Day 1 · 周六 5.16 · 北京 → 天津 · 入城与海河
  └─ Day 2 · 周日 5.17 · 古城与归途

§ 备注 / 待补
  ├─ 待定: 住宿确认 / 餐厅预约
  └─ 回京后: 实拍图、感受补回
```

### 行前推荐占位

**Day 1 · 5.16 周六**

| 时段 | 首选 | 备选 |
|---|---|---|
| 出发 8:30 | 京津高速 → 1.5h 抵津 | （遇堵改京沪） |
| 午餐 12:00 | 桂园餐厅（睦南道 · 津菜砂锅鱼头） | 起士林（俄式 1901） / 利顺德西餐厅 |
| 下午 | 五大道 + 民园广场（共享骑行） | 加挂瓷房子 |
| 黄昏 | 海河沿岸散步（津湾广场方向） | — |
| 晚餐 19:00 | 宇航员餐厅（意风区 · 新派津味） | 阿利雅意餐 |
| 住宿 | 利顺德大饭店（百年酒店 · 海河边） | 海河金茂凯悦 / 五大道民国洋楼民宿 |

**Day 2 · 5.17 周日**

| 时段 | 首选 | 备选 |
|---|---|---|
| 早餐 8:00 | 南楼煎饼（红桥区 · 本地排队） | 大福来嘎巴菜（鼓楼店） / 二嫂子煎饼 |
| 上午 | 古文化街（天后宫 · 泥人张 · 杨柳青） | 加挂天津之眼（9:00 摩天轮早班） |
| 午餐 12:30 | 登瀛楼鸿起顺（滨江道 · 津菜老字号） | 红旗饭庄 / 海河码头海鲜 |
| 返程 14:00 | 京津高速回京 | — |

**显式避免**：狗不理（本地口碑差）；过度商业化的连锁早餐摊。

### CSS

无新增 day-card / hero / section-label 样式。沿用已有类。

---

## 数据源与趟次编号

### `trips` 数据数组（位于 index.html 顶部 `<script>`）

```js
const trips = [
  {
    id: 'trip-1',
    file: 'trips/2026-05-xiy-bjs.html',
    start: '2026-05-01',
    end: '2026-05-07',
    days: 7,
    km: 1380,
    status: 'completed',
    route: ['西安', '洛阳', '平遥', '北京'],
    title: '五一自驾 · 穿越中原与山西',
    summary: '西安 → 北京 · 五一七日'
  },
  {
    id: 'trip-2',
    file: 'trips/2026-05-bjs-tsn.html',
    start: '2026-05-16',
    end: '2026-05-17',
    days: 2,
    km: 260,
    status: 'planning',
    route: ['北京', '天津'],
    title: '周末两日 · 海河与五大道',
    summary: '北京 → 天津 · 周末两日'
  }
];
```

### 趟次编号规则

- **运行时计算**：按 `start` 升序排序后的索引 + 1
- 不在数组里存号，避免新增/调整时漂移
- 编号体现「这是我们的第几段旅程」，类似日记章节号

---

## 朱印徽章（tripBadge）

### 视觉规格

| 属性 | 值 |
|---|---|
| 形状 | 圆角方章（rx=6） |
| 底色 | `var(--accent)` = #b85c38（朱砂红） |
| 字色 | `var(--paper)` = #faf6ef（米白） |
| 字体 | 'ZCOOL XiaoWei', serif |
| 默认尺寸 | 32 × 32 px（可参数控制） |
| 应用尺寸 | 卡片角标 36px / hero 角标 48px / 热力图格 22px |
| 字号 | 与尺寸成 0.7 比例（如 32px → 22px 字号） |

### 函数签名

```js
function tripBadge(n, { size = 32 } = {}) { ... }
```

返回内联 SVG 字符串。数字两位时自动收窄字距。

### 应用三处

1. **卡片**：每张 `.trip-card` 左上角，绝对定位
2. **行程详情页**：hero 区右上角（与上次徽章并列）
3. **热力图**：每个有趟次的格子里嵌入对应序号

---

## 热力图

### 容器与切换

放在 hero 区下方、年份分组上方。

```html
<section id="heatmap">
  <div class="heatmap-toggle">
    <button data-mode="month" class="active">月度</button>
    <button data-mode="year">年度</button>
  </div>
  <div class="heatmap-stats"></div>
  <div class="heatmap-grid"></div>
</section>
```

切换按钮：segmented control 风格，active 态用 `--accent` 描底。

### 月度视图（默认）

**统计文本**：`累计 N 趟 · X km · 跨 Y 年 · 出行最多月份 M 月`

**网格**：
- 每年一行 = 12 个 cell
- cell 尺寸 ~28 × 28 px（375px 视口下 12 列可容）
- 着色档位（按当月出行天数，4 档）：0 → 透明 ；1-2 → `--paper-mid` ；3-5 → `--gold-light` ；6+ → `--gold`
- 有趟次的 cell 内嵌入 `tripBadge(n, { size: 22 })`，多趟用 `①·②` 形式
- 行首年份标签：'ZCOOL XiaoWei' 18px

**交互**：
- `title` 属性 tooltip：`2026.5 · 9 天 · 1,640 km · 2 趟`
- 点击格子内某序号 → 锚跳到 `#trip-N` 卡片

### 年度视图

**统计文本**：`累计 N 趟 · X km · 跨 Y 城 · 最近一年 K 趟`

**网格**：
- 单行年格，每年 1 个大方块 ~56 × 56 px
- 着色档位（按当年累计 km，4 档）：0 → 透明 ；<500 → `--paper-mid` ；500-1500 → `--gold-light` ；1500+ → `--gold`
- 格内嵌入所有趟次序号，最多平铺 6 个，> 6 时显示 `①…⑦`
- 年份标签在方块下方居中

**交互**：同月度，tooltip 与锚跳一致。

### 偏好持久化

- localStorage key: `tx-heatmap-mode`
- 取值：`month` / `year`
- 默认：`month`
- 首次访问无 key 时也按默认。

### 切换动画

`opacity` 淡入淡出 150ms。不做布局动画（避免抖动）。

---

## 联动改动

### `index.html`

1. 在 `<head>` 后或 `<body>` 末追加 `<script>` 块，含 `trips` 数组、`tripBadge` 函数、热力图渲染逻辑
2. 在 hero 区与年份分组之间插入 `<section id="heatmap">`
3. 已有 hero-stats 三个 `<strong id="...">` 元素：用 JS 自动算 `trip-count` / `km-count`；`city-count` 保留 6（手填）
4. 已有 trip-card 加 `id="trip-1"`；新增 BJS→TSN 卡片：

```html
<a class="trip-card" id="trip-2" href="trips/2026-05-bjs-tsn.html">
  ...
  <span class="trip-status" data-status="planning">规划中</span>
</a>
```

新卡片插在「五一自驾」**上方**（时间倒序）。

### `README.md`

行程表新增一行（置顶）：

```markdown
| [周末两日 · BJS → TSN](./trips/2026-05-bjs-tsn.html) | 2026.5.16 – 5.17 | 约 260 km |
```

目录结构不改。

### CSS

新增样式（约 60 行，加在 index.html `<style>` 末尾）：

- `.heatmap-toggle` / `.heatmap-toggle button` / `button.active`
- `.heatmap-grid` / `.heatmap-row` / `.heatmap-cell`
- `.heatmap-cell[data-level="0|1|2|3|4"]` 4 档底色
- `.heatmap-stats`
- `.trip-seal`（朱印 SVG 容器位置与尺寸）

---

## Commit 拆分

| # | Commit 信息 | 内容 |
|---|---|---|
| C1 | `feat: trips 数据源 + tripBadge 朱印徽章模板` | 内联 JS `trips` 数组、`tripBadge(n)`、hero-stats 自动算 |
| C2 | `feat: BJS→TSN 周末行程页` | `trips/2026-05-bjs-tsn.html` + index 新卡片 + README |
| C3 | `feat: 项目级旅行热力图（月/年切换）` | `<section id="heatmap">` + 切换 + 渲染 + localStorage |
| C4 | `feat: 卡片与详情页编号角标 + 锚链联动` | 卡片 `id="trip-N"` + 朱印角标 + 热力图点击锚跳 |

分 4 个为了 revert 颗粒度。

---

## 验收清单（手动）

**基础**
- [ ] hero 显示「**2** 次旅行 · **1,640** 公里 · 6 座城市」
- [ ] 两张卡片左上角分别有朱印 #1 / #2
- [ ] 点击卡片正常跳行程详情页

**热力图 · 月度（默认）**
- [ ] 2026 年 5 月格子显示 ①② 两个朱印
- [ ] hover tooltip 显示「2026.5 · 9 天 · 1,640 km · 2 趟」
- [ ] 点击 ① → 滚动到 #trip-1 卡片
- [ ] 点击 ② → 滚动到 #trip-2 卡片

**热力图 · 年度**
- [ ] 切到「年度」后 2026 单格内显示 ①②
- [ ] tooltip「2026 · 2 趟 · 9 天 · 1,640 km」
- [ ] 刷新页面后视图选择被记住（localStorage）

**响应式**
- [ ] 375px 视口下热力图不溢出
- [ ] 朱印在 22 / 36 / 48 三档尺寸下数字清晰

**行程页**
- [ ] `trips/2026-05-bjs-tsn.html` 含 hero + 2 day-card + 备注区
- [ ] 状态徽章 `planning`
- [ ] hero 右上角朱印 #2
- [ ] 从该页返回 index 正常

---

## 已知保留项（不阻塞）

- 同月 ≥ 3 趟视觉降级方案（当前不会触发）
- 跨年趟次归属（开始月）
- 第 100 趟之后朱印两位数字字距适配（自动收 2pt）
- `city-count` 自动化（需 route 数据完整再做）

---

## 非目标

- 不引入构建工具 / 框架 / 包管理
- 不修改现有 `trips/2026-05-xiy-bjs.html` 的视觉（仅在 hero 区追加朱印 #1）
- 不动 `demos/` 与 `docs/`
