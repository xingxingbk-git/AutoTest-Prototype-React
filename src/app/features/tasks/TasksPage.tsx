import { Edit3, Play, Plus, RefreshCcw, RotateCcw, Trash2, X } from "lucide-react";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePrototype } from "../../prototype/store";
import type { Environment, TestCase, TestTask } from "../../prototype/types";

const sources = [
  { id: "source-mysql", name: "本地MySQL8", type: "MySQL", detail: "192.168.50.83:38080" },
  { id: "source-oracle", name: "oracle19c", type: "Oracle", detail: "192.168.50.84:38080" },
  { id: "source-pg", name: "PostgreSQL", type: "PG", detail: "192.168.50.85:38080" },
];
const sourcePool = [
  ...sources,
  { id: "source-panwei", name: "panweidb", type: "Oracle", detail: "192.168.50.86:38080" },
  { id: "source-center", name: "MySQL 用户中心", type: "MySQL", detail: "192.168.50.87:38080" },
  { id: "source-84", name: "mysql84_node60_3307", type: "MySQL", detail: "192.168.50.88:38080" },
  { id: "source-pg13", name: "pg13_59_5433", type: "PG", detail: "192.168.50.89:38080" },
];

const emptyTask = (): TestTask => ({
  id: `task-${Date.now()}`, code: `TASK-${Date.now().toString().slice(-6)}`, name: "", description: "",
  caseIds: [], sourceEnvironmentId: "source-mysql", environmentIds: [], enabled: true, concurrency: 2, failFast: true,
});

export function TasksPage() {
  const { state, dispatch } = usePrototype();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const rows = state.tasks.filter(task => !query || `${task.code}${task.name}`.toLowerCase().includes(query.toLowerCase()));
  const allSelected = rows.length > 0 && rows.every(task => selected.includes(task.id));

  return <div className="task-list-page">
    <header className="task-page-heading">
      <div><h1>测试任务</h1><p>组合共享执行源、固定用例、监控环境与默认执行参数</p></div>
      <Link className="btn primary" to="/tasks/new"><Plus size={15} />新建任务</Link>
    </header>
    <section className="task-list-card">
      <div className="task-filter-row">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索任务名称" />
        <div className="task-filter-selects">
          <select><option>全部数据源</option><option>MySQL</option><option>Oracle</option></select>
          <select><option>全部用例</option><option>CDC同步</option><option>DDL同步</option></select>
          <select><option>全部监控环境</option><option>预发环境</option><option>测试环境 A</option></select>
          <select><option>全部最近状态</option><option>执行成功</option><option>执行失败</option></select>
          <button className="btn" onClick={() => setQuery("")}><RotateCcw size={15} />重置</button>
        </div>
      </div>
      {selected.length > 0 ? <div className="task-batch-row">
        <label><input type="checkbox" checked={allSelected} onChange={event => setSelected(event.target.checked ? rows.map(row => row.id) : [])} />全部</label>
        <span>已选择 {selected.length} 项</span>
        <button onClick={() => selected.forEach(id => dispatch({ type: "runTask", id }))}>批量执行</button>
        <button className="danger-text">批量停止</button>
      </div> : null}
      <div className="task-table-scroll"><table className="task-table">
        <thead><tr><th className="check-cell"><input aria-label="选择全部任务" type="checkbox" checked={allSelected} onChange={event => setSelected(event.target.checked ? rows.map(row => row.id) : [])} /></th><th>任务编码</th><th>任务名称</th><th>共享执行源</th><th>用例范围</th><th>监控环境</th><th>更新时间</th><th>操作</th></tr></thead>
        <tbody>{rows.map((task, index) => <tr key={task.id}>
          <td className="check-cell"><input aria-label={`选择${task.name}`} type="checkbox" checked={selected.includes(task.id)} onChange={event => setSelected(current => event.target.checked ? [...current, task.id] : current.filter(id => id !== task.id))} /></td>
          <td><Link className="code-link" to={`/tasks/${task.id}`}>{index === 0 ? "TASK_001" : `TASK_00${index + 1}`}</Link></td>
          <td><b>{index === 0 ? "每日核心测试" : index === 1 ? "DDL 专项任务" : task.name}</b><small>{task.description || "订单与异常恢复核心链路每日验证"}</small></td>
          <td><SourceStack compact={index > 0} /></td>
          <td><b>{task.caseIds.length || 1} 个</b> <span className="positive">启用 {Math.max(task.caseIds.length - 1, 1)}</span> <span className="muted">停用 {task.caseIds.length > 1 ? 1 : 0}</span></td>
          <td><div className="tag-row">{task.environmentIds.slice(0, 3).map((id, envIndex) => <span className="tag" key={id}>{envIndex === 0 ? "预发环境" : `测试环境 ${String.fromCharCode(64 + envIndex)}`}</span>)}</div></td>
          <td>{index === 0 ? "2026-06-24 10:21" : "2026-06-23 18:48"}</td>
          <td><div className="row-actions"><Link title="编辑" to={`/tasks/${task.id}/edit`}><Edit3 /></Link><button title="删除" onClick={() => confirm(`确认删除 ${task.name}？`) && dispatch({ type: "deleteTask", id: task.id })}><Trash2 /></button></div></td>
        </tr>)}</tbody>
      </table></div>
      <Pagination />
    </section>
  </div>;
}

