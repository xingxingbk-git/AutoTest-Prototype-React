import type { PrototypeState } from "./types";

const items = (prefix: string) => [
  { id: `${prefix}-pre-create`, phase: "pre_test" as const, name: "重建测试表", type: "create", enabled: true, timeout: 30000, config: "table_task_001", retry: false, continueOnFail: false },
  { id: `${prefix}-pre-truncate`, phase: "pre_test" as const, name: "清空测试表", type: "truncate", enabled: true, timeout: 15000, config: "table_task_001", retry: false, continueOnFail: false },
  { id: `${prefix}-pre-sql`, phase: "pre_test" as const, name: "插入基线数据", type: "custom_sql", enabled: true, timeout: 30000, config: "INSERT INTO AUTOTEST_ORDER(ID, STATUS) VALUES (1, 'INIT');", retry: false, continueOnFail: false },
  { id: `${prefix}-test-task`, phase: "test" as const, name: "校验同步任务", type: "check_task", enabled: true, timeout: 60000, retry: true, continueOnFail: false },
  { id: `${prefix}-test-sql`, phase: "test" as const, name: "校验目标数据", type: "custom_sql", enabled: true, timeout: 30000, config: "SELECT ID, STATUS FROM AUTOTEST_ORDER WHERE ID = 1;", retry: true, continueOnFail: false },
];

export const seedState: PrototypeState = {
  updatedAt: "2026-07-02 09:30:00",
  cases: [
    { id: "case-1", code: "CDC_INSERT_001", name: "Oracle 插入实时同步", description: "验证 Oracle CDC 实时写入的正确性和完整性", category: "CDC同步", dataSource: "Oracle", taskType: "REALTIME", tags: ["基础", "冒烟"], enabled: true, smoke: true, result: "pass", items: items("1") },
    { id: "case-2", code: "DDL_ADD_COL_001", name: "DDL 新增字段同步", description: "验证 MySQL DDL 新增字段后结构变更的同步结果", category: "DDL同步", dataSource: "MySQL", taskType: "FULL_REALTIME", tags: ["基础", "DDL"], enabled: true, smoke: true, result: "warn", items: items("2") },
    { id: "case-3", code: "RULE_FILTER_001", name: "全局规则字段过滤", description: "—", category: "全局规则", dataSource: "PostgreSQL", taskType: "REALTIME", tags: ["基础"], enabled: false, smoke: false, result: "pass", items: items("3") },
    { id: "case-4", code: "EXCEPTION_RETRY_001", name: "异常恢复与重试", description: "—", category: "异常场景", dataSource: "", taskType: "REALTIME", tags: ["异常恢复"], enabled: true, smoke: false, result: "fail", items: items("4") },
  ],
  environments: [
    { id: "env-source", name: "生产库（源）", role: "source", status: "healthy", detail: "连接正常 · MySQL 8.0" },
    { id: "env-a", name: "测试环境 A", role: "target", status: "healthy", detail: "最近检测 09:28" },
    { id: "env-b", name: "测试环境 B", role: "target", status: "warning", detail: "同步延迟 1.8s" },
    { id: "env-c", name: "预发环境", role: "target", status: "healthy", detail: "最近检测 09:27" },
  ],
  tasks: [
    { id: "task-1", code: "TASK-20260702-001", name: "订单同步回归任务", description: "覆盖订单新增、状态变更与库存同步核心链路", caseIds: ["case-1", "case-2", "case-4"], sourceEnvironmentId: "env-source", environmentIds: ["env-a", "env-b", "env-c"], enabled: true, concurrency: 3, failFast: false, lastRunId: "run-1" },
    { id: "task-2", code: "TASK-20260702-002", name: "DDL 兼容性验证任务", description: "验证多种数据源的 DDL 变更同步", caseIds: ["case-3"], sourceEnvironmentId: "env-source", environmentIds: ["env-a", "env-c"], enabled: true, concurrency: 2, failFast: true, lastRunId: "run-2" },
    { id: "task-3", code: "TASK-20260702-003", name: "异常恢复专项任务", description: "异常恢复及重试链路验证", caseIds: ["case-4"], sourceEnvironmentId: "env-source", environmentIds: ["env-b"], enabled: false, concurrency: 1, failFast: false },
  ],
  taskRuns: [
    {
      id: "run-1", taskId: "task-1", taskCode: "TASK-20260702-001", taskName: "订单同步回归任务", startedAt: "2026-07-02 09:18:32", duration: "12分18秒", status: "running", progress: 68,
      snapshot: { name: "订单同步回归任务", caseIds: ["case-1", "case-2", "case-4"], environmentIds: ["env-a", "env-b", "env-c"], concurrency: 3, failFast: false },
      results: [
        { caseId: "case-1", caseName: "订单新增同步", environmentId: "env-a", environmentName: "测试环境 A", status: "pass", phase: "TEST", reason: "-", delay: "42ms" },
        { caseId: "case-2", caseName: "订单状态变更", environmentId: "env-b", environmentName: "测试环境 B", status: "warn", phase: "WAIT_SYNC", reason: "同步延迟超过阈值", delay: "1860ms" },
        { caseId: "case-4", caseName: "库存扣减同步", environmentId: "env-c", environmentName: "预发环境", status: "fail", phase: "TEST 比对", reason: "目标表行数不一致", delay: "—" },
      ],
    },
    {
      id: "run-2", taskId: "task-2", taskCode: "TASK-20260702-002", taskName: "DDL 兼容性验证任务", startedAt: "2026-07-02 08:47:11", duration: "8分04秒", status: "pass", progress: 100,
      snapshot: { name: "DDL 兼容性验证任务", caseIds: ["case-3"], environmentIds: ["env-a", "env-c"], concurrency: 2, failFast: true },
      results: [{ caseId: "case-3", caseName: "新增字段同步", environmentId: "env-a", environmentName: "测试环境 A", status: "pass", phase: "POST_TEST", reason: "-", delay: "36ms" }],
    },
  ],
  activities: [
    { id: "a1", level: "info", text: "订单同步回归任务已开始执行", time: "09:18" },
    { id: "a2", level: "warning", text: "测试环境 B 同步延迟超过阈值", time: "09:12" },
    { id: "a3", level: "success", text: "DDL 兼容性验证任务执行完成", time: "08:55" },
    { id: "a4", level: "error", text: "库存扣减同步比对失败", time: "08:42" },
  ],
};
