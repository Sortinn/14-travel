# BJS→TSN 行程页 + 项目级热力图 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `feature/add_new_travel_for_20260516` 分支上交付两件事：(1) 上线 BJS→TSN 周末自驾 planning 行程页；(2) 在首页引入项目级旅行热力图与朱印序号徽章系统。

**Architecture:** 单一内联 `trips` 数据数组（位于 `index.html`）驱动 hero 统计与热力图渲染；trip 卡片保持 HTML、靠 `id` 与数据对齐；朱印徽章通过一个 `tripBadge(n, opts)` 内联 SVG 模板函数动态生成（trip 详情页内则硬编码同款 SVG），全程无外部资源、无构建步骤。

**Tech Stack:** 纯静态 HTML / vanilla CSS / vanilla JS / GitHub Pages（默认 Jekyll 构建）。设计稿见 [`docs/superpowers/specs/2026-05-14-trip-bjs-tsn-and-heatmap-design.md`](../specs/2026-05-14-trip-bjs-tsn-and-heatmap-design.md)。

**测试策略:** 项目无自动化测试框架。每个任务以**手动浏览器验证**收尾，含具体的「打开文件 → 应当看到 X」检查项。

---

## File Structure

- **新建** `trips/2026-05-bjs-tsn.html` — BJS→TSN 行程页（复制 `2026-05-xiy-bjs.html` 后裁剪到 2 个 day-card + 备注区）
- **修改** `index.html` — 注入 `trips` 数组、`tripBadge` 函数、自动 hero 统计、热力图 `<section>`、新卡片、`id` 标注
- **修改** `README.md` — 行程表新增一行
- **修改** `trips/2026-05-xiy-bjs.html` — hero 区追加 #1 朱印（硬编码 SVG）

## Task Overview

| # | 任务 | 对应 spec commit | 产出 |
|---|---|---|---|
| 1 | 数据源 + tripBadge + 自动统计 | C1 | `trips` 数组、`tripBadge()`、hero 自动填充 |
| 2 | BJS→TSN 行程页 + index 卡片 + README | C2 | 新 trip 页、新卡片 |
| 3 | 热力图（月/年切换 + localStorage） | C3 | `<section id="heatmap">` + 渲染 JS |
| 4 | 卡片 id + 朱印角标 + 锚链联动 | C4 | 卡片 `id="trip-N"`、3 处朱印、点击锚跳 |

每个任务自带 commit。所有任务做完后整体合并 PR。

---

## Task 1: 数据源 + 朱印徽章模板 + 自动 hero 统计

**Files:**
- Modify: `index.html`（在 `</body>` 前插入新的 `<script>` 块；移除 hero-stats 中已有的硬编码数字 `1` / `1,380` / `6` 改为空，让 JS 注入）

### - [ ] Step 1.1: 读取 index.html 当前内容定位插入点

Run: `grep -n "hero-stats\|trip-count\|km-count\|city-count\|</body>" index.html`

Expected output 大概包括 line 324 (id="trip-count"), 327 (km-count), 330 (city-count), 366 (</body>).

记下这几行行号备用。

### - [ ] Step 1.2: 清空 hero-stats 中三个 `<strong>` 的硬编码文本

Edit `index.html` 把以下三行（具体行号以 grep 为准）：

```html
<span><strong id="trip-count">1</strong> 次旅行</span>
<span><strong id="km-count">1,380</strong> 公里</span>
<span><strong id="city-count">6</strong> 座城市</span>
```

替换为：

```html
<span><strong id="trip-count">—</strong> 次旅行</span>
<span><strong id="km-count">—</strong> 公里</span>
<span><strong id="city-count">6</strong> 座城市</span>
```

`trip-count` 和 `km-count` 用 `—` 占位（JS 加载后会被替换）。`city-count` 保留 `6` 作手填值（spec 明确不自动算城市）。

### - [ ] Step 1.3: 在 `</body>` 前插入数据 + 函数 + 自动统计 `<script>`

把以下 `<script>` 块插入到 `</body>` 标签之前：

```html
<script>
  // ====== 数据源 ======
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
  ].sort((a, b) => a.start.localeCompare(b.start));

  // 运行时序号 = 数组索引 + 1（按 start 升序）
  trips.forEach((t, i) => { t.seq = i + 1; });

  // ====== 朱印徽章模板 ======
  function tripBadge(n, opts) {
    const size = (opts && opts.size) || 32;
    const fontSize = Math.round(size * 0.7);
    return `<svg class="trip-seal" viewBox="0 0 48 48" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-label="第${n}段">
      <rect x="2" y="2" width="44" height="44" rx="6" fill="var(--accent)"/>
      <text x="24" y="${24 + fontSize * 0.35}" text-anchor="middle"
            font-family="'ZCOOL XiaoWei', serif" font-size="${fontSize}"
            fill="var(--paper)" font-weight="600">${n}</text>
    </svg>`;
  }

  // ====== 自动 hero 统计 ======
  (function updateHeroStats() {
    const tc = document.getElementById('trip-count');
    const km = document.getElementById('km-count');
    if (tc) tc.textContent = trips.length;
    if (km) km.textContent = trips.reduce((s, t) => s + t.km, 0).toLocaleString();
    // city-count 保留手填（route 数据未完整时不自动算）
  })();
</script>
```