function SourceStack({ compact = false }: { compact?: boolean }) {
  return <div className="source-stack">
    <span className="source-icon mysql">My</span>
    {!compact ? <span className="source-name">Oracle 12c</span> : <><span className="source-icon pg">PG</span><span className="source-icon oracle">O</span></>}
  </div>;
}

function Pagination() {
  return <footer className="task-pagination"><span>共100条</span><button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>4</button><button>5</button><span>...</span><button>10</button><button>›</button><select><option>10条/页</option></select></footer>;
}

export function TaskEditorPage() {
  const { taskId } = useParams();
  const { state, dispatch } = usePrototype();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<TestTask>(() => structuredClone(state.tasks.find(task => task.id === taskId) || emptyTask()));
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceIds, setSourceIds] = useState<string[]>(taskId ? sources.map(source => source.id) : []);
  const [activeSource, setActiveSource] = useState("");
  const [modal, setModal] = useState<"source" | "cases" | null>(null);
  const selectedSource = sourcePool.find(source => source.id === activeSource);
  const selectedCases = state.cases.filter(item => draft.caseIds.includes(item.id));
  const save = (event: FormEvent) => { event.preventDefault(); if (!draft.name.trim()) return; dispatch({ type: "saveTask", value: draft }); navigate(`/tasks/${draft.id}`); };

  return <form className="task-editor" onSubmit={save}>
    <div className="task-steps">
      <button type="button" className={step === 1 ? "active" : ""} onClick={() => setStep(1)}><i>1</i>数据源与用例配置</button>
      <button type="button" className={step === 2 ? "active" : ""} onClick={() => draft.name.trim() && setStep(2)}><i>2</i>环境与任务配置</button>
    </div>
    {step === 1 ? <>
      <section className="task-form-card">
        <header><b>基本信息</b><span>任务编号自动生成</span></header>
        <div className="task-basic-form">
          <label>任务名称<input aria-label="任务名称" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="请输入任务名称" /></label>
          <label className="wide">任务描述<input value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="请输入任务描述" /></label>
        </div>
      </section>
      <section className="task-config-card">
        <header>数据源与用例配置</header>
        <div className="task-config-layout">
          <aside className="source-sidebar">
            <div className="source-sidebar-head"><b>数据源</b><button type="button" aria-label="添加数据源" onClick={() => setModal("source")}><Plus /></button><button type="button" className="btn" onClick={() => activeSource && setModal("cases")}>配置用例</button></div>
            {sourceIds.length === 0 ? <div className="source-empty">暂无数据源，请点击“添加”数据源。</div> : sourceIds.map(id => { const source = sourcePool.find(item => item.id === id)!; return <button type="button" className={`source-card ${activeSource === id ? "active" : ""}`} key={id} onClick={() => setActiveSource(id)}><span className={`source-icon ${source.type.toLowerCase()}`}>{source.type.slice(0, 2)}</span><span><b>{source.name}</b><small>用例 {selectedCases.length || 1} 个，启用 {selectedCases.length || 1} 个</small></span></button>; })}
          </aside>
          <div className="source-case-workspace">
            {!selectedSource ? <><header><b>未选择数据源</b><small>请选择左侧数据源查看任务内用例</small></header><div className="workspace-empty">添加数据源后，可在这里查看和启停任务内用例。</div></> :
              <><header><span><b>{selectedSource.name}</b><small>{selectedSource.detail}</small></span><button type="button" onClick={() => setSourceIds(ids => ids.filter(id => id !== selectedSource.id))}>移除数据源</button></header>
              <table><thead><tr><th>用例</th><th>分类</th><th>数据源类型</th><th>任务内状态</th><th>操作</th></tr></thead><tbody>{selectedCases.map(testCase => <tr key={testCase.id}><td><b>{testCase.name}</b><small>{testCase.code}</small></td><td>{testCase.category}</td><td>{testCase.dataSource}</td><td><Switch checked={testCase.enabled} /></td><td><button type="button" onClick={() => setDraft(current => ({ ...current, caseIds: current.caseIds.filter(id => id !== testCase.id) }))}>移除</button></td></tr>)}</tbody></table></>}
          </div>
        </div>
      </section>
    </> : <EnvironmentStep draft={draft} setDraft={setDraft} cases={selectedCases} environments={state.environments} />}
    <footer className="task-editor-footer">
      <button type="button" className="btn" onClick={() => step === 2 ? setStep(1) : navigate("/tasks")}>{step === 2 ? "上一步" : "取消"}</button>
      {step === 1 ? <button type="button" className="btn primary" onClick={() => draft.name.trim() && setStep(2)}>下一步</button> : <button className="btn primary">保存任务</button>}
    </footer>
    {modal === "source" ? <SourceModal selected={sourceIds} onClose={() => setModal(null)} onSave={ids => { setSourceIds(ids); setActiveSource(ids[0] || ""); setModal(null); }} /> : null}
    {modal === "cases" ? <CasesModal cases={state.cases} selected={draft.caseIds} onClose={() => setModal(null)} onSave={ids => { setDraft({ ...draft, caseIds: ids }); setModal(null); }} /> : null}
  </form>;
}

