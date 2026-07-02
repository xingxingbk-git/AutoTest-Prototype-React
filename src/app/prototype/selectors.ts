import type { PrototypeState } from "./types";

export function dashboardMetrics(state: PrototypeState) {
  const results = state.taskRuns.flatMap((run) => run.results);
  const passed = results.filter((result) => result.status === "pass").length;
  return {
    enabledCases: state.cases.filter((item) => item.enabled).length,
    tasks: state.tasks.length,
    passRate: results.length ? Math.round((passed / results.length) * 100) : 0,
    abnormalEnvironments: state.environments.filter((env) => env.status !== "healthy").length,
  };
}

export function recentFailures(state: PrototypeState) {
  return state.taskRuns.flatMap((run) =>
    run.results
      .filter((result) => result.status === "fail" || result.status === "warn")
      .map((result) => ({ ...result, runId: run.id, taskId: run.taskId, taskName: run.taskName, startedAt: run.startedAt })),
  );
}