### - [ ] Step 1.4: 浏览器验证

打开 `index.html`：
- hero 三个统计应显示 **2 次旅行 · 1,640 公里 · 6 座城市**（前两项由 JS 算出）
- 打开开发者工具 Console，输入 `trips` 应输出 2 个对象的数组，每个对象含 `seq` 字段（1 和 2）
- 输入 `tripBadge(7)` 应返回 `<svg ...>` 字符串

### - [ ] Step 1.5: Commit

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: trips 数据源 + tripBadge 朱印徽章模板 + 自动 hero 统计

- 内联 trips 数组（含 trip-1 五一七日 + trip-2 BJS-TSN 周末）
- 运行时按 start 升序计算 seq 序号
- tripBadge(n, { size }) 函数生成朱印 SVG，使用项目调色板
- hero-stats 的趟次数 / 总里程由 JS 自动填充

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: BJS→TSN 行程页 + index 新卡片 + README

**Files:**
- Create: `trips/2026-05-bjs-tsn.html`
- Modify: `index.html`（在 `<div class="year-group">` 里 trip-card 之前插入新卡片）
- Modify: `README.md`（行程表插入一行）

### - [ ] Step 2.1: 复制模板文件

```bash
cp trips/2026-05-xiy-bjs.html trips/2026-05-bjs-tsn.html
```

### - [ ] Step 2.2: 修改 `<title>` 和 hero 区

在新文件中：

替换 `<title>` 行：

```html
<title>北京 → 天津 · 周末两日 | 十四行记</title>
```

定位 `<!-- HERO -->` 注释，替换 `<div class="hero">...</div>` 整块为：

```html
<!-- HERO -->
<div class="hero">
  <div class="deco-char">津</div>
  <div class="hero-badge">2026 周末 · 京津</div>
  <h1>北京 <span>→</span> 天津<br>周末两日</h1>
  <p class="hero-sub">May 16 – 17, 2026 &nbsp;·&nbsp; 自驾 · 海河与五大道</p>
  <div style="margin-top: 12px;">
    <span class="trip-status on-dark" data-status="planning">规划中</span>
  </div>
  <div class="hero-seal-wrap">
    <svg class="trip-seal" viewBox="0 0 48 48" width="48" height="48" xmlns="http://www.w3.org/2000/svg" aria-label="第2段">
      <rect x="2" y="2" width="44" height="44" rx="6" fill="var(--accent)"/>
      <text x="24" y="35.9" text-anchor="middle"
            font-family="'ZCOOL XiaoWei', serif" font-size="34"
            fill="var(--paper)" font-weight="600">2</text>
    </svg>
  </div>
  <div class="hero-stats">
    <div class="hero-stat">
      <span class="num">2</span>
      <span class="lbl">天数</span>
    </div>
    <div class="hero-stat">
      <span class="num">260</span>
      <span class="lbl">总里程 km</span>
    </div>
    <div class="hero-stat">
      <span class="num">1</span>
      <span class="lbl">途经城市</span>
    </div>
  </div>
</div>
```

### - [ ] Step 2.3: 在 `<style>` 末尾追加 `.hero-seal-wrap` 定位样式

在文件中找到 `</style>` 标签，在它前面追加：

```css
  /* 朱印徽章定位（hero 右上） */
  .hero-seal-wrap {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 2;
  }
```

### - [ ] Step 2.4: 替换 route-bar

定位 `<!-- ROUTE BAR -->` 注释，替换 `<div class="route-bar">...</div>` 整块为：

```html
<!-- ROUTE BAR -->
<div class="route-bar">
  <div class="route-city">
    <div class="dot"></div>
    <span>北京</span>
  </div>
  <div class="route-line"></div>
  <div class="route-city">
    <div class="dot end"></div>
    <span>天津</span>
  </div>
</div>
```

### - [ ] Step 2.5: 删除 ROUTE MAP 整块

模板中 `<!-- ROUTE MAP -->` 与 `<!-- CARE NOTICE -->` 之间是一大段路线地图 SVG（约 100 行）。BJS→TSN 只有两个城市，不需要路线地图。