function EnvironmentStep({ draft, setDraft, cases, environments }: { draft: TestTask; setDraft: (task: TestTask) => void; cases: TestCase[]; environments: Environment[] }) {
  const targets = environments.filter(env => env.role === "target");
  const [activeCase, setActiveCase] = useState(cases[0]?.id || "");
  return <section className="environment-card">
    <header>环境与任务配置</header>
    <div className="environment-options">{targets.map((env, index) => <label className={draft.environmentIds.includes(env.id) ? "selected" : ""} key={env.id}><input type="checkbox" checked={draft.environmentIds.includes(env.id)} onChange={event => setDraft({ ...draft, environmentIds: event.target.checked ? [...draft.environmentIds, env.id] : draft.environmentIds.filter(id => id !== env.id) })} /><b>{index === 0 ? "预发环境" : env.name}</b><small>{env.status === "healthy" ? "环境可用" : "环境状态需关注"}</small></label>)}</div>
    <div className="environment-mapping">
      <aside>{cases.map(testCase => <button type="button" key={testCase.id} className={activeCase === testCase.id ? "active" : ""} onClick={() => setActiveCase(testCase.id)}><b>{testCase.name}</b><small>{testCase.dataSource}<span>已配置 {Math.max(draft.environmentIds.length, 0)}/3</span></small></button>)}</aside>
      <div className="mapping-main"><header><b>{cases.find(item => item.id === activeCase)?.name || "请选择用例"}</b><small>约定任务名：oracle_CDC_INSERT_001</small></header>{targets.slice(0, 3).map((env, index) => <div className="mapping-row" key={env.id}><span><b>{index === 0 ? "预发环境 83" : env.name}</b><small>192.168.50.{83 + index}:38080</small></span><select><option>oracle_CDC_INSERT_001--&gt;dm8_p54_5236_dt</option></select><em>唯一匹配</em></div>)}</div>
    </div>
  </section>;
}

