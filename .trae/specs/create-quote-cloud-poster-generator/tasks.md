# Tasks

- [x] Task 1: 搭建 HTML 骨架与基础样式
  - [x] SubTask 1.1: 引入 OpenRouter API Key 占位、内置初始 Quote 数组、字体引入
  - [x] SubTask 1.2: 定义主视图布局：屏幕中央画板容器 + 右上角浮动控制面板
  - [x] SubTask 1.3: 设计屏幕态深色系排版基础样式（字体、配色、动画 transition）

- [x] Task 2: 实现 Canvas 多行文本测量
  - [x] SubTask 2.1: 创建离屏 `<canvas>` 实例，封装 `measureMultilineText(text, fontSize, fontWeight, maxWidth)` 返回 `[width, height]`
  - [x] SubTask 2.2: 按 `weight` 映射 fontSize 与 maxWidth（weight 3 → 最大字号 + 较宽 maxWidth）

- [x] Task 3: 实现阿基米德螺旋线 + AABB 碰撞布局
  - [x] SubTask 3.1: 将 quote 按 weight 降序排序，最大权重居中
  - [x] SubTask 3.2: 沿螺旋线步进候选点，依次检测 AABB 碰撞，锁定第一个不重叠位置
  - [x] SubTask 3.3: 全部计算完成后一次性以 `position: absolute` 渲染到画板

- [x] Task 4: 画板比例与等比缩放
  - [x] SubTask 4.1: 维护纸张配置（size × orientation），动态计算 `aspect-ratio`
  - [x] SubTask 4.2: 计算内容包围盒，得出 `scale` 系数，使用 `transform: scale()` + `transform-origin: center` 居中
  - [x] SubTask 4.3: 监听纸张切换 / 窗口 resize，触发重新计算

- [x] Task 5: 控制面板与打印管线
  - [x] SubTask 5.1: 实现纸张下拉、方向切换、作者开关、Print 按钮 UI 与状态
  - [x] SubTask 5.2: 实现 `@media print` 样式：动态注入 `@page` 规则，强制白底纯黑，隐藏控制面板，移除阴影/模糊

- [x] Task 6: Hover 聚焦与作者淡入交互
  - [x] SubTask 6.1: 监听 `mouseenter/mouseleave`，应用聚焦/失焦样式
  - [x] SubTask 6.2: 根据 `showAuthor` 状态与 Hover 状态控制 author 元素的淡入

- [x] Task 7: AI 权重请求 + 容错
  - [x] SubTask 7.1: 编写 `fetchWeights(quotes)` 调用 OpenRouter（`google/gemini-flash-1.5`），按规格 prompt 发送请求
  - [x] SubTask 7.2: 解析返回 JSON（剥离 markdown 标记），失败时回退本地启发式评分
  - [x] SubTask 7.3: Loading 状态展示（覆盖在画板上的优雅 spinner / 渐显）

- [x] Task 8: 集成验证
  - [x] SubTask 8.1: 打开页面，确认 Loading → 渲染完整流程
  - [x] SubTask 8.2: 切换纸张 / 方向，验证画板比例与缩放正确
  - [x] SubTask 8.3: 触发 Print，验证打印预览为白底黑字、控制面板隐藏

# Task Dependencies
- Task 3 依赖 Task 2（需要 measure 函数得到 [w,h]）
- Task 4 依赖 Task 3（需要已计算的坐标）
- Task 6 依赖 Task 3（需要已渲染的 DOM 元素）
- Task 7 独立，可与 Task 1 并行
- Task 8 依赖所有前置任务
