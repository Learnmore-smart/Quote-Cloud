# Tasks

- [x] Task 1: 项目基础设施迁移（Vite + React + Pretext）
  - [x] SubTask 1.1: 安装依赖：`react`, `react-dom`, `@types/react`, `@types/react-dom`, `@chenglou/pretext`
  - [x] SubTask 1.2: 更新 `tsconfig.json`：添加 `"jsx": "react-jsx"` 配置
  - [x] SubTask 1.3: 更新 `vite.config.ts`：添加 React 插件（`@vitejs/plugin-react`）
  - [x] SubTask 1.4: 更新 `index.html`：确认 `#app` 挂载点，移除旧的字体引入（改由组件内引入）

- [x] Task 2: 类型定义与数据层迁移
  - [x] SubTask 2.1: 重写 `src/types.ts`：保留 `Quote`, `PaperKey`, `Orientation`, `PaperSize`；移除 `MeasuredQuote`；更新 `PlacedQuote`（扁平字段）
  - [x] SubTask 2.2: 迁移 `src/seed.ts`：保持不变（15 条初始 quote 数组）
  - [x] SubTask 2.3: 迁移 `src/config.ts`：保留 `PAPER_SIZES`, `PAPER_PAGE`, `OPENROUTER_API_KEY`
  - [x] SubTask 2.4: 迁移 `src/weights.ts`：保留 `fetchWeights`, `localHeuristicWeights`, `extractJsonArray`，确保类型兼容

- [x] Task 3: 实现 Pretext 文本测量模块
  - [x] SubTask 3.1: 创建 `src/measure.ts`：实现 `prepareQuotes(quotes, baseFontSize)` 函数，对每条 quote 调用 `prepareWithSegments(text, fontString)` 返回 prepared handle
  - [x] SubTask 3.2: 实现 `measureQuote(prepared, maxWidth, lineHeight)` 函数，调用 `layout` + `layoutWithLines` 返回 `{ width, height, lineCount }`
  - [x] SubTask 3.3: 实现 `getQuoteLines(prepared, maxWidth)` 函数，使用 `layoutWithLines` 提取每行文本内容

- [x] Task 4: 实现迭代字体缩放布局算法
  - [x] SubTask 4.1: 创建 `src/layout.ts`：实现 `iterativeFitLayout(quotes, canvasW, canvasH)` 函数
  - [x] SubTask 4.2: 实现字号映射：`baseFontSize` 起始 20px，w3=1.5x, w2=1.0x, w1=0.7x；maxWidth 按比例缩放
  - [x] SubTask 4.3: 实现迭代循环：溢出 ×0.9，填充不足 80% ×1.1，最多 10 轮
  - [x] SubTask 4.4: 实现阿基米德螺旋线定位 + AABB 碰撞检测（padding=12px）
  - [x] SubTask 4.5: 返回最终 `PlacedQuote[]`（含精确字号和坐标）

- [x] Task 5: React 组件实现
  - [x] SubTask 5.1: 创建 `src/App.tsx`：顶层状态管理（paper, orientation, showAuthor, quotes, placed, loading），组合子组件
  - [x] SubTask 5.2: 创建 `src/components/ControlPanel.tsx`：纸张下拉、方向切换、作者开关、Print 按钮
  - [x] SubTask 5.3: 创建 `src/components/PaperCanvas.tsx`：纸张画板容器，根据 designSize 设置 aspect-ratio 和尺寸
  - [x] SubTask 5.4: 创建 `src/components/QuoteItem.tsx`：单条 quote 渲染（absolute 定位，字号/颜色/位置由 props 驱动）
  - [x] SubTask 5.5: 创建 `src/components/Loader.tsx`：加载动画组件

- [x] Task 6: 样式迁移
  - [x] SubTask 6.1: 重写 `src/styles.css`：保留设计 token、纸张画板、quote 样式、控制面板、加载动画、签名
  - [x] SubTask 6.2: 更新 `@media print` 样式：移除 `--print-transform` 相关规则，quote 以实际字号渲染无需缩放
  - [x] SubTask 6.3: 保留 Hover 聚焦交互样式（.focused / .dimmed）

- [x] Task 7: 打印管线适配
  - [x] SubTask 7.1: 迁移 `src/print.ts`：保留 `injectPrintRule`（动态注入 `@page` 规则），移除 `applyPrintScale`
  - [x] SubTask 7.2: 在 React 中实现打印流程：点击 Print → 注入 @page 规则 → `window.print()`

- [x] Task 8: 主入口与集成
  - [x] SubTask 8.1: 重写 `src/main.tsx`：React DOM createRoot 挂载 `<App />`
  - [x] SubTask 8.2: 删除旧文件：`src/main.ts`, `src/render.ts`, `src/params.ts`
  - [x] SubTask 8.3: 验证完整流程：Loading → AI 权重 → 布局 → 渲染 → 交互 → 打印

# Task Dependencies
- Task 2 依赖 Task 1（需要 React + Pretext 依赖安装完成）
- Task 3 依赖 Task 2（需要新类型定义）
- Task 4 依赖 Task 3（需要 Pretext 测量函数）
- Task 5 依赖 Task 4（需要布局算法返回 PlacedQuote）
- Task 6 与 Task 5 可并行
- Task 7 依赖 Task 5（需要 React 组件）
- Task 8 依赖 Task 5, 6, 7（集成所有模块）