function SourceModal({ selected, onClose, onSave }: { selected: string[]; onClose: () => void; onSave: (ids: string[]) => void }) {
  const [ids, setIds] = useState(selected);
  return <Modal title="添加数据源" onClose={onClose} footer={<><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={() => onSave(ids)}>添加</button></>}>
    <label className="modal-select-label">执行环境：<select><option>192.168.50.83:38080</option></select></label>
    <div className="modal-option-list">{sourcePool.map(source => <label key={source.id}><input aria-label={`选择${source.name}`} type="checkbox" checked={ids.includes(source.id)} onChange={event => setIds(current => event.target.checked ? [...current, source.id] : current.filter(id => id !== source.id))} /><b>{source.name}</b><span>通过</span></label>)}</div>
  </Modal>;
}

function CasesModal({ cases, selected, onClose, onSave }: { cases: TestCase[]; selected: string[]; onClose: () => void; onSave: (ids: string[]) => void }) {
  const [ids, setIds] = useState(selected);
  return <Modal title="配置用例" onClose={onClose} footer={<><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={() => onSave(ids)}>保存配置</button></>}>
    <div className="case-modal-list">{cases.filter(item => item.dataSource === "Oracle" || item.id === "case-4").map(testCase => <label key={testCase.id}><input aria-label={`选择${testCase.name}`} type="checkbox" checked={ids.includes(testCase.id)} onChange={event => setIds(current => event.target.checked ? [...current, testCase.id] : current.filter(id => id !== testCase.id))} /><span><b>{testCase.name}</b><small>{testCase.code} · {testCase.category}</small></span><em>{testCase.dataSource || "Oracle"}</em></label>)}</div>
  </Modal>;
}

export function TaskDetailPage() {
  const { taskId } = useParams();
  const { state, dispatch } = usePrototype();
  const [tab, setTab] = useState<"cases" | "monitors" | "report">("cases");
  const [runModal, setRunModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const task = state.tasks.find(item => item.id === taskId);
  const runs = useMemo(() => state.taskRuns.filter(item => item.taskId === taskId), [state.taskRuns, taskId]);
  if (!task) return <div className="task-list-page">测试任务不存在</div>;
  const cases = state.cases.filter(item => task.caseIds.includes(item.id));
  const results = runs[0]?.results || [];

  return <div className="task-detail-page">
    <header className="task-detail-heading"><div><h1>{task.id === "task-1" ? "每日核心测试" : task.name}</h1><p>{task.description || "订单与异常恢复核心链路每日验证"}</p></div><div><Link className="icon-btn" aria-label="编辑任务" to={`/tasks/${task.id}/edit`}><Edit3 /></Link><button className="icon-btn danger" aria-label="删除任务"><Trash2 /></button><button className="icon-btn" aria-label="刷新"><RefreshCcw /></button><button className="btn primary" onClick={() => setRunModal(true)}>开始执行</button></div></header>
    <div className="task-stat-grid">
      <StatCard title="配置统计" unit="用例级" values={[["总数", 3, ""], ["启用数", 2, "positive"], ["禁用数", 1, "muted"]]} />
      <StatCard title="运行统计" unit="用例级" values={[["未执行", 0, "muted"], ["通过", 0, "positive"], ["未通过", 2, "negative"], ["通过率", "0%", "warning"]]} />
      <StatCard title="用例实例统计" unit="用例 × 数据源" values={[["总数", 36, ""], ["启用数", 2, "positive"], ["禁用数", 34, "muted"]]} />
      <StatCard title="用例实例运行" unit="用例 × 数据源" values={[["未执行", 0, "muted"], ["通过", 1, "positive"], ["未通过", 1, "negative"], ["通过率", "50%", "warning"]]} />
    </div>
    <div className="task-detail-layout">
      <section className="task-detail-main">
        <div className="detail-tabs" role="tablist"><button role="tab" aria-selected={tab === "cases"} className={tab === "cases" ? "active" : ""} onClick={() => setTab("cases")}>用例实例</button><button role="tab" aria-selected={tab === "monitors"} className={tab === "monitors" ? "active" : ""} onClick={() => setTab("monitors")}>监控实例</button><button role="tab" aria-selected={tab === "report"} className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}>统计报告</button></div>
        {tab === "cases" ? <CasesDetail cases={cases} onDetail={() => setDetailModal(true)} /> : tab === "monitors" ? <MonitorDetail results={results} /> : <ReportView />}
      </section>
      <HistoryPanel results={results} />
    </div>
    {runModal ? <RunModal onClose={() => setRunModal(false)} onRun={() => { dispatch({ type: "runTask", id: task.id }); setRunModal(false); }} /> : null}
    {detailModal ? <ItemDetailModal onClose={() => setDetailModal(false)} /> : null}
  </div>;
}

