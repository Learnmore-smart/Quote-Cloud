# 迭代字体缩放 + Pretext 重构 Spec

## Why
当前实现使用 Canvas `measureText` 测量文本、`transform: scale()` 缩放内容以适配纸张。这导致打印时文字可能模糊（CSS transform 缩放会降低渲染精度），且无法精确控制"填满纸张"的程度。需要迁移到 `@chenglou/pretext` 进行文本测量，并采用迭代字体缩放算法（动态调整实际字号）来完美适配纸张，同时将项目从 Vanilla TS 迁移到 React。

## What Changes
- **BREAKING**: 将项目从 Vanilla TypeScript 迁移到 Vite + React + TypeScript
- **BREAKING**: 移除 Canvas `measureText` 文本测量，替换为 `@chenglou/pretext` 的 `prepare` + `layout` + `walkLineRanges`
- **BREAKING**: 移除 `transform: scale()` 缩放策略，替换为迭代字体缩放循环（动态调整 `baseFontSize`）
- 碰撞检测 padding 从 6px 增加到 12px
- 字号策略从固定值（64/40/24）改为基于 `baseFontSize` 的乘数（w3=1.5x, w2=1.0x, w1=0.7x）
- `baseFontSize` 起始值为 20px，迭代调整（溢出 ×0.9，填充不足 80% ×1.1），最多 10 轮

## Impact
- Affected specs: `create-quote-cloud-poster-generator`（旧 spec 全部标记完成，本 spec 为架构级重构）
- Affected code: 所有 `src/` 文件将被重写；`package.json` 新增 React + Pretext 依赖；`index.html` 改为 React 挂载点；`tsconfig.json` 增加 JSX 配置

## ADDED Requirements

### Requirement: React 框架迁移
系统 SHALL 使用 Vite + React + TypeScript 构建应用。  
系统 MUST 将所有 UI 逻辑从命令式 DOM 操作迁移到 React 组件模型。  
系统 MUST 保留现有的视觉设计（深色屏幕态、纸张画板、控制面板布局、打印样式）。

#### Scenario: React 挂载
- **WHEN** 页面加载
- **THEN** React 应用挂载到 `#app`，渲染完整 UI

#### Scenario: 状态驱动重渲染
- **WHEN** 用户切换纸张/方向/作者开关
- **THEN** React 状态更新触发重新布局与渲染，无需手动操作 DOM

### Requirement: @chenglou/pretext 文本测量
系统 SHALL 使用 `@chenglou/pretext` 库的 `prepare` + `layout` API 测量多行文本尺寸。  
系统 MUST 对每条 quote 调用 `prepare(text, fontString)` 进行一次性字体分析。  
系统 MUST 调用 `layout(prepared, maxWidth, lineHeight)` 获取精确的 `{ height, lineCount }`。  
系统 MUST 使用 `walkLineRanges` 获取每行文本的范围，用于后续渲染。  
系统 MUST NOT 使用 Canvas `measureText`、`offsetWidth`、`offsetHeight` 或任何 DOM 测量方式。  
`fontString` 格式 MUST 为 `"{fontWeight} {fontSize}px {fontFamily}"`（如 `"700 30px Noto Serif SC"`）。

#### Scenario: 中文长句换行测量
- **WHEN** 一条中文 quote 在给定 maxWidth 下需要换行
- **THEN** `layout()` 返回正确的 height 和 lineCount，`walkLineRanges` 返回每行的起止位置

#### Scenario: 性能
- **WHEN** 15 条 quote 在迭代循环中最多测量 10 轮
- **THEN** 总测量时间 < 50ms（Pretext 的 layout 调用约 0.001ms/次）

### Requirement: 迭代字体缩放算法
系统 SHALL 实现以下自适应拟合算法，不使用 CSS `transform: scale` 缩放内容：

1. **初始化**: `baseFontSize = 20`（单位 px）
2. **字号映射**: weight 3 → `baseFontSize * 1.5`，weight 2 → `baseFontSize * 1.0`，weight 1 → `baseFontSize * 0.7`
3. **布局模拟**: 对当前 `baseFontSize`，使用 Pretext 测量所有 quote 的 `{ width, height }`，运行阿基米德螺旋线 + AABB 碰撞算法计算位置，得出整体包围盒
4. **迭代调整**:
   - 若包围盒溢出纸张边界 → `baseFontSize *= 0.9`，重新模拟
   - 若包围盒面积 < 纸张面积 × 80% → `baseFontSize *= 1.1`，重新模拟
   - 最多迭代 10 轮
