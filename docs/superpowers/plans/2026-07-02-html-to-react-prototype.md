# 自动化测试原型 React 迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将三套自动化测试 HTML 原型重建为共享数据、可持久化、可交互的 React 原型应用。

**Architecture:** 使用 React Router 组织工作台、测试用例和测试任务页面；使用 Context + reducer 维护统一原型数据并同步至带版本的 localStorage；视觉通过共享 B 端组件和统一 CSS tokens 还原。执行批次降为任务运行记录，不提供独立顶级导航。

**Tech Stack:** React 18、TypeScript、Vite、React Router、Lucide React、Vitest、Testing Library、CSS

---

## 文件结构

- `src/app/App.tsx`：路由装配与顶级 Provider。
- `src/app/layout/AppShell.tsx`：顶部导航、面包屑、全局操作和内容容器。
- `src/app/prototype/types.ts`：用例、任务、环境、运行记录类型。
- `src/app/prototype/seed.ts`：预置演示数据。
- `src/app/prototype/storage.ts`：版本化 localStorage 读写。
- `src/app/prototype/store.tsx`：Context、reducer、动作和业务更新。
- `src/app/components/prototype/*`：页面标题、面板、状态、表格和弹窗等共享组件。
- `src/app/features/dashboard/DashboardPage.tsx`：工作台。
- `src/app/features/cases/*`：用例列表与编辑器。
- `src/app/features/tasks/*`：任务列表、编辑器、详情和执行确认。
- `src/styles/prototype.css`：原型视觉 tokens、布局和响应式规则。
- `src/test/*`：测试环境、存储、派生数据和关键交互测试。

### Task 1: 建立测试与版本化数据层

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/app/prototype/types.ts`
- Create: `src/app/prototype/seed.ts`
- Create: `src/app/prototype/storage.ts`
- Test: `src/app/prototype/storage.test.ts`

- [ ] **Step 1: 写入失败测试**

测试 `loadPrototypeState()` 在无缓存时返回 seed、在版本错误或 JSON 损坏时回退 seed，并验证 `savePrototypeState()` 写入 `{version,data}`。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/app/prototype/storage.test.ts`
Expected: FAIL，原因是 `storage.ts` 尚不存在。

- [ ] **Step 3: 实现最小数据类型、seed 和存储模块**

定义 `PrototypeState`、`TestCase`、`TestTask`、`TaskRun`、`Environment`、`Activity`，实现 `STORAGE_VERSION = 1`、`loadPrototypeState`、`savePrototypeState` 和 `clearPrototypeState`。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `npm test -- src/app/prototype/storage.test.ts`
Expected: PASS。

### Task 2: 建立统一 Store 与派生统计

**Files:**
- Create: `src/app/prototype/selectors.ts`
- Create: `src/app/prototype/store.tsx`
- Test: `src/app/prototype/selectors.test.ts`

- [ ] **Step 1: 写入失败测试**

覆盖启用用例数、任务数、最近通过率、异常环境数、最近失败记录以及任务执行快照不受任务后续编辑影响。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/app/prototype/selectors.test.ts`
Expected: FAIL，原因是 selectors 尚不存在。

- [ ] **Step 3: 实现 selectors、reducer 与持久化 Provider**

Store 提供用例增删改、批量启停、任务增删改、执行任务、推进运行状态、恢复 seed 等动作；派生统计在 render 期间计算，不额外复制到 state。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `npm test -- src/app/prototype/selectors.test.ts`
Expected: PASS。

### Task 3: 建立应用外壳和共享视觉组件

**Files:**
- Modify: `src/app/App.tsx`
- Create: `src/app/layout/AppShell.tsx`
- Create: `src/app/components/prototype/PageHeader.tsx`
- Create: `src/app/components/prototype/Panel.tsx`
- Create: `src/app/components/prototype/StatusBadge.tsx`
- Create: `src/app/components/prototype/ConfirmDialog.tsx`
- Create: `src/styles/prototype.css`
- Modify: `src/styles/index.css`
- Test: `src/app/layout/AppShell.test.tsx`

- [ ] **Step 1: 写入失败测试**

验证三个顶级导航项存在、活动项随路由变化、根路径跳转工作台、恢复预置数据需要确认。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/app/layout/AppShell.test.tsx`
Expected: FAIL，原因是应用外壳尚不存在。