function StatCard({ title, unit, values }: { title: string; unit: string; values: [string, string | number, string][] }) {
  return <section className="stat-card"><header><b>{title}</b><span>{unit}</span></header><div>{values.map(([label, value, tone]) => <span key={label}><small>{label}</small><strong className={tone}>{value}</strong></span>)}</div></section>;
}

function CasesDetail({ cases, onDetail }: { cases: TestCase[]; onDetail: () => void }) {
  return <div className="detail-workspace"><aside className="detail-source-list">{["Oracle 订单主库", "panweidb", "MySQL 用户中心", "mysql84_node60_3307", "pg13_59_5433", "kingbase-mysql", "kingbase-pg", "gauss_d61_8000", "sqlserver2016_66_source...", "golden_p86_8881"].map((name, index) => <button className={index === 0 ? "active" : ""} key={name}><b>{name}</b><small>ds-{name.toLowerCase().replaceAll(" ", "-")}-01</small></button>)}</aside>
    <div className="detail-table-area"><header><b>用例实例列表</b><div><select><option>全部状态</option></select><select><option>全部分类</option></select><select><option>全部标签</option></select></div></header><table><thead><tr><th>用例名称 / 编码</th><th>环境</th><th>PRE_TEST</th><th>TEST</th><th>POST_TEST</th><th>监控实例</th><th>通过 / 失败 / 未监控</th><th>最近执行</th><th>操作</th></tr></thead><tbody>{(cases.length ? cases : []).slice(0, 2).map((testCase, index) => <tr key={testCase.id}><td><b>{testCase.name}</b><small>{testCase.code} · {testCase.category}</small></td><td><span className="positive">● 通过</span></td><td><span className="positive">● 通过</span></td><td className={index ? "pending" : "negative"}>{index ? "◌ WAIT_SYNC" : "● 失败"}</td><td>{index ? "⊘ 跳过" : "◌ WAIT_SYNC"}</td><td>3</td><td><span className="positive">{index ? 3 : 2}</span> / <span className="negative">{index ? 0 : 1}</span> / 0</td><td>2026-06-24 10:18</td><td><button onClick={onDetail}>监控明细</button><button onClick={onDetail}>子项详情</button></td></tr>)}</tbody></table></div>
  </div>;
}