5. **最终渲染**: 以最优 `baseFontSize` 的精确字号和坐标渲染 quote，使用 CSS `position: absolute; left; top`

系统 MUST 在每次迭代时重新调用 Pretext 的 `layout()` 重新测量所有 quote（因为字号变了）。  
`prepare()` 调用 MUST 仅在 quote 文本内容变化时执行（字号变化只需重新 `layout()`）。

#### Scenario: 初始字号过大导致溢出
- **WHEN** `baseFontSize = 20` 时所有 quote 的包围盒超出纸张
- **THEN** 系统自动缩小 `baseFontSize`（×0.9），直到包围盒适配纸张或达到 10 轮上限

#### Scenario: 初始字号过小导致填充不足
- **WHEN** 包围盒面积 < 纸张面积 × 80%
- **THEN** 系统自动放大 `baseFontSize`（×1.1），直到填充率 ≥ 80% 或达到 10 轮上限

#### Scenario: 完美适配
- **WHEN** 某轮迭代后包围盒在纸张内且填充率 ≥ 80%
- **THEN** 停止迭代，使用当前 `baseFontSize` 渲染

### Requirement: 12px 碰撞间距
系统 SHALL 在 AABB 碰撞检测中为每个 quote 的包围盒添加 12px 的 padding。  
AABB 重叠判断公式: `!(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom)`  
其中每个 rect 的 left/top/right/bottom 已包含 12px padding。

#### Scenario: 引用之间不接触
- **WHEN** 15 条 quote 全部排版完成
- **THEN** 任意两条 quote 之间的最小间距 ≥ 12px

### Requirement: React 组件结构
系统 SHALL 采用以下组件结构：
- `App` — 顶层状态管理（paper, orientation, showAuthor, quotes, placed）
- `ControlPanel` — 纸张/方向/作者/打印控制
- `PaperCanvas` — 纸张画板容器
- `QuoteItem` — 单条 quote 渲染（absolute 定位）

#### Scenario: 组件职责清晰
- **WHEN** 用户切换纸张
- **THEN** App 更新 state → PaperCanvas 重新计算布局 → QuoteItem 以新坐标/字号渲染

## MODIFIED Requirements

### Requirement: 打印样式（原"控制面板与打印"）
系统 SHALL 保留 `@media print` 样式：隐藏控制面板、白底深灰文字、动态注入 `@page` 规则。  
由于不再使用 `transform: scale()`，打印时无需额外的缩放变换——quote 已以实际字号渲染在纸张设计尺寸内。  
系统 MUST 在打印前动态注入 `<style>` 包含 `@page { size: <paper> <orientation>; margin: 0; }`。

### Requirement: Hover 聚焦交互（原"Hover 聚焦与作者淡入交互"）
系统 SHALL 保留 Hover 聚焦交互：被悬停 quote 轻微放大高亮，其他 quote 变暗模糊。  
由于不再使用 `transform: scale` 做整体缩放，Hover 的 `scale(1.05)` 不会与布局缩放冲突。

### Requirement: AI 权重请求（原"AI 权重分析"）
系统 SHALL 保留 OpenRouter AI 权重请求逻辑，使用 `google/gemini-flash-1.5` 模型。  
API Key 配置 MUST 通过 Vite 环境变量 `VITE_OPENROUTER_API_KEY` 读取。  
请求失败或 Key 缺失时 MUST 回退到本地启发式评分。

## REMOVED Requirements

### Requirement: Canvas 多行文本测量
**Reason**: 被 `@chenglou/pretext` 替代  
**Migration**: 删除 `measure.ts` 中的 `measureMultilineText` 函数，改用 Pretext API

### Requirement: transform: scale 缩放策略
**Reason**: 被迭代字体缩放算法替代  
**Migration**: 删除 `render.ts` 中的 `computeContentTransform` 和 `print.ts` 中的 `applyPrintScale`，不再需要 CSS transform 缩放

### Requirement: 固定字号参数
**Reason**: 被基于 baseFontSize 的动态乘数替代  
**Migration**: 删除 `params.ts` 中的固定 fontSize（64/40/24），改为 baseFontSize × 乘数