删除范围：从 `<!-- ROUTE MAP -->` 开始（含），到 `<!-- CARE NOTICE -->` 前一行（不含）。

验证：`grep -n "ROUTE MAP\|CARE NOTICE" trips/2026-05-bjs-tsn.html` 应只显示 `CARE NOTICE` 一行（ROUTE MAP 已被删除）。

### - [ ] Step 2.6: 替换 days 区为 2 个 day-card

定位 `<div class="days">` 标签，替换整个 `<div class="days">...</div>` 块（含所有现有 day-card）为：

```html
<div class="days">

  <!-- DAY 1 -->
  <div class="day-card driving">
    <div class="day-num">
      <span>DAY</span>
      <strong>1</strong>
    </div>
    <div class="day-inner">
      <div class="day-header">
        <h3>北京 → 天津<br>入城与海河</h3>
        <span class="date-tag">5月16日 周六</span>
      </div>
      <div class="drive-info">
        <div class="di">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3l9 9-9 9"/></svg>
          约 130 km
        </div>
        <div class="di">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          驾车约 1.5 小时
        </div>
        <div class="di">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          京津高速
        </div>
      </div>
      <div class="day-body">
        <div class="spot-list">
          <div class="spot">
            <span class="spot-time">8:30</span>
            <div class="spot-content">
              <div class="spot-name">北京出发，京津高速直抵天津</div>
              <div class="spot-desc">遇堵可改京沪高速。预计 10:00 前后抵达。</div>
            </div>
          </div>
          <div class="spot">
            <span class="spot-time">12:00</span>
            <div class="spot-content">
              <div class="spot-name">桂园餐厅 · 睦南道</div>
              <div class="spot-desc">津菜老字号，主打砂锅鱼头。备选：起士林（俄式 1901）、利顺德西餐厅。</div>
              <span class="tag tag-food">美食推荐</span>
            </div>
          </div>
          <div class="spot">
            <span class="spot-time">下午</span>
            <div class="spot-content">
              <div class="spot-name">五大道 + 民园广场</div>
              <div class="spot-desc">民国洋楼街区，共享单车骑行。可加挂瓷房子（粤唯鲜博物馆）。</div>
            </div>
          </div>
          <div class="spot">
            <span class="spot-time">黄昏</span>
            <div class="spot-content">
              <div class="spot-name">海河沿岸散步 · 津湾广场方向</div>
              <div class="spot-desc">入夜灯光起，海河两岸建筑群灯光秀。</div>
            </div>
          </div>
          <div class="spot">
            <span class="spot-time">19:00</span>
            <div class="spot-content">
              <div class="spot-name">宇航员餐厅 · 意风区</div>
              <div class="spot-desc">新派津味，氛围年轻。备选：阿利雅意餐。</div>
              <span class="tag tag-food">美食推荐</span>
            </div>
          </div>
        </div>
      </div>
      <div class="day-footer">
        <div class="hotel-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          住宿建议
        </div>
        <span class="hotel-name">利顺德大饭店 · 海河边</span>
        <span class="hotel-badge hotel-badge-todo">待预订</span>
      </div>
    </div>
  </div>

  <!-- DAY 2 -->
  <div class="day-card driving">
    <div class="day-num">
      <span>DAY</span>
      <strong>2</strong>
    </div>
    <div class="day-inner">
      <div class="day-header">
        <h3>古城与归途<br>天津 → 北京</h3>
        <span class="date-tag">5月17日 周日</span>
      </div>
      <div class="drive-info">
        <div class="di">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3l9 9-9 9"/></svg>
          约 130 km
        </div>
        <div class="di">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          驾车约 1.5 小时
        </div>
        <div class="di">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          京津高速回京
        </div>
      </div>
      <div class="day-body">
        <div class="spot-list">
          <div class="spot">
            <span class="spot-time">8:00</span>
            <div class="spot-content">
              <div class="spot-name">南楼煎饼 · 红桥区</div>
              <div class="spot-desc">本地热门早点，需排队。备选：大福来嘎巴菜（鼓楼店）、二嫂子煎饼。</div>
              <span class="tag tag-food">美食推荐</span>
            </div>
          </div>
          <div class="spot">
            <span class="spot-time">上午</span>
            <div class="spot-content">
              <div class="spot-name">古文化街</div>
              <div class="spot-desc">天后宫、泥人张、杨柳青年画。可加挂天津之眼（9:00 摩天轮早班）。</div>
            </div>
          </div>
          <div class="spot">
            <span class="spot-time">12:30</span>
            <div class="spot-content">
              <div class="spot-name">登瀛楼鸿起顺 · 滨江道</div>
              <div class="spot-desc">津菜老字号。备选：红旗饭庄、海河码头海鲜。</div>
              <span class="tag tag-food">美食推荐</span>
            </div>
          </div>
          <div class="spot">
            <span class="spot-time">14:00</span>
            <div class="spot-content">
              <div class="spot-name">京津高速返京</div>
              <div class="spot-desc">建议下午尽早返京，避开周日晚高峰。</div>
            </div>
          </div>
        </div>
      </div>
      <div class="day-footer">
        <div class="hotel-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          晚餐
        </div>
        <span class="hotel-name">回京后晚饭</span>
        <span class="hotel-badge hotel-badge-todo">家中</span>
      </div>
    </div>
  </div>

</div>
```

