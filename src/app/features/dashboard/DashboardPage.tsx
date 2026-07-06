import { ArrowRight, FilePlus2, Play, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { PageHeader, Panel, StatusBadge } from "../../components/prototype/Primitives";
import { dashboardMetrics, recentFailures } from "../../prototype/selectors";
import { usePrototype } from "../../prototype/store";

export function DashboardPage() {
  const { state } = usePrototype();
  const metrics = dashboardMetrics(state);
  const failures = recentFailures(state);
  const running = state.taskRuns.filter((run) => run.status === "running");
  const latestRun = state.taskRuns[0];

  return (
    <div className="page dashboard-page-v2">
      <PageHeader
        title="自动化测试工作台"
        subtitle={`统一呈现测试任务状态、质量风险和待处理事项 · 更新于 ${state.updatedAt}`}
        actions={
          <>
            <button className="btn"><RefreshCw size={14} />刷新</button>
            <Link className="btn" aria-label="新建用例" to="/cases/new"><FilePlus2 size={14} />新建用例</Link>
            <Link className="btn" aria-label="新建任务" to="/tasks/new"><Plus size={14} />新建任务</Link>
            <Link className="btn primary" aria-label="执行任务" to="/tasks"><Play size={14} />执行任务</Link>
          </>
        }
      />

      <div className="metrics dashboard-metrics-v2">
        <Metric label="启用测试用例" value={metrics.enabledCases} foot={`共 ${state.cases.length} 个`} />
        <Metric label="测试任务" value={metrics.tasks} foot={`${running.length || 2} 正在执行`} />
        <Metric label="最近执行通过率" value={`${metrics.passRate}%`} foot="较昨日 +5%" tone="positive" />
        <Metric label="异常环境" value={metrics.abnormalEnvironments} foot="需及时处理" tone="warning" />
      </div>

      <div className="dashboard-content-v2">
        <div className="dashboard-primary-v2">
          <Panel title="正在执行的测试任务" action={<Link className="text-link" to="/tasks">查看全部 <ArrowRight size={13} /></Link>}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>任务</th><th>用例进度</th><th>执行环境</th><th>开始时间</th><th>状态</th></tr></thead>
                <tbody>
                  {running.map((run) => (
                    <tr key={run.id}>
                      <td><Link className="code-link" to={`/tasks/${run.taskId}`}>{run.taskName}</Link><small>{run.taskCode}</small></td>
                      <td><span className="progress"><b style={{ width: `${run.progress}%` }} /></span>{run.progress}%</td>
                      <td>预发环境、测试环境 A</td>
                      <td>{run.startedAt}</td>
                      <td><StatusBadge status="running">运行中</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="最近一次任务执行结果" action={latestRun ? <Link className="text-link" to={`/tasks/${latestRun.taskId}`}>查看详情 <ArrowRight size={13} /></Link> : null}>
            <div className="latest-run-v2">
              <div className="latest-run-summary-v2">
                <span><small>任务名称</small><b>{latestRun?.taskName || "每日核心测试"}</b></span>
                <span><small>执行时间</small><b>{latestRun?.startedAt || "2026-06-24 16:02"}</b></span>
                <span><small>用例实例</small><b>2</b></span>
                <span><small>监控实例</small><b>6</b></span>
              </div>
              <div className="latest-result-bars-v2">
                <span><i className="pass" style={{ width: "50%" }} /></span>
                <p><b className="positive">通过 1</b><b className="negative">未通过 1</b><b className="muted">未执行 0</b></p>
              </div>
            </div>
          </Panel>

          <Panel title="最近失败记录">
            <div className="table-wrap">
              <table>
                <thead><tr><th>发生时间</th><th>任务 / 用例</th><th>环境</th><th>失败原因</th><th>操作</th></tr></thead>
                <tbody>
                  {failures.map((item, index) => (
                    <tr key={`${item.runId}-${index}`}>
                      <td>2026-06-24 {index ? "14:36" : "16:02"}</td>
                      <td><b>{item.taskName}</b><small>{item.caseName}</small></td>
                      <td>{item.environmentName}</td>
                      <td className={item.status === "fail" ? "negative" : "warning"}>{item.reason}</td>
                      <td><Link className="text-link" to={`/tasks/${item.taskId}`}>查看</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <aside className="dashboard-aside-v2">
          <Panel title="环境健康状态">
            <div className="panel-body">
              {state.environments.filter((environment) => environment.role === "target").map((environment) => (
                <div className="health" key={environment.id}>
                  <span><b>{environment.name}</b><small>{environment.detail}</small></span>
                  <StatusBadge status={environment.status === "healthy" ? "pass" : "warn"}>{environment.status === "healthy" ? "正常" : "异常"}</StatusBadge>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="系统动态">
            <ul className="activity-list">
              {state.activities.map((item) => <li key={item.id}><i className={item.level} /><span>{item.text}</span><time>{item.time}</time></li>)}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, foot, tone = "" }: { label: string; value: string | number; foot: string; tone?: string }) {
  return <div className="metric"><span>{label}</span><b className={tone}>{value}</b><small>{foot}</small></div>;
}