function MonitorDetail({ results }: { results: ReturnType<typeof usePrototype>["state"]["taskRuns"][number]["results"] }) {
  const [showDiff, setShowDiff] = useState(false);
  const rows = [
    { caseName: "Oracle 插入实时同步", source: "Oracle 19c", taskName: "oracle_CDC_INSERT_001_task_PRE", compareName: "oracle_CDC_INSERT_001_task_PRE_check" },
    { caseName: "异常恢复与重试", source: "Oracle 19c", taskName: "EXCEPTION_RETRY_019c_task_PRE", compareName: "EXCEPTION_RETRY_019c_task_PRE_check" },
    { caseName: "异常恢复与重试", source: "本地MySQL8", taskName: "EXCEPTION_RETRY_Mysql8_task_PRE", compareName: "EXCEPTION_RETRY_Mysql8_task_PRE_check" },
  ];
  return <div className="detail-workspace">
    <aside className="detail-source-list monitor-list">{["预发环境 83", "测试环境 85", "测试环境 51"].map((name, index) => <button className={index === 0 ? "active" : ""} key={name}><b>{name}</b><small>192.168.50.{83 - index}:38080</small></button>)}</aside>
    <div className="detail-table-area monitor-detail-table"><header><b>监控实例明细</b><div><select><option>全部数据源</option></select><select><option>全部用例</option></select><select><option>全部状态</option></select></div></header>
      <table aria-label="监控实例明细列表"><thead><tr><th>关联用例实例</th><th>同步任务 / 比对任务</th><th>全量同步状态</th><th>比对模式</th><th>差异数</th><th>差异样例</th><th>状态</th><th>消息</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row.taskName}>
          <td><b>{row.caseName}</b><small>{row.source}</small></td>
          <td className="task-pair-cell">
            <button type="button" aria-label={`同步任务 ${row.taskName}`}>{row.taskName}</button>
            <button type="button" aria-label={`比对任务 ${row.compareName}`}>{row.compareName}</button>
          </td>
          <td><span className={`field-status ${index === 0 ? "success" : "waiting"}`}>{index === 0 ? "已完成" : "等待同步"}</span></td>
          <td><span className="mode-tag">{index === 0 ? "全量比对" : "增量比对"}</span></td>
          <td><strong className={index === 0 ? "negative" : "positive"}>{index === 0 ? 3 : 0}</strong></td>
          <td>{index === 0 ? <button className="diff-link" onClick={() => setShowDiff(true)}>查看差异样例</button> : <span className="muted">—</span>}</td>
          <td><span className={`field-status ${index === 0 ? "failed" : "success"}`}>{index === 0 ? "比对失败" : "正常"}</span></td>
          <td><p className={index === 0 ? "monitor-msg error" : "monitor-msg"}>{index === 0 ? "目标表行数与源端不一致，发现 3 条差异记录" : "数据比对完成，未发现差异"}</p></td>
        </tr>)}</tbody>
      </table>
    </div>
    {showDiff ? <DiffSampleModal onClose={() => setShowDiff(false)} /> : null}
  </div>;
}

function DiffSampleModal({ onClose }: { onClose: () => void }) {
  return <Modal title="差异样例" onClose={onClose} footer={<button className="btn primary" onClick={onClose}>关闭</button>}>
    <div className="diff-summary"><span>比对名称</span><b>订单主表一致性比对</b><span>差异总数</span><b className="negative">3</b></div>
    <div className="diff-record-grid">
      <section><header>source_record</header><pre>{`{\n  "id": 1001,\n  "status": "PAID",\n  "amount": 268.00\n}`}</pre></section>
      <section><header>target_record</header><pre>{`{\n  "id": 1001,\n  "status": "INIT",\n  "amount": 268.00\n}`}</pre></section>
    </div>
    <p className="diff-hint">差异字段：<b>status</b>，源端值 PAID，目标端值 INIT。</p>
  </Modal>;
}

function ReportView() {
  const cards = [["用例分类占比", "2", [["CDC同步", "1"], ["异常场景", "1"]]], ["标签占比", "3", [["基础", "1"], ["冒烟", "1"], ["异常恢复", "1"]]], ["数据源类型占比", "2", [["Oracle 订单主库", "2"]]], ["监控实例分布", "6", [["通过", "3"], ["未监控", "3"]]], ["用例运行结果", "2", [["用例通过", "1"], ["用例未通过", "1"]]], ["监控执行结果", "6", [["通过", "3"], ["未监控", "3"]]]] as const;
  return <div className="report-cards">{cards.map(([title, total, legends], cardIndex) => <section key={title}><h3>{title}</h3><div className={`donut chart-${cardIndex}`}><strong>{total}</strong><small>{cardIndex < 3 ? "用例实例" : "监控实例"}</small></div><div className="chart-legend">{legends.map(([label, value], index) => <span key={label}><i className={`c${index}`} />{label}　{value}<em>{legends.length === 1 ? "100%" : "50%"}</em></span>)}</div></section>)}</div>;
}