- [ ] **Step 3: 实现路由外壳和视觉 tokens**

还原深色 64px 顶栏、46px 面包屑、浅灰背景、白色面板、紧凑表格和语义状态色。导航只显示工作台、测试用例、测试任务。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `npm test -- src/app/layout/AppShell.test.tsx`
Expected: PASS。

### Task 4: 迁移工作台

**Files:**
- Create: `src/app/features/dashboard/DashboardPage.tsx`
- Test: `src/app/features/dashboard/DashboardPage.test.tsx`

- [ ] **Step 1: 写入失败测试**

验证四项任务化指标、运行任务、最近失败、环境健康、快捷操作和系统动态；点击任务编码进入 `/tasks/:taskId`。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/app/features/dashboard/DashboardPage.test.tsx`
Expected: FAIL，原因是工作台尚不存在。

- [ ] **Step 3: 实现工作台页面**

所有数字从 selectors 派生，不显示“执行批次”顶级入口或批次中心文案。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `npm test -- src/app/features/dashboard/DashboardPage.test.tsx`
Expected: PASS。

### Task 5: 迁移测试用例

**Files:**
- Create: `src/app/features/cases/CasesPage.tsx`
- Create: `src/app/features/cases/CaseEditorPage.tsx`
- Create: `src/app/features/cases/CaseItemEditor.tsx`
- Test: `src/app/features/cases/CasesPage.test.tsx`

- [ ] **Step 1: 写入失败测试**

验证搜索筛选、批量启停、新建用例、编辑基本信息、三阶段子项增删改和保存后刷新持久化。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/app/features/cases/CasesPage.test.tsx`
Expected: FAIL，原因是用例页面尚不存在。

- [ ] **Step 3: 实现用例列表与编辑器**

列表沿用原 HTML 的列、筛选项和状态；编辑器以三个阶段列组织子项，支持阶段内上移/下移代替脆弱的原生拖拽脚本。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `npm test -- src/app/features/cases/CasesPage.test.tsx`
Expected: PASS。

### Task 6: 迁移测试任务与执行详情

**Files:**
- Create: `src/app/features/tasks/TasksPage.tsx`
- Create: `src/app/features/tasks/TaskEditorPage.tsx`
- Create: `src/app/features/tasks/TaskDetailPage.tsx`
- Create: `src/app/features/tasks/RunTaskDialog.tsx`
- Test: `src/app/features/tasks/TasksPage.test.tsx`

- [ ] **Step 1: 写入失败测试**

验证任务新建/编辑、关联用例和环境、执行确认、运行记录生成、详情页三个结果视图、失败历史始终可见。

- [ ] **Step 2: 运行测试并确认 RED**

Run: `npm test -- src/app/features/tasks/TasksPage.test.tsx`
Expected: FAIL，原因是任务页面尚不存在。

- [ ] **Step 3: 实现任务列表、编辑器、执行与详情**

执行时保存不可变快照并生成确定性演示结果；任务详情提供用例实例、监控明细、统计报告和设置，运行记录仅作为任务内部数据。

- [ ] **Step 4: 运行测试并确认 GREEN**

Run: `npm test -- src/app/features/tasks/TasksPage.test.tsx`
Expected: PASS。

### Task 7: 集成、响应式和浏览器验收

**Files:**
- Modify: `src/styles/prototype.css`
- Modify: `src/app/App.tsx`
- Test: all `*.test.ts(x)`

- [ ] **Step 1: 运行自动化验证**

Run: `npm test`
Expected: 全部 PASS。

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`
Expected: Vite 构建成功，无 TypeScript 或资源错误。

- [ ] **Step 3: 浏览器验证核心路径**

依次验证工作台定位异常、用例新增与三阶段编辑、任务新增与执行、详情统计、刷新持久化、恢复预置数据。

- [ ] **Step 4: 视觉对照与响应式检查**

在桌面与窄屏视口对照原 HTML，修正顶部导航、首屏密度、表格、字号、间距、状态色、弹窗和横向滚动。

## 执行说明

本目录当前不是 Git 仓库，因此本计划不执行逐任务 commit。每个任务仍保持 RED → GREEN → 全量回归的独立检查点。
