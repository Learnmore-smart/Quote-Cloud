# AI 驱动的排版海报与句子云生成器 (Interactive Quote Cloud & Poster Generator) Spec

## Why
用户希望在浏览器中以极具艺术感的「句子云」形式呈现一组留言，并能一键导出为高分辨率、可印刷的实体海报（A4 / A3 / Letter 等）。该工具将 AI 文本权重分析、Canvas 文本测量、阿基米德螺旋线排版算法与浏览器原生打印管线整合到一个零依赖的 HTML 文件中。

## What Changes
- 新增一个单文件 HTML 应用（`index.html`），包含全部 HTML / CSS / JS。
- 内置 15 条初始 Quote 数组作为种子数据。
- 新增 OpenRouter AI 权重请求：调用 `google/gemini-flash-1.5`，为每条 quote 补充 `weight`（1/2/3）。
- 新增基于离屏 `<canvas>` + `context.measureText()` 的多行换行测量函数 `measureMultilineText`。
- 新增阿基米德螺旋线 + AABB 碰撞检测的句子云布局算法。
- 新增画板容器的纸张比例自适应与等比缩放（`transform: scale(n)`）。
- 新增控制面板：纸张尺寸、方向、作者显隐、一键打印。
- 新增 `@media print` 专属样式：动态注入 `@page` 规则，强制白底纯黑、省墨、隐藏控制面板。
- 新增 Hover 聚焦交互：被悬停句子放大高亮，其他句子变暗并高斯模糊。
- 新增作者淡入显示逻辑（默认隐藏，全局开关或 Hover 单条时显示）。

## Impact
- Affected specs: 新增能力「quote-cloud-rendering」「ai-weight-analysis」「print-pipeline」「focus-mode-interaction」。
- Affected code: 全新文件 `index.html`（覆盖 `/workspace/index.html`）。

## ADDED Requirements