function HistoryPanel({ results }: { results: ReturnType<typeof usePrototype>["state"]["taskRuns"][number]["results"] }) {
  const entries = results.length ? results : [{ caseName: "Oracle 插入实时同步", environmentName: "预发环境", reason: "目标端数据校验未通过" }] as typeof results;
  return <aside className="history-panel"><header><b>执行历史</b><span>最近 10 次执行的失败记录</span></header>{[...entries, ...entries].slice(0, 6).map((item, index) => <div key={index}><time>2026-06-{24 - Math.floor(index / 3)} {16 - index}:02</time><b>Oracle 订单主库 / {item.caseName}</b><span>{item.environmentName} / sync_task_0{index + 1}</span><em>{item.reason || "目标表行数不一致"}</em></div>)}</aside>;
}

function RunModal({ onClose, onRun }: { onClose: () => void; onRun: () => void }) {
  return <Modal title="确认执行参数" onClose={onClose} footer={<><label className="save-default"><input type="checkbox" />将本次参数同步保存为任务默认值</label><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={onRun}>执行</button></>}>
    <div className="run-params"><label>比对检查间隔 <small>允许范围 ≥ 1000ms，推荐 5000ms</small><span><input aria-label="比对检查间隔" type="number" defaultValue={1000} /><em>ms</em></span></label><label>用例并发数 <small>允许 1—20，推荐 2</small><input type="number" defaultValue={2} /></label><label>单用例超时 <small>允许 1—20，推荐 2</small><span><input type="number" defaultValue={2} /><em>ms</em></span></label><label>WAIT_SYNC 重试 <small>允许 0—100 次，推荐 10</small><span><input type="number" defaultValue={10} /><em>次</em></span></label><b>失败策略</b><div className="failure-options"><label><input type="checkbox" defaultChecked />失败快速终止</label><label><input type="checkbox" defaultChecked />严格模式</label></div></div>
  </Modal>;
}

function ItemDetailModal({ onClose }: { onClose: () => void }) {
  return <Modal className="task-modal-wide" title="Oracle 插入实时同步 · CDC_INSERT_001" onClose={onClose} footer={<><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={onClose}>确认</button></>}>
    <table className="item-detail-table"><thead><tr><th>阶段</th><th>类型</th><th>名称</th><th>SQL / 配置</th><th>执行结果</th></tr></thead><tbody>
      <tr><td>pre_test</td><td>create</td><td>重建测试表</td><td>AUTOTEST_ORDER</td><td><ItemResult status="success" /></td></tr>
      <tr><td>pre_test</td><td>truncate</td><td>清空测试表</td><td>AUTOTEST_ORDER</td><td><ItemResult status="success" /></td></tr>
      <tr><td>pre_test</td><td>custom_sql</td><td>插入基线数据</td><td>INSERT INTO AUTOTEST_ORDER(ID, STATUS) VALUES (1, 'INIT');</td><td><ItemResult status="success" /></td></tr>
      <tr><td>test</td><td>custom_sqls</td><td>执行增删改 SQL</td><td>UPDATE AUTOTEST_ORDER SET STATUS = 'PAID' WHERE ID = 1;</td><td><ItemResult status="success" /></td></tr>
      <tr><td>test</td><td>check_task</td><td>任务级比对</td><td>oracle_CDC_INSERT_001</td><td><ItemResult status="fail" reason="目标表状态值与预期不一致" /></td></tr>
      <tr><td>post_test</td><td>truncate</td><td>清理测试数据</td><td>AUTOTEST_ORDER</td><td><ItemResult status="skipped" /></td></tr>
    </tbody></table>
  </Modal>;
}

function ItemResult({ status, reason }: { status: "success" | "fail" | "skipped"; reason?: string }) {
  const label = status === "success" ? "成功" : status === "fail" ? "失败" : "跳过";
  return <span className={`item-result ${status}`}><b>{label}</b>{reason ? <small>{reason}</small> : null}</span>;
}

function Switch({ checked }: { checked: boolean }) { return <span className={`mini-switch ${checked ? "on" : ""}`}><i /></span>; }

function Modal({ title, children, footer, onClose, className = "" }: { title: string; children: ReactNode; footer: ReactNode; onClose: () => void; className?: string }) {
  return <div className="task-modal-layer"><div className={`task-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}><header><b>{title}</b><button type="button" aria-label="关闭" onClick={onClose}><X /></button></header><div className="task-modal-body">{children}</div><footer>{footer}</footer></div></div>;
}