### - [ ] Step 2.7: 在 days 区后追加「备注 / 待补」section

在 `</div>` 关闭 `class="days"` 之后、下一个 section-label 或 footer 之前，插入：

```html
<!-- PLANNING NOTES -->
<div class="section-label">
  <span>备注 · 待补</span>
</div>
<div style="margin: 0 24px 24px; padding: 16px 18px; background: var(--paper-warm); border-radius: 12px; font-size: 13px; line-height: 1.9; color: var(--ink-mid);">
  <p style="margin-bottom: 8px;"><strong>行前待办：</strong></p>
  <ul style="margin-left: 18px; margin-bottom: 14px;">
    <li>确认住宿（利顺德 vs 海河金茂凯悦 vs 民宿）</li>
    <li>是否预约相声茶馆周六晚场</li>
    <li>桂园 / 宇航员 / 登瀛楼 三家是否需要预订</li>
  </ul>
  <p style="margin-bottom: 8px;"><strong>回京后：</strong></p>
  <ul style="margin-left: 18px;">
    <li>补实拍图、感受</li>
    <li>把状态徽章 <code>data-status</code> 改为 <code>completed</code></li>
    <li>更新里程实际值（如有偏差）</li>
  </ul>
</div>
```

### - [ ] Step 2.8: 删除模板中其余无关 sections

模板里还有 `<!-- CARE NOTICE -->`、`<!-- TIPS -->`、`<!-- EXTRA TIPS -->` 三段冗余内容（针对七日长途的注意事项 / 行车贴士）。对周末两日行用不上，整块删除。

操作：
1. 删除 `<!-- CARE NOTICE -->` 整段（从注释行到下一个 `<!-- ... -->` 注释前一行）
2. 删除 `<!-- TIPS -->` 整段
3. 删除 `<!-- EXTRA TIPS -->` 整段
4. 保留 `<!-- FOOTER -->` 段（含 `</body>` `</html>`）

完成后 `grep -n "<!-- " trips/2026-05-bjs-tsn.html | grep -vE "(DAY [0-9]+|── |省|城市|里程|出发|途经|终点|标注|指北针|总里程|平遥|洛阳|娘子关|正定|天津|北京|路线|西安)"` 应只显示：
- `<!-- HERO -->`
- `<!-- ROUTE BAR -->`
- `<!-- DAY LIST -->`
- `<!-- PLANNING NOTES -->`（Task 2.7 已插入）
- `<!-- FOOTER -->`

### - [ ] Step 2.9: 修改 `index.html`：在现有 trip-card 之前插入新卡片

定位 `<a class="trip-card" href="trips/2026-05-xiy-bjs.html">` 这一行。

在它**之前**插入：

```html
  <a class="trip-card" href="trips/2026-05-bjs-tsn.html">
    <div class="trip-card-top">
      <div class="trip-route">
        北京<span class="arrow">→</span>天津
      </div>
      <div class="trip-title">周末两日 · 海河与五大道</div>
    </div>
    <div class="trip-card-bottom">
      <div class="trip-tags">
        <span class="tag tag-drive">自驾</span>
        <span class="tag tag-days">2 天</span>
        <span class="tag tag-season">春季</span>
      </div>
      <div style="text-align:right;">
        <div class="trip-date">2026.5.16 – 5.17</div>
        <div class="trip-km">约 260 km</div>
      </div>
      <span class="trip-status" data-status="planning">规划中</span>
    </div>
  </a>
```

### - [ ] Step 2.10: 更新 `README.md` 行程表

定位行：

```markdown
| [五一自驾 · XIY → BJS](./trips/2026-05-xiy-bjs.html) | 2026.5.1 – 5.7 | 约 1,380 km |
```

在它**之前**插入一行：

```markdown
| [周末两日 · BJS → TSN](./trips/2026-05-bjs-tsn.html) | 2026.5.16 – 5.17 | 约 260 km |
```

### - [ ] Step 2.11: 浏览器验证