### Requirement: AI 权重分析
系统 SHALL 在页面加载时向 OpenRouter 发送请求，使用 `google/gemini-flash-1.5` 模型为每条 quote 计算 `weight`（1/2/3）。  
系统 MUST 在请求失败或 API Key 缺失时回退到本地启发式（基于句长 / 标点 / 关键词的简单评分）以保证页面始终可渲染。  
系统 MUST 解析返回文本中的合法 JSON 数组，过滤 markdown 标记（```json 等）。

#### Scenario: API Key 已配置
- **WHEN** 页面加载且 `OPENROUTER_API_KEY` 不为空
- **THEN** 调用 OpenRouter，返回带 `weight` 的 quote 数组，触发布局渲染

#### Scenario: API Key 为空或请求失败
- **WHEN** `OPENROUTER_API_KEY` 为空字符串或网络错误
- **THEN** 启用本地启发式评分，所有 quote 仍能正确渲染，不抛出未捕获错误

### Requirement: Canvas 多行文本测量
系统 SHALL 在内存中创建隐藏的离屏 `<canvas>` 元素，使用 `context.measureText()` 测量文本尺寸。  
系统 MUST 提供 `measureMultilineText(text, fontSize, fontWeight, maxWidth)` 函数，返回 `[width, height]`。  
系统 MUST 在 Canvas 虚拟环境中模拟 word-wrapping（按词或字符切分），按 `lineHeight = fontSize * 1.2` 累计高度。  
不同 `weight` 应对应不同 `fontSize`（weight 3 最大）和不同 `maxWidth`（大字号对应更宽的 maxWidth）。

#### Scenario: 长句子自动换行
- **WHEN** 句子超过 maxWidth
- **THEN** 自动在空格或词边界换行，返回的 height 等于 `行数 * lineHeight`

#### Scenario: 性能要求
- **WHEN** 一次性测量 15 条 quote
- **THEN** 全部测量在 100ms 内完成，且不会触发 DOM 重排

### Requirement: 阿基米德螺旋线布局
系统 SHALL 将 quote 按 `weight` 降序排列，最大权重的 quote 居中放置。  
系统 MUST 从画布中心 `(cx, cy)` 出发，沿阿基米德螺旋线 `x = cx + r*cos(θ), y = cy + r*sin(θ)` 步进（r = a + b*θ，a、b 为常数）。  
在每个候选点上 MUST 进行 AABB 矩形碰撞检测：候选句子的包围盒不能与任何已放置句子的包围盒相交。  
一旦找到第一个不重叠的位置，系统 SHALL 锁定该坐标并继续下一个句子。  
所有句子位置计算完毕后，系统 SHALL 一次性以 `position: absolute; left/top` 渲染到画板。

#### Scenario: 紧密穿插无重叠
- **WHEN** 15 条 quote 全部排版完成
- **THEN** 任意两条 quote 的包围盒不发生交叉，且整体呈现"见缝插针"的视觉密度

#### Scenario: 权重决定字号与优先级
- **WHEN** weight=3 的金句
- **THEN** 字号最大，且优先占据中心位置；weight=1 的普通句子字号最小，分布在外围

### Requirement: 画板比例与等比缩放
系统 SHALL 提供一个"画板容器" `.paper-canvas`，其 `aspect-ratio` 与当前纸张设置完全一致（A4 portrait ≈ 1:1.414，A3 portrait ≈ 1:1.414，Letter portrait ≈ 8.5:11，16:9 Screen）。  
系统 MUST 在布局完成后计算所有已放置句子的总体包围盒（minX, minY, maxX, maxY），得出整体宽高。  
系统 MUST 计算缩放系数 `scale = min(canvasW / contentW, canvasH / contentH) * paddingRatio`，使用 `transform: scale(scale)` 将内容居中，确保无裁剪且白边最小。

#### Scenario: A4 竖版
- **WHEN** 选择 A4 + Portrait
- **THEN** 画板容器的宽高比为 1:1.414，句子云内容被等比缩放并居中

#### Scenario: 切换纸张
- **WHEN** 用户从 A4 Portrait 切换到 16:9 Landscape
- **THEN** 画板宽高比实时变化，内容自动重新缩放并居中

### Requirement: 控制面板与打印
系统 SHALL 提供极简控制面板，包含：
- 纸张尺寸下拉：A4 / A3 / Letter / 16:9 Screen
- 方向切换：Portrait / Landscape
- 作者显隐开关
- 一键打印按钮（调用 `window.print()`）

点击打印时，系统 SHALL 通过 JS 动态注入 `<style>`，包含：
```css
@page { size: <paper> <orientation>; margin: 0; }
```
打印时背景 MUST 强制为 `white`，文字 MUST 强制为 `black / #1a1a1a`，移除 `box-shadow`、`filter: blur`、隐藏控制面板。

#### Scenario: 打印 A4 竖版海报
- **WHEN** 用户点击「Print Poster」
- **THEN** 浏览器打印对话框显示 A4 竖版、0 边距、海报纯白底 + 黑色文字

### Requirement: Hover 聚焦交互
系统 SHALL 监听每个 quote 元素的 `mouseenter` / `mouseleave`。  
当某条 quote 被悬停时：
- 该 quote 轻微放大（`transform: scale(1.05)`）并色彩高亮。
- 其他所有 quote 应用 `opacity: 0.25; filter: blur(3px); transition`。

#### Scenario: Hover 聚焦
- **WHEN** 鼠标悬停到第 5 条 quote
- **THEN** 第 5 条放大高亮，其他 14 条变暗并模糊

### Requirement: 作者显示策略
系统 SHALL 维护一个全局 `showAuthor` 状态（默认 `false`）。  
- 当 `showAuthor === true` 时，所有 quote 旁显示 `author`。  
- 当 `showAuthor === false` 时，仅在 Hover 某条 quote 时临时显示其作者。  
- 作者的出现 MUST 伴随平滑的淡入过渡（`opacity` 0→1, ~200ms）。

#### Scenario: 默认隐藏作者
- **WHEN** `showAuthor = false` 且无 Hover
- **THEN** 页面不显示任何作者信息

#### Scenario: Hover 单条显示作者
- **WHEN** 鼠标悬停到某条 quote
- **THEN** 该 quote 末尾或下方的 author 元素淡入显示

## MODIFIED Requirements
（无既有 spec 受影响）

## REMOVED Requirements
（无）
