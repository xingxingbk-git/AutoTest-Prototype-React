import { ArrowRight, FilePlus2, Play, Plus, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { PageHeader, Panel, StatusBadge } from "../../components/prototype/Primitives";
import { dashboardMetrics, recentFailures } from "../../prototype/selectors";
import { usePrototype } from "../../prototype/store";

export function DashboardPage() {
  const { state } = usePrototype();
  const navigate = useNavigate();
  const metrics = dashboardMetrics(state);
  const failures = recentFailures(state);
  const running = state.taskRuns.filter((run) => run.status === "running");
  return <div className="page">
    <PageHeader title="自动化测试工作台" subtitle={`最后更新：${state.updatedAt}　数据由本地原型实时计算`} actions={<><button className="btn"><RefreshCw size={14} />刷新</button><button className="btn primary" onClick={() => navigate("/tasks")}><Play size={14} />执行任务</button></>} />
    <div className="metrics">
      <Metric label="启用用例" value={metrics.enabledCases} foot={`共 ${state.cases.length} 个用例`} />
      <Metric label="测试任务" value={metrics.tasks} foot={`${state.tasks.filter(t => t.enabled).length} 个已启用`} />
      <Metric label="最近通过率" value={`${metrics.passRate}%`} foot="基于最近运行结果" tone="positive" />
      <Metric label="异常环境" value={metrics.abnormalEnvironments} foot="测试环境 B" tone="warning" />
    </div>
    <div className="dashboard-grid">
      <div className="stack">
        <Panel title="运行中的测试任务" action={<Link className="text-link" to="/tasks">查看全部 <ArrowRight size={13} /></Link>}>
          <div className="table-wrap"><table><thead><tr><th>任务编码</th><th>任务名称</th><th>执行进度</th><th>状态</th><th>开始时间</th></tr></thead><tbody>
            {running.map(run => <tr key={run.id}><td><Link className="code-link" to={`/tasks/${run.taskId}`}>{run.taskCode}</Link></td><td>{run.taskName}</td><td><span className="progress"><b style={{ width: `${run.progress}%` }} /></span>{run.progress}%</td><td><StatusBadge status="running">运行中</StatusBadge></td><td>{run.startedAt.slice(11)}</td></tr>)}
          </tbody></table></div>
        </Panel>
        <Panel title="最近失败">
          <div className="table-wrap"><table><thead><tr><th>用例</th><th>环境</th><th>失败阶段</th><th>失败原因</th><th>任务</th></tr></thead><tbody>
            {failures.map((item, index) => <tr key={`${item.runId}-${index}`}><td>{item.caseName}</td><td>{item.environmentName}</td><td>{item.phase}</td><td className={item.status === "fail" ? "negative" : "warning"}>{item.reason}</td><td><Link className="text-link" to={`/tasks/${item.taskId}`}>{item.taskName}</Link></td></tr>)}
          </tbody></table></div>
        </Panel>
      </div>
      <aside className="stack">
        <Panel title="环境健康状态"><div className="panel-body">{state.environments.map(env => <div className="health" key={env.id}><span><b>{env.name}</b><small>{env.detail}</small></span><StatusBadge status={env.status === "healthy" ? "pass" : "warn"}>{env.status === "healthy" ? "正常" : "环境异常"}</StatusBadge></div>)}</div></Panel>
        <Panel title="快捷操作"><div className="quick-grid"><Link className="quick" to="/cases/new"><FilePlus2 /><span><b>新建用例</b><small>编排三阶段动作</small></span></Link><Link className="quick" to="/tasks/new"><Plus /><span><b>新建任务</b><small>选择用例与环境</small></span></Link><Link className="quick" to="/tasks"><Play /><span><b>执行任务</b><small>查看任务列表</small></span></Link></div></Panel>
        <Panel title="系统动态"><ul className="activity-list">{state.activities.map(item => <li key={item.id}><i className={item.level} /><span>{item.text}</span><time>{item.time}</time></li>)}</ul></Panel>
      </aside>
    </div>
  </div>;
}

function Metric({ label, value, foot, tone = "" }: { label: string; value: string | number; foot: string; tone?: string }) {
  return <div className="metric"><span>{label}</span><b className={tone}>{value}</b><small>{foot}</small></div>;
}