打开 `index.html`：
- 顶部出现两张 trip-card，BJS→TSN 在上、XIY→BJS 在下
- 新卡片的状态徽章为「规划中」（虚线 + 淡墨色）
- 点击新卡片跳转 `trips/2026-05-bjs-tsn.html`，hero 显示「北京 → 天津 · 周末两日」与右上角朱印 #2
- 详情页的 day-card 显示两天计划，hotel-info 区显示「待预订」badge
- 「备注 · 待补」区列出行前/行后清单

### - [ ] Step 2.12: Commit

```bash
git add trips/2026-05-bjs-tsn.html index.html README.md
git commit -m "$(cat <<'EOF'
feat: BJS→TSN 周末行程页（行前规划态）

- 新建 trips/2026-05-bjs-tsn.html：hero + 2 day-card + 备注/待补
- 沿用上次 day-card 模板，hero 右上角硬编码 #2 朱印
- index.html 顶部新增 trip-card，状态徽章 planning
- README 行程表新增一行（置顶 · 时间倒序）
- 行程内容为行前推荐占位，回京后再编辑实录并改 status

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 热力图（月/年切换 + localStorage）

**Files:**
- Modify: `index.html`（CSS：在 `</style>` 前追加；HTML：在 hero 与 year-group 之间插入；JS：在 Task 1 的 `<script>` 末尾追加渲染逻辑）

### - [ ] Step 3.1: 在 `<style>` 末尾追加热力图 CSS

在 `index.html` 的 `</style>` 标签**前面**追加：

```css
  /* ============================
     热力图 · Travel Heatmap
     ============================ */
  .heatmap {
    margin: 24px 24px 8px;
    padding: 16px 18px;
    background: white;
    border: 1px solid var(--paper-mid);
    border-radius: 12px;
  }
  .heatmap-toggle {
    display: inline-flex;
    background: var(--paper-warm);
    border-radius: 999px;
    padding: 3px;
    margin-bottom: 12px;
  }
  .heatmap-toggle button {
    border: 0;
    background: transparent;
    font-family: 'Noto Serif SC', serif;
    font-size: 12px;
    color: var(--ink-mid);
    padding: 5px 14px;
    border-radius: 999px;
    cursor: pointer;
    letter-spacing: 1px;
    transition: background 0.18s, color 0.18s;
  }
  .heatmap-toggle button.active {
    background: var(--accent);
    color: var(--paper);
    font-weight: 400;
  }
  .heatmap-stats {
    font-size: 11px;
    color: var(--stone);
    letter-spacing: 0.5px;
    margin-bottom: 10px;
    line-height: 1.6;
  }
  .heatmap-stats strong {
    color: var(--ink);
    font-weight: 400;
  }
  .heatmap-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: opacity 0.15s;
  }
  .heatmap-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .heatmap-year-label {
    width: 36px;
    font-family: 'ZCOOL XiaoWei', serif;
    font-size: 13px;
    color: var(--ink-mid);
    flex-shrink: 0;
  }
  .heatmap-cell {
    width: 26px;
    height: 26px;
    border-radius: 4px;
    background: transparent;
    border: 1px solid var(--paper-mid);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }
  .heatmap-cell[data-level="1"] { background: var(--paper-mid); border-color: var(--paper-mid); }
  .heatmap-cell[data-level="2"] { background: var(--gold-light); border-color: var(--gold-light); }
  .heatmap-cell[data-level="3"] { background: var(--gold); border-color: var(--gold); }
  .heatmap-cell .trip-seal { cursor: pointer; }
  .heatmap-cell .trip-seal + .trip-seal { margin-left: -8px; }

  /* 月份表头 */
  .heatmap-months {
    display: flex;
    gap: 4px;
    margin-left: 40px;
    margin-bottom: 4px;
  }
  .heatmap-months span {
    width: 26px;
    text-align: center;
    font-size: 9px;
    color: var(--stone);
    letter-spacing: 0;
  }

  /* 年度视图大格子 */
  .heatmap-year-cell {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    border: 1px solid var(--paper-mid);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    padding: 4px;
    gap: 2px;
  }
  .heatmap-year-cell[data-level="1"] { background: var(--paper-mid); border-color: var(--paper-mid); }
  .heatmap-year-cell[data-level="2"] { background: var(--gold-light); border-color: var(--gold-light); }
  .heatmap-year-cell[data-level="3"] { background: var(--gold); border-color: var(--gold); }
  .heatmap-year-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  .heatmap-year-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .heatmap-year-item-label {
    font-family: 'ZCOOL XiaoWei', serif;
    font-size: 12px;
    color: var(--ink-mid);
  }
