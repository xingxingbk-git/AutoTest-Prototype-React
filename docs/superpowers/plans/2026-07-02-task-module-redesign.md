# 测试任务模块重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按用户提供的十张设计稿重构测试任务列表、新建任务两步流程、任务详情页及相关弹窗交互。

**Architecture:** 保留现有 React Router 路由和原型 Store，将任务模块拆分为列表、编辑器、详情页以及局部弹窗组件。使用现有种子数据派生数据源、用例、环境和运行结果，避免引入后端依赖；模块专属样式集中追加到 `prototype.css`。

**Tech Stack:** React 18、React Router、TypeScript、Lucide React、Vitest、Testing Library、CSS。

---

### Task 1: 锁定关键交互测试

**Files:**
- Create: `src/app/features/tasks/TasksPage.test.tsx`

- [ ] **Step 1: 写任务列表、新建两步流程、详情页签与弹窗的失败测试**
- [ ] **Step 2: 运行 `npm test -- src/app/features/tasks/TasksPage.test.tsx` 并确认因新版界面尚未实现而失败**

### Task 2: 重构任务列表

**Files:**
- Modify: `src/app/features/tasks/TasksPage.tsx`
- Modify: `src/styles/prototype.css`

- [ ] **Step 1: 实现标题、筛选、按选中项显示的批量操作、共享执行源、环境标签和分页**
- [ ] **Step 2: 保留编码进入详情、删除、批量执行和重置交互**
- [ ] **Step 3: 运行目标测试确认列表场景通过**

### Task 3: 实现两步新建/编辑流程

**Files:**
- Modify: `src/app/features/tasks/TasksPage.tsx`
- Modify: `src/styles/prototype.css`

- [ ] **Step 1: 实现基础信息、数据源侧栏和用例配置工作区**
- [ ] **Step 2: 实现添加数据源与配置用例弹窗**
- [ ] **Step 3: 实现环境选择与每个用例的任务映射配置**
- [ ] **Step 4: 运行目标测试确认向导和弹窗场景通过**

### Task 4: 实现任务详情工作台

**Files:**
- Modify: `src/app/features/tasks/TasksPage.tsx`
- Modify: `src/styles/prototype.css`

- [ ] **Step 1: 实现四组统计卡、用例实例、监控实例和统计报告三页签**
- [ ] **Step 2: 实现左侧数据源/环境导航、右侧执行历史和筛选表格**
- [ ] **Step 3: 实现执行参数确认与子项详情弹窗**
- [ ] **Step 4: 运行目标测试确认详情页签和弹窗场景通过**

### Task 5: 完整验证

**Files:**
- Modify: `design-qa.md`

- [ ] **Step 1: 运行 `npm test`**
- [ ] **Step 2: 运行 `npm run build`**
- [ ] **Step 3: 启动或刷新 Vite 服务，确认实时模块与磁盘源码一致**
- [ ] **Step 4: 浏览任务列表、新建流程和任务详情关键状态**
- [ ] **Step 5: 更新 `design-qa.md`，记录对照结果**
