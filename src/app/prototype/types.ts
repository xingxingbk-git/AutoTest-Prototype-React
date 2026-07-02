export type ResultStatus = "pass" | "fail" | "warn" | "running" | "pending";
export type CasePhase = "pre_test" | "test" | "post_test";

export interface CaseItem {
  id: string;
  phase: CasePhase;
  name: string;
  description?: string;
  type: string;
  enabled: boolean;
  timeout: number;
  config?: string;
  retry?: boolean;
  continueOnFail?: boolean;
}

export interface TestCase {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  dataSource: string;
  taskType: "FULL" | "REALTIME" | "FULL_REALTIME";
  tags: string[];
  enabled: boolean;
  smoke: boolean;
  taskName?: string;
  result: ResultStatus;
  items: CaseItem[];
}

export interface Environment {
  id: string;
  name: string;
  role: "source" | "target";
  status: "healthy" | "warning" | "offline";
  detail: string;
}

export interface TestTask {
  id: string;
  code: string;
  name: string;
  description: string;
  caseIds: string[];
  sourceEnvironmentId: string;
  environmentIds: string[];
  enabled: boolean;
  concurrency: number;
  failFast: boolean;
  lastRunId?: string;
}

export interface RunResult {
  caseId: string;
  caseName: string;
  environmentId: string;
  environmentName: string;
  status: ResultStatus;
  phase: string;
  reason: string;
  delay: string;
}

export interface TaskRun {
  id: string;
  taskId: string;
  taskCode: string;
  taskName: string;
  startedAt: string;
  duration: string;
  status: ResultStatus;
  progress: number;
  snapshot: Pick<TestTask, "name" | "caseIds" | "environmentIds" | "concurrency" | "failFast">;
  results: RunResult[];
}

export interface Activity {
  id: string;
  level: "info" | "success" | "warning" | "error";
  text: string;
  time: string;
}

export interface PrototypeState {
  cases: TestCase[];
  tasks: TestTask[];
  environments: Environment[];
  taskRuns: TaskRun[];
  activities: Activity[];
  updatedAt: string;
}