```

### - [ ] Step 3.2: 在 hero 与 year-group 之间插入热力图 HTML

定位 `<div class="year-group">`。

在它**之前**插入：

```html
<section class="heatmap" id="heatmap">
  <div class="heatmap-toggle">
    <button type="button" data-mode="month" class="active">月度</button>
    <button type="button" data-mode="year">年度</button>
  </div>
  <div class="heatmap-stats" id="heatmap-stats">—</div>
  <div class="heatmap-grid" id="heatmap-grid"></div>
</section>
```

### - [ ] Step 3.3: 在 Task 1 的 `<script>` 末尾追加月度渲染函数

在 `index.html` 已有的 `<script>` 块内部，`updateHeroStats()` 调用之后追加：

```js
  // ====== 热力图：通用工具 ======
  function tripMonths(t) {
    // 返回该 trip 涵盖的 [{year, month, daysInMonth}]
    const s = new Date(t.start), e = new Date(t.end);
    const out = [];
    let y = s.getFullYear(), m = s.getMonth();
    const ey = e.getFullYear(), em = e.getMonth();
    while (y < ey || (y === ey && m <= em)) {
      const monthStart = new Date(y, m, 1);
      const monthEnd = new Date(y, m + 1, 0);
      const overlapStart = s > monthStart ? s : monthStart;
      const overlapEnd = e < monthEnd ? e : monthEnd;
      const days = Math.round((overlapEnd - overlapStart) / 86400000) + 1;
      out.push({ year: y, month: m, days });
      m++; if (m > 11) { m = 0; y++; }
    }
    return out;
  }

  function levelByDays(d) {
    if (d <= 0) return 0;
    if (d <= 2) return 1;
    if (d <= 5) return 2;
    return 3;
  }

  function levelByKm(km) {
    if (km <= 0) return 0;
    if (km < 500) return 1;
    if (km < 1500) return 2;
    return 3;
  }

  // ====== 月度视图渲染 ======
  function renderMonthView() {
    const grid = document.getElementById('heatmap-grid');
    const stats = document.getElementById('heatmap-stats');
    if (!grid || !stats) return;

    // 聚合：year -> month -> { days, trips: [seq] }
    const agg = {};
    let monthCounter = {};
    trips.forEach(t => {
      tripMonths(t).forEach(({ year, month, days }) => {
        agg[year] = agg[year] || {};
        const key = month;
        agg[year][key] = agg[year][key] || { days: 0, trips: [] };
        agg[year][key].days += days;
        agg[year][key].trips.push(t.seq);
        monthCounter[month + 1] = (monthCounter[month + 1] || 0) + 1;
      });
    });

    // 找峰值月
    let peakMonth = null, peakCount = 0;
    Object.keys(monthCounter).forEach(m => {
      if (monthCounter[m] > peakCount) { peakCount = monthCounter[m]; peakMonth = m; }
    });

    const years = Object.keys(agg).sort();
    const totalKm = trips.reduce((s, t) => s + t.km, 0);
    stats.innerHTML = `累计 <strong>${trips.length}</strong> 趟 · <strong>${totalKm.toLocaleString()}</strong> km · 跨 <strong>${years.length}</strong> 年${peakMonth ? ` · 出行最多月份 <strong>${peakMonth} 月</strong>` : ''}`;

    let html = `<div class="heatmap-months"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span></div>`;
    years.forEach(y => {
      html += `<div class="heatmap-row"><span class="heatmap-year-label">${y}</span>`;
      for (let m = 0; m < 12; m++) {
        const cell = agg[y][m];
        const lvl = cell ? levelByDays(cell.days) : 0;
        const title = cell
          ? `${y}.${m + 1} · ${cell.days} 天 · ${cell.trips.length} 趟`
          : `${y}.${m + 1} · 无出行`;
        let inner = '';
        if (cell) {
          const seals = cell.trips.slice(0, 2).map(n => `<a href="#trip-${n}">${tripBadge(n, { size: 22 })}</a>`).join('');
          inner = seals + (cell.trips.length > 2 ? '<sup>+</sup>' : '');
        }
        html += `<div class="heatmap-cell" data-level="${lvl}" title="${title}">${inner}</div>`;
      }
      html += `</div>`;
    });
    grid.innerHTML = html;
  }

  // ====== 年度视图渲染 ======
  function renderYearView() {
    const grid = document.getElementById('heatmap-grid');
    const stats = document.getElementById('heatmap-stats');
    if (!grid || !stats) return;

    // 聚合：year -> { km, days, trips: [seq] }
    const agg = {};
    trips.forEach(t => {
      const y = new Date(t.start).getFullYear();
      agg[y] = agg[y] || { km: 0, days: 0, trips: [] };
      agg[y].km += t.km;
      agg[y].days += t.days;
      agg[y].trips.push(t.seq);
    });

    const years = Object.keys(agg).sort();
    const totalKm = trips.reduce((s, t) => s + t.km, 0);
    const uniqueCities = new Set();
    trips.forEach(t => (t.route || []).forEach(c => uniqueCities.add(c)));
    const recentYear = years[years.length - 1];
    const recentCount = recentYear ? agg[recentYear].trips.length : 0;

    stats.innerHTML = `累计 <strong>${trips.length}</strong> 趟 · <strong>${totalKm.toLocaleString()}</strong> km · 跨 <strong>${uniqueCities.size}</strong> 城 · 最近一年 <strong>${recentCount}</strong> 趟`;

    let html = `<div class="heatmap-year-row">`;
    years.forEach(y => {
      const cell = agg[y];
      const lvl = levelByKm(cell.km);
      const title = `${y} · ${cell.trips.length} 趟 · ${cell.days} 天 · ${cell.km.toLocaleString()} km`;
      const seals = cell.trips.slice(0, 6).map(n => `<a href="#trip-${n}">${tripBadge(n, { size: 18 })}</a>`).join('');
      const ellipsis = cell.trips.length > 6 ? '<sup>…</sup>' : '';
      html += `<div class="heatmap-year-item">
        <div class="heatmap-year-cell" data-level="${lvl}" title="${title}">${seals}${ellipsis}</div>
        <span class="heatmap-year-item-label">${y}</span>
      </div>`;
    });
    html += `</div>`;
    grid.innerHTML = html;
  }

  // ====== 切换 + localStorage ======
  function setHeatmapMode(mode) {
    const buttons = document.querySelectorAll('.heatmap-toggle button');
    buttons.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    const grid = document.getElementById('heatmap-grid');
    if (grid) grid.style.opacity = '0';
    setTimeout(() => {
      if (mode === 'year') renderYearView(); else renderMonthView();
      if (grid) grid.style.opacity = '1';
    }, 150);
    try { localStorage.setItem('tx-heatmap-mode', mode); } catch (e) {}
  }

  (function initHeatmap() {
    let mode = 'month';
    try { mode = localStorage.getItem('tx-heatmap-mode') || 'month'; } catch (e) {}
    const buttons = document.querySelectorAll('.heatmap-toggle button');
    buttons.forEach(b => {
      b.addEventListener('click', () => setHeatmapMode(b.dataset.mode));
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    if (mode === 'year') renderYearView(); else renderMonthView();
  })();
```

### - [ ] Step 3.4: 浏览器验证

打开 `index.html`：
- hero 下方出现「月度 / 年度」segmented control，月度激活
- 统计行显示「累计 **2** 趟 · **1,640** km · 跨 **1** 年 · 出行最多月份 **5** 月」
- 月度网格显示 2026 年一行 + 顶部 12 月份标签；5 月格子内有 ①② 两个朱印重叠
- hover 5 月格子，tooltip 显示「2026.5 · 9 天 · 2 趟」
- 点击「年度」：网格切换为单个大格（2026），内部有 ①② 朱印；统计文本变化
- 刷新页面：之前选择的视图被保留
- 在 Console 输入 `localStorage.getItem('tx-heatmap-mode')` 应返回 `month` 或 `year`

### - [ ] Step 3.5: Commit

```bash
git add index.html
git commit -m "$(cat <<'EOF'
feat: 项目级旅行热力图（月/年切换 + localStorage）

- hero 下方新增 <section id="heatmap">：segmented control + 统计行 + 网格
- 月度视图：年×12 月，按当月出行天数 4 档着色，含 ①②… 朱印
- 年度视图：单行年格，按当年累计 km 4 档着色，含趟次朱印
- 切换偏好持久化到 localStorage（tx-heatmap-mode）
- 切换含 150ms 不抖布局的淡入淡出

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 卡片 id + 卡片角标 + 详情页 #1 朱印 + 锚链联动

**Files:**
- Modify: `index.html`（给两张 trip-card 加 `id`、在卡片左上角注入朱印）
- Modify: `trips/2026-05-xiy-bjs.html`（hero 区追加 #1 朱印）

### - [ ] Step 4.1: 给 index.html 两张 trip-card 加 `id`

找到 `<a class="trip-card" href="trips/2026-05-bjs-tsn.html">`，改为：

```html
<a class="trip-card" id="trip-2" href="trips/2026-05-bjs-tsn.html">
```

找到 `<a class="trip-card" href="trips/2026-05-xiy-bjs.html">`，改为：

```html
<a class="trip-card" id="trip-1" href="trips/2026-05-xiy-bjs.html">
```

### - [ ] Step 4.2: 在 index.html `<style>` 末尾追加卡片朱印定位 CSS

在 `</style>` 前追加：

```css
  .trip-card { position: relative; }
  .trip-card-seal {
    position: absolute;
    top: 12px;
    right: 14px;
    z-index: 2;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
  }
  .trip-card-top {
    padding-right: 56px; /* 留出朱印空间 */
  }
```

### - [ ] Step 4.3: 在 Task 1 的 `<script>` 末尾追加卡片朱印注入逻辑

在 `initHeatmap()` 调用之后追加：

```js
  // ====== 卡片左上角朱印注入 ======
  (function injectCardSeals() {
    trips.forEach(t => {
      const card = document.getElementById(t.id);
      if (!card) return;
      const top = card.querySelector('.trip-card-top');
      if (!top || top.querySelector('.trip-card-seal')) return;
      const wrap = document.createElement('div');
      wrap.className = 'trip-card-seal';
      wrap.innerHTML = tripBadge(t.seq, { size: 36 });
      top.appendChild(wrap);
    });
  })();
```

### - [ ] Step 4.4: 给 `trips/2026-05-xiy-bjs.html` hero 区追加 #1 朱印

定位文件中 `<!-- HERO -->` 段。在 `<div class="hero-stats">` **之前**插入：

```html
  <div class="hero-seal-wrap">
    <svg class="trip-seal" viewBox="0 0 48 48" width="48" height="48" xmlns="http://www.w3.org/2000/svg" aria-label="第1段">
      <rect x="2" y="2" width="44" height="44" rx="6" fill="var(--accent)"/>
      <text x="24" y="35.9" text-anchor="middle"
            font-family="'ZCOOL XiaoWei', serif" font-size="34"
            fill="var(--paper)" font-weight="600">1</text>
    </svg>
  </div>
```

并在 `<style>` 末尾追加（若不存在）：

```css
  .hero-seal-wrap {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 2;
  }
```

### - [ ] Step 4.5: 浏览器验证（综合）

打开 `index.html`：
- 每张 trip-card 左上角有朱印（#1 / #2），不挡住 trip-route 文字
- 点击热力图月度视图 5 月格子内的 ①：页面滚动到 #trip-1 卡片
- 点击 ②：滚动到 #trip-2 卡片
- 切到年度，点击 2026 格子里的 ①②：同样能锚跳

打开 `trips/2026-05-xiy-bjs.html`：
- hero 右上角出现朱印 #1
- 不与已有「已完成」状态徽章 / deco-char 重叠或冲突

打开 `trips/2026-05-bjs-tsn.html`（已在 Task 2 加过 #2）：
- hero 右上角朱印 #2 显示正常

### - [ ] Step 4.6: Commit

```bash
git add index.html trips/2026-05-xiy-bjs.html
git commit -m "$(cat <<'EOF'
feat: 卡片与详情页朱印角标 + 热力图锚链联动

- 两张 trip-card 添加 id="trip-N"，左上角注入朱印（36px）
- trips/2026-05-xiy-bjs.html hero 追加 #1 朱印（48px 硬编码）
- 热力图格内朱印为 <a href="#trip-N">，点击锚跳到对应卡片
- 卡片 trip-card-top 右内边距 56px，避免文字与朱印重叠

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## 最终联合验证（所有任务完成后）

按 spec 的「验收清单」逐条通过：

- [ ] hero 显示「2 次旅行 · 1,640 公里 · 6 座城市」
- [ ] 两张卡片左上角分别有朱印 #1 / #2
- [ ] 月度热力图 2026.5 格子内 ①②、tooltip 正确
- [ ] 点击 ① → #trip-1，点击 ② → #trip-2
- [ ] 切到年度：2026 单格内 ①②，tooltip 正确
- [ ] 刷新后视图选择被记住
- [ ] iPhone SE（375px）视口下热力图不溢出（用浏览器 DevTools 模拟）
- [ ] BJS→TSN 详情页结构完整、hero 朱印 #2 正常
- [ ] XIY→BJS 详情页 hero 现在多出 #1 朱印，旧内容无破坏

---

## 推送 + PR

所有 4 个 commit + 1 个 spec commit（之前已推）合并后：

```bash
git push origin HEAD:feature/add_new_travel_for_20260516
```

然后用浏览器打开 GitHub 建 PR（base = main）或在装 `gh` 后用 `gh pr create`：

- 标题：`feat: BJS→TSN 周末行程页 + 项目级旅行热力图`
- 正文要点：列出 4 个 commit 的内容、附 spec 文档链接、手动验收清单

---

## 已知保留项（不在本计划内）

- 同月 ≥3 趟视觉降级（当前不触发）
- 跨年趟次的精确分摊（当前按开始月归属）
- 第 100 趟之后朱印字距适配（>99 时 SVG `font-size` 自动减 2pt 的逻辑）
- `city-count` 自动化（待 route 数据齐全）
- 拆 CSS 到共享文件（YAGNI）
