import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { seedState } from "./seed";
import { loadPrototypeState, savePrototypeState } from "./storage";
import type { PrototypeState, TestCase, TestTask } from "./types";

type Action =
  | { type: "saveCase"; value: TestCase }
  | { type: "deleteCase"; id: string }
  | { type: "toggleCases"; ids: string[]; enabled: boolean }
  | { type: "saveTask"; value: TestTask }
  | { type: "deleteTask"; id: string }
  | { type: "runTask"; id: string }
  | { type: "reset" };

function reducer(state: PrototypeState, action: Action): PrototypeState {
  const now = new Date().toLocaleString("zh-CN", { hour12: false }).replaceAll("/", "-");
  if (action.type === "reset") return structuredClone(seedState);
  if (action.type === "saveCase") {
    const exists = state.cases.some((item) => item.id === action.value.id);
    return { ...state, updatedAt: now, cases: exists ? state.cases.map((item) => item.id === action.value.id ? action.value : item) : [action.value, ...state.cases] };
  }
  if (action.type === "deleteCase") return { ...state, cases: state.cases.filter((item) => item.id !== action.id), tasks: state.tasks.map((task) => ({ ...task, caseIds: task.caseIds.filter((id) => id !== action.id) })) };
  if (action.type === "toggleCases") return { ...state, cases: state.cases.map((item) => action.ids.includes(item.id) ? { ...item, enabled: action.enabled } : item) };
  if (action.type === "saveTask") {
    const exists = state.tasks.some((item) => item.id === action.value.id);
    return { ...state, tasks: exists ? state.tasks.map((item) => item.id === action.value.id ? action.value : item) : [action.value, ...state.tasks] };
  }
  if (action.type === "deleteTask") return { ...state, tasks: state.tasks.filter((item) => item.id !== action.id) };
  if (action.type === "runTask") {
    const task = state.tasks.find((item) => item.id === action.id);
    if (!task) return state;
    const id = `run-${Date.now()}`;
    const results = task.caseIds.flatMap((caseId, ci) => {
      const testCase = state.cases.find((item) => item.id === caseId);
      return task.environmentIds.map((environmentId, ei) => {
        const environment = state.environments.find((item) => item.id === environmentId);
        const status = (ci + ei) % 5 === 4 ? "fail" : environment?.status === "warning" ? "warn" : "pass";
        return { caseId, caseName: testCase?.name || caseId, environmentId, environmentName: environment?.name || environmentId, status: status as "pass" | "fail" | "warn", phase: status === "fail" ? "TEST 比对" : status === "warn" ? "WAIT_SYNC" : "POST_TEST", reason: status === "fail" ? "目标表行数不一致" : status === "warn" ? "同步延迟超过阈值" : "-", delay: status === "warn" ? "1820ms" : status === "pass" ? "48ms" : "—" };
      });
    });
    const run = { id, taskId: task.id, taskCode: task.code, taskName: task.name, startedAt: now, duration: "刚刚", status: "running" as const, progress: 42, snapshot: { name: task.name, caseIds: [...task.caseIds], environmentIds: [...task.environmentIds], concurrency: task.concurrency, failFast: task.failFast }, results };
    return { ...state, taskRuns: [run, ...state.taskRuns], tasks: state.tasks.map((item) => item.id === task.id ? { ...item, lastRunId: id } : item), activities: [{ id: `activity-${Date.now()}`, level: "info", text: `${task.name}已开始执行`, time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) }, ...state.activities] };
  }
  return state;
}

const StoreContext = createContext<{ state: PrototypeState; dispatch: React.Dispatch<Action> } | null>(null);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPrototypeState);
  useEffect(() => savePrototypeState(state), [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePrototype() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("usePrototype must be used inside PrototypeProvider");
  return value;
}
