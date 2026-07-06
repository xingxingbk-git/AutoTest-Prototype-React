import { Edit3, Play, Plus, RefreshCcw, RotateCcw, Search, Trash2, X } from "lucide-react";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePrototype } from "../../prototype/store";
import type { TestCase, TestTask } from "../../prototype/types";

type Source = { id: string; name: string; type: string; detail: string };
type CaseInstance = { id: string; source: Source; testCase: TestCase };

const sources: Source[] = [
  { id: "source-mysql", name: "本地MySQL8", type: "MySQL", detail: "192.168.50.83:38080" },
  { id: "source-oracle", name: "oracle19c", type: "Oracle", detail: "192.168.50.84:38080" },
  { id: "source-pg", name: "PostgreSQL", type: "PG", detail: "192.168.50.85:38080" },
];

const sourcePool: Source[] = [
  ...sources,
  { id: "source-panwei", name: "panweidb", type: "Oracle", detail: "192.168.50.86:38080" },
  { id: "source-center", name: "MySQL 用户中心", type: "MySQL", detail: "192.168.50.87:38080" },
  { id: "source-84", name: "mysql84_node60_3307", type: "MySQL", detail: "192.168.50.88:38080" },
  { id: "source-pg13", name: "pg13_59_5433", type: "PG", detail: "192.168.50.89:38080" },
];

const detailSources: Source[] = [
  { id: "detail-oracle", name: "Oracle 订单主库", type: "Oracle", detail: "Oracle 19c" },
  { id: "detail-mysql", name: "MySQL 用户中心", type: "MySQL", detail: "本地MySQL8" },
  { id: "detail-pg", name: "PostgreSQL 业务库", type: "PG", detail: "PostgreSQL" },
];

const caseMatchesSource = (testCase: TestCase, sourceType: string) =>
  !testCase.dataSource ||
  testCase.dataSource === sourceType ||
  (sourceType === "PG" && testCase.dataSource === "PostgreSQL");

const emptyTask = (): TestTask => ({
  id: `task-${Date.now()}`,
  code: `TASK-${Date.now().toString().slice(-6)}`,
  name: "",
  description: "",
  caseIds: [],
  sourceEnvironmentId: "source-mysql",
  environmentIds: ["env-c", "env-a", "env-b"],
  enabled: true,
  concurrency: 2,
  failFast: true,
});

export function TasksPage() {
  const { state, dispatch } = usePrototype();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const rows = state.tasks.filter((task) => !query || `${task.code}${task.name}`.toLowerCase().includes(query.toLowerCase()));
  const allSelected = rows.length > 0 && rows.every((task) => selected.includes(task.id));

  return (
    <div className="task-list-page">
      <header className="task-page-heading">
        <div><h1>测试任务</h1><p>组合共享执行源、固定用例、监控环境与默认执行参数</p></div>
        <Link className="btn primary" to="/tasks/new"><Plus size={15} />新建任务</Link>
      </header>
      <section className="task-list-card">
        <div className="task-filter-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务名称" />
          <div className="task-filter-selects">
            <select><option>全部数据源</option><option>MySQL</option><option>Oracle</option></select>
            <select><option>全部用例</option><option>CDC同步</option><option>DDL同步</option></select>
            <select><option>全部监控环境</option><option>预发环境</option><option>测试环境 A</option></select>
            <select><option>全部最近状态</option><option>执行成功</option><option>执行失败</option></select>
            <button className="btn" onClick={() => setQuery("")}><RotateCcw size={15} />重置</button>
          </div>
        </div>
        {selected.length > 0 ? (
          <div className="task-batch-row">
            <label><input type="checkbox" checked={allSelected} onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.id) : [])} />全部</label>
            <span>已选择 {selected.length} 项</span>
            <button onClick={() => selected.forEach((id) => dispatch({ type: "runTask", id }))}>批量执行</button>
            <button className="danger-text">批量停止</button>
          </div>
        ) : null}
        <div className="task-table-scroll">
          <table className="task-table">
            <thead>
              <tr><th className="check-cell"><input aria-label="选择全部任务" type="checkbox" checked={allSelected} onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.id) : [])} /></th><th>任务编码</th><th>任务名称</th><th>共享执行源</th><th>用例范围</th><th>监控环境</th><th>更新时间</th><th>操作</th></tr>
            </thead>
            <tbody>
              {rows.map((task, index) => (
                <tr key={task.id}>
                  <td className="check-cell"><input aria-label={`选择${task.name}`} type="checkbox" checked={selected.includes(task.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, task.id] : current.filter((id) => id !== task.id))} /></td>
                  <td><Link className="code-link" to={`/tasks/${task.id}`}>{index === 0 ? "TASK_001" : `TASK_00${index + 1}`}</Link></td>
                  <td><b>{index === 0 ? "每日核心测试" : index === 1 ? "DDL 专项任务" : task.name}</b><small>{task.description || "订单与异常恢复核心链路每日验证"}</small></td>
                  <td><SourceStack compact={index > 0} /></td>
                  <td><b>{task.caseIds.length || 1} 个</b> <span className="positive">启用 {Math.max(task.caseIds.length - 1, 1)}</span> <span className="muted">停用 {task.caseIds.length > 1 ? 1 : 0}</span></td>
                  <td><div className="tag-row">{task.environmentIds.slice(0, 3).map((id, environmentIndex) => <span className="tag" key={id}>{environmentIndex === 0 ? "预发环境" : `测试环境 ${String.fromCharCode(64 + environmentIndex)}`}</span>)}</div></td>
                  <td>{index === 0 ? "2026-06-24 10:21" : "2026-06-23 18:48"}</td>
                  <td>
                    <div className="row-actions">
                      <button title="执行" onClick={() => dispatch({ type: "runTask", id: task.id })}><Play /></button>
                      <Link title="编辑" to={`/tasks/${task.id}/edit`}><Edit3 /></Link>
                      <button title="删除" onClick={() => confirm(`确认删除 ${task.name}？`) && dispatch({ type: "deleteTask", id: task.id })}><Trash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination />
      </section>
    </div>
  );
}

function SourceStack({ compact = false }: { compact?: boolean }) {
  return (
    <div className="source-stack">
      <span className="source-icon mysql">My</span>
      {!compact ? <span className="source-name">Oracle 12c</span> : <><span className="source-icon pg">PG</span><span className="source-icon oracle">O</span></>}
    </div>
  );
}

function Pagination() {
  return <footer className="task-pagination"><span>共100条</span><button>‹</button><button className="active">1</button><button>2</button><button>3</button><button>4</button><button>5</button><span>...</span><button>10</button><button>›</button><select><option>10条/页</option></select></footer>;
}

export function TaskEditorPage() {
  const { taskId } = useParams();
  const { state, dispatch } = usePrototype();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<TestTask>(() => structuredClone(state.tasks.find((task) => task.id === taskId) || emptyTask()));
  const [sourceIds, setSourceIds] = useState<string[]>(taskId ? sources.map((source) => source.id) : []);
  const [activeSource, setActiveSource] = useState(taskId ? sources[0].id : "");
  const [activeInstance, setActiveInstance] = useState("");
  const [configSourceIds, setConfigSourceIds] = useState<string[]>([]);
  const [treeQuery, setTreeQuery] = useState("");
  const [modal, setModal] = useState<"source" | "cases" | null>(null);
  const [sourceCaseMap, setSourceCaseMap] = useState<Record<string, string[]>>(() => {
    if (!taskId) return {};
    return Object.fromEntries(sources.map((source) => [
      source.id,
      draft.caseIds.filter((id) => {
        const testCase = state.cases.find((item) => item.id === id);
        return testCase ? caseMatchesSource(testCase, source.type) : false;
      }),
    ]));
  });

  const instances = sourceIds.flatMap((sourceId) => {
    const source = sourcePool.find((item) => item.id === sourceId);
    return (sourceCaseMap[sourceId] || []).flatMap((caseId) => {
      const testCase = state.cases.find((item) => item.id === caseId);
      return source && testCase ? [{ id: `${sourceId}:${caseId}`, source, testCase }] : [];
    });
  });
  const current = instances.find((instance) => instance.id === activeInstance);
  const selectedSource = sourcePool.find((source) => source.id === activeSource);
  const selectedCases = state.cases.filter((testCase) => (sourceCaseMap[activeSource] || []).includes(testCase.id));

  const selectInstance = (sourceId: string, caseId: string) => {
    setActiveSource(sourceId);
    setActiveInstance(`${sourceId}:${caseId}`);
  };
  const activateSource = (sourceId: string) => {
    setActiveSource(sourceId);
    const firstCaseId = sourceCaseMap[sourceId]?.[0];
    setActiveInstance(firstCaseId ? `${sourceId}:${firstCaseId}` : "");
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    dispatch({ type: "saveTask", value: draft });
    navigate(`/tasks/${draft.id}`);
  };

  return (
    <form className="task-editor task-editor-v2" onSubmit={save}>
      <section className="task-form-card">
        <header><b>基本信息</b><span>任务编号自动生成</span></header>
        <div className="task-basic-form">
          <label>任务名称<input aria-label="任务名称" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="请输入任务名称" /></label>
          <label>任务描述<input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="请输入任务描述" /></label>
        </div>
      </section>

      <section className="environment-card environment-card-v2">
        <header>环境与任务配置</header>
        <div className="environment-options">
          {[
            ["env-c", "预发环境 83", "环境可用"],
            ["env-a", "测试环境 85", "环境可用"],
            ["env-b", "测试环境 51", "环境状态需关注"],
            ["env-dr", "灾备环境 97", "环境状态需关注"],
          ].map(([id, name, detail]) => (
            <label className={draft.environmentIds.includes(id) ? "selected" : ""} key={id}>
              <input type="checkbox" checked={draft.environmentIds.includes(id)} onChange={(event) => setDraft({ ...draft, environmentIds: event.target.checked ? [...draft.environmentIds, id] : draft.environmentIds.filter((environmentId) => environmentId !== id) })} />
              <b>{name}</b><small>{detail}</small><Switch checked={draft.environmentIds.includes(id)} />
            </label>
          ))}
        </div>
      </section>

      <section className="task-config-card task-config-card-v2">
        <header>用例配置</header>
        <div className="task-config-layout">
          <aside className="source-sidebar source-tree-v2">
            <div className="source-sidebar-head">
              <b>数据源与用例</b>
              <button type="button" aria-label="添加数据源" onClick={() => setModal("source")}><Plus /></button>
              <button type="button" className="btn" disabled={configSourceIds.length === 0} onClick={() => setModal("cases")}>配置用例</button>
            </div>
            <label className="source-tree-search"><Search size={15} /><input value={treeQuery} onChange={(event) => setTreeQuery(event.target.value)} placeholder="搜索数据源或用例" /></label>
            {sourceIds.length === 0 ? (
              <div className="source-empty">暂无数据源，请点击“添加”数据源。</div>
            ) : sourceIds.map((id) => {
              const source = sourcePool.find((item) => item.id === id)!;
              const sourceCases = state.cases.filter((testCase) => (sourceCaseMap[id] || []).includes(testCase.id));
              const matches = !treeQuery || `${source.name}${sourceCases.map((item) => item.name).join("")}`.toLowerCase().includes(treeQuery.toLowerCase());
              if (!matches) return null;
              return (
                <div className={`source-tree-group ${activeSource === id ? "active" : ""}`} key={id}>
                  <div className="source-tree-source">
                    <button aria-label={`查看数据源${source.name}`} type="button" onClick={() => activateSource(id)}>
                      <span className={`source-icon ${source.type.toLowerCase()}`}>{source.type.slice(0, 2)}</span>
                      <span><b>{source.name}</b><small>用例 {sourceCases.length} 个，启用 {sourceCases.length} 个</small></span>
                    </button>
                    <input aria-label={`选择配置数据源${source.name}`} type="checkbox" checked={configSourceIds.includes(id)} onChange={(event) => setConfigSourceIds((currentIds) => event.target.checked ? [...currentIds, id] : currentIds.filter((value) => value !== id))} />
                  </div>
                  {activeSource === id ? (
                    <div className="source-tree-cases">
                      {sourceCases.length ? sourceCases.map((testCase) => (
                        <button
                          aria-label={`配置实例${testCase.name}`}
                          type="button"
                          className={activeInstance === `${id}:${testCase.id}` ? "active" : ""}
                          onClick={() => selectInstance(id, testCase.id)}
                          key={testCase.id}
                        >
                          <span><b>{testCase.name}</b><small>{testCase.code}</small></span>
                          <Switch checked={testCase.enabled} />
                        </button>
                      )) : <p>尚未配置用例</p>}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </aside>

          <div className="instance-mapping-v2">
            {current ? (
              <>
                <header>
                  <span><b>{current.testCase.name}</b><small>{current.source.name} · {current.testCase.category}</small></span>
                  <div><span className="tag">{current.testCase.dataSource || "共用"}</span><Switch checked={current.testCase.enabled} /></div>
                </header>
                <div className="instance-contract-v2">
                  <span>用例编码 <b>{current.testCase.code}</b></span>
                  <span>约定任务名 <b>{current.testCase.code.toLowerCase()}_task</b></span>
                </div>
                <div className="environment-pills-v2">
                  {draft.environmentIds.map((environmentId, index) => <button type="button" className={index === 0 ? "active" : ""} key={environmentId}>{environmentLabel(environmentId)}</button>)}
                </div>
                <table aria-label="环境任务映射">
                  <thead><tr><th>环境</th><th>关联任务</th><th>任务内状态</th></tr></thead>
                  <tbody>
                    {draft.environmentIds.map((environmentId, index) => (
                      <tr key={environmentId}>
                        <td><b>{environmentLabel(environmentId)}</b><small>192.168.50.{83 + index}:38080</small></td>
                        <td><select><option>{current.testCase.code.toLowerCase()}--&gt;{current.source.type.toLowerCase()}_task_{index + 1}</option></select><em>唯一匹配</em></td>
                        <td><Switch checked /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className="workspace-empty">
                <span><b>{selectedSource ? selectedSource.name : "请选择用例实例"}</b><small>左侧选择数据源中的用例后，在这里配置匹配的环境任务。</small></span>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="task-editor-footer">
        <button type="button" className="btn" onClick={() => navigate("/tasks")}>取消</button>
        <button className="btn primary">保存任务</button>
      </footer>

      {modal === "source" ? (
        <SourceModal
          selected={sourceIds}
          onClose={() => setModal(null)}
          onSave={(ids) => {
            setSourceIds(ids);
            setActiveSource(ids[0] || "");
            setConfigSourceIds((currentIds) => currentIds.filter((id) => ids.includes(id)));
            setModal(null);
          }}
        />
      ) : null}
      {modal === "cases" ? (
        <CasesModal
          cases={state.cases}
          sourceTypes={configSourceIds.map((id) => sourcePool.find((source) => source.id === id)?.type || "")}
          selected={[...new Set(configSourceIds.flatMap((id) => sourceCaseMap[id] || []))]}
          onClose={() => setModal(null)}
          onSave={(ids) => {
            const nextMap = { ...sourceCaseMap };
            configSourceIds.forEach((sourceId) => {
              const source = sourcePool.find((item) => item.id === sourceId);
              nextMap[sourceId] = source ? ids.filter((caseId) => {
                const testCase = state.cases.find((item) => item.id === caseId);
                return testCase ? caseMatchesSource(testCase, source.type) : false;
              }) : [];
            });
            setSourceCaseMap(nextMap);
            setDraft({ ...draft, caseIds: [...new Set(Object.values(nextMap).flat())] });
            const firstSourceId = configSourceIds[0];
            const firstCaseId = nextMap[firstSourceId]?.[0];
            if (firstSourceId && firstCaseId) selectInstance(firstSourceId, firstCaseId);
            setModal(null);
          }}
        />
      ) : null}
    </form>
  );
}

function environmentLabel(id: string) {
  return id === "env-c" ? "预发环境 83" : id === "env-a" ? "测试环境 85" : id === "env-b" ? "测试环境 51" : "灾备环境 97";
}

function SourceModal({ selected, onClose, onSave }: { selected: string[]; onClose: () => void; onSave: (ids: string[]) => void }) {
  const [ids, setIds] = useState(selected);
  return (
    <Modal title="添加数据源" onClose={onClose} footer={<><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={() => onSave(ids)}>添加</button></>}>
      <label className="modal-select-label">执行环境：<select><option>192.168.50.83:38080</option></select></label>
      <div className="modal-option-list">
        {sourcePool.map((source) => (
          <label key={source.id}>
            <input aria-label={`选择${source.name}`} type="checkbox" checked={ids.includes(source.id)} onChange={(event) => setIds((current) => event.target.checked ? [...current, source.id] : current.filter((id) => id !== source.id))} />
            <b>{source.name}</b><span>通过</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

function CasesModal({ cases, sourceTypes, selected, onClose, onSave }: { cases: TestCase[]; sourceTypes: string[]; selected: string[]; onClose: () => void; onSave: (ids: string[]) => void }) {
  const [ids, setIds] = useState(selected);
  const availableCases = cases.filter((item) => sourceTypes.some((type) => caseMatchesSource(item, type)));
  return (
    <Modal title="配置用例" onClose={onClose} footer={<><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={() => onSave(ids)}>保存配置</button></>}>
      <div className="config-scope-note">适用范围：{sourceTypes.join("、")} 类型用例及共用用例</div>
      <div className="case-modal-list">
        {availableCases.map((testCase) => (
          <label key={testCase.id}>
            <input aria-label={`选择${testCase.name}`} type="checkbox" checked={ids.includes(testCase.id)} onChange={(event) => setIds((current) => event.target.checked ? [...current, testCase.id] : current.filter((id) => id !== testCase.id))} />
            <span><b>{testCase.name}</b><small>{testCase.code} · {testCase.category}</small></span>
            <em>{testCase.dataSource || "共用"}</em>
          </label>
        ))}
      </div>
    </Modal>
  );
}

export function TaskDetailPage() {
  const { taskId } = useParams();
  const { state, dispatch } = usePrototype();
  const [tab, setTab] = useState<"cases" | "monitors" | "report">("cases");
  const [runModal, setRunModal] = useState(false);
  const task = state.tasks.find((item) => item.id === taskId);
  const runs = useMemo(() => state.taskRuns.filter((item) => item.taskId === taskId), [state.taskRuns, taskId]);
  if (!task) return <div className="task-list-page">测试任务不存在</div>;
  const cases = state.cases.filter((item) => task.caseIds.includes(item.id));
  const results = runs[0]?.results || [];

  return (
    <div className="task-detail-page">
      <header className="task-detail-heading">
        <div><h1>{task.id === "task-1" ? "每日核心测试" : task.name}</h1><p>{task.description || "订单与异常恢复核心链路每日验证"}</p></div>
        <div><Link className="icon-btn" aria-label="编辑任务" to={`/tasks/${task.id}/edit`}><Edit3 /></Link><button className="icon-btn danger" aria-label="删除任务"><Trash2 /></button><button className="icon-btn" aria-label="刷新"><RefreshCcw /></button><button className="btn primary" onClick={() => setRunModal(true)}>开始执行</button></div>
      </header>
      <div className="task-stat-grid">
        <StatCard title="配置统计" unit="用例级" values={[["总数", 3, ""], ["启用数", 2, "positive"], ["禁用数", 1, "muted"]]} />
        <StatCard title="运行统计" unit="用例级" values={[["未执行", 0, "muted"], ["通过", 0, "positive"], ["未通过", 2, "negative"], ["通过率", "0%", "warning"]]} />
        <StatCard title="用例实例统计" unit="用例 × 数据源" values={[["总数", 3, ""], ["启用数", 2, "positive"], ["禁用数", 1, "muted"]]} />
        <StatCard title="用例实例运行" unit="用例 × 数据源" values={[["未执行", 0, "muted"], ["通过", 1, "positive"], ["未通过", 1, "negative"], ["通过率", "50%", "warning"]]} />
      </div>
      <div className="task-detail-layout">
        <section className="task-detail-main">
          <div className="detail-tabs" role="tablist">
            <button role="tab" aria-selected={tab === "cases"} className={tab === "cases" ? "active" : ""} onClick={() => setTab("cases")}>用例实例</button>
            <button role="tab" aria-selected={tab === "monitors"} className={tab === "monitors" ? "active" : ""} onClick={() => setTab("monitors")}>监控实例</button>
            <button role="tab" aria-selected={tab === "report"} className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}>统计报告</button>
          </div>
          {tab === "cases" ? <CasesDetail cases={cases} onRerun={() => setRunModal(true)} /> : tab === "monitors" ? <MonitorDetail onRerun={() => setRunModal(true)} /> : <ReportView />}
        </section>
        <HistoryPanel results={results} />
      </div>
      {runModal ? <RunModal onClose={() => setRunModal(false)} onRun={() => { dispatch({ type: "runTask", id: task.id }); setRunModal(false); }} /> : null}
    </div>
  );
}

function StatCard({ title, unit, values }: { title: string; unit: string; values: [string, string | number, string][] }) {
  return <section className="stat-card"><header><b>{title}</b><span>{unit}</span></header><div>{values.map(([label, value, tone]) => <span key={label}><small>{label}</small><strong className={tone}>{value}</strong></span>)}</div></section>;
}

function CasesDetail({ cases, onRerun }: { cases: TestCase[]; onRerun: () => void }) {
  const [activeSourceId, setActiveSourceId] = useState(detailSources[0].id);
  const [activeCaseId, setActiveCaseId] = useState(cases.find((testCase) => caseMatchesSource(testCase, "Oracle"))?.id || cases[0]?.id || "");
  const [selected, setSelected] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState(false);
  const activeSource = detailSources.find((item) => item.id === activeSourceId)!;
  const visibleCases = cases.filter((testCase) => caseMatchesSource(testCase, activeSource.type));
  const activeCase = visibleCases.find((testCase) => testCase.id === activeCaseId) || visibleCases[0];
  const instanceId = (testCase: TestCase) => `${activeSource.id}:${testCase.id}`;
  const allSelected = visibleCases.length > 0 && visibleCases.every((testCase) => selected.includes(instanceId(testCase)));
  const changeSource = (sourceId: string) => {
    const source = detailSources.find((item) => item.id === sourceId)!;
    setActiveSourceId(sourceId);
    setActiveCaseId(cases.find((testCase) => caseMatchesSource(testCase, source.type))?.id || "");
    setSelected([]);
  };

  return (
    <div className="detail-workspace detail-workspace-v2">
      <aside className="detail-source-list detail-tree-v2">
        <label className="detail-tree-search"><Search size={14} /><input placeholder="搜索数据源或用例" /></label>
        {detailSources.map((source) => {
          const sourceCases = cases.filter((testCase) => caseMatchesSource(testCase, source.type));
          return (
            <div className={`detail-tree-group ${source.id === activeSourceId ? "active" : ""}`} key={source.id}>
              <button className="detail-tree-source" onClick={() => changeSource(source.id)}><b>{source.name}</b><small>{source.detail} · {sourceCases.length} 个用例</small></button>
              {source.id === activeSourceId ? sourceCases.map((testCase) => {
                const id = instanceId(testCase);
                return (
                  <div className={`detail-tree-case ${activeCase?.id === testCase.id ? "active" : ""}`} key={testCase.id}>
                    <input aria-label={`选择用例实例${testCase.name}`} type="checkbox" checked={selected.includes(id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, id] : current.filter((value) => value !== id))} />
                    <button aria-label={`配置实例${testCase.name}`} onClick={() => setActiveCaseId(testCase.id)}><b>{testCase.name}</b><small>{testCase.code}</small></button>
                  </div>
                );
              }) : null}
            </div>
          );
        })}
      </aside>
      <div className="detail-table-area subitem-detail-v2">
        <header>
          <b>用例实例列表 <span className="selected-count">{selected.length ? `已选择 ${selected.length} 项` : ""}</span></b>
          <div><select><option>全部状态</option></select><select><option>全部分类</option></select><select><option>全部标签</option></select><button className="btn rerun-btn" aria-label="重新执行所选用例实例" disabled={selected.length === 0} onClick={onRerun}><RotateCcw size={14} />重新执行</button></div>
        </header>
        {activeCase ? (
          <>
            <div className="active-instance-head-v2">
              <span><b>{activeCase.name}</b><small>{activeSource.name} · {activeCase.code} · {activeCase.category}</small></span>
              <button className="btn" onClick={() => setDetailModal(true)}>比对明细</button>
            </div>
            <table aria-label="用例实例子项列表">
              <thead><tr><th className="instance-check"><input aria-label="全选用例实例" type="checkbox" checked={allSelected} onChange={(event) => setSelected(event.target.checked ? visibleCases.map(instanceId) : [])} /></th><th>阶段</th><th>动作名称</th><th>动作类型</th><th>SQL / 配置</th><th>执行结果</th></tr></thead>
              <tbody>
                {activeCase.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="instance-check">{index === 0 ? <input aria-label={`选择当前实例${activeCase.name}`} type="checkbox" checked={selected.includes(instanceId(activeCase))} onChange={(event) => setSelected(event.target.checked ? [...new Set([...selected, instanceId(activeCase)])] : selected.filter((value) => value !== instanceId(activeCase)))} /> : null}</td>
                    <td>{item.phase.toUpperCase()}</td><td><b>{item.name}</b></td><td><span className="mode-tag">{item.type}</span></td><td><code>{item.config || activeCase.code.toLowerCase()}</code></td><td><ItemResult status={index === activeCase.items.length - 1 ? "fail" : "success"} reason={index === activeCase.items.length - 1 ? "目标表状态值与预期不一致" : undefined} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : <div className="workspace-empty">当前数据源暂无可展示的用例实例。</div>}
      </div>
      {detailModal ? <CompareDetailModal onClose={() => setDetailModal(false)} /> : null}
    </div>
  );
}

function MonitorDetail({ onRerun }: { onRerun: () => void }) {
  const [showDiff, setShowDiff] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const rows = [
    { caseName: "Oracle 插入实时同步", source: "Oracle 19c", taskName: "oracle_CDC_INSERT_001_task_PRE", compareName: "oracle_CDC_INSERT_001_task_PRE_check" },
    { caseName: "异常恢复与重试", source: "Oracle 19c", taskName: "EXCEPTION_RETRY_019c_task_PRE", compareName: "EXCEPTION_RETRY_019c_task_PRE_check" },
    { caseName: "异常恢复与重试", source: "本地MySQL8", taskName: "EXCEPTION_RETRY_Mysql8_task_PRE", compareName: "EXCEPTION_RETRY_Mysql8_task_PRE_check" },
  ];
  return (
    <div className="detail-workspace detail-workspace-v2">
      <aside className="detail-source-list monitor-list">
        {["预发环境 83", "测试环境 85", "测试环境 51"].map((name, index) => <button className={index === 0 ? "active" : ""} key={name}><b>{name}</b><small>192.168.50.{83 - index}:38080</small></button>)}
      </aside>
      <div className="detail-table-area monitor-detail-table">
        <header><b>监控实例明细 <span className="selected-count">{selected.length ? `已选择 ${selected.length} 项` : ""}</span></b><div><select><option>全部数据源</option></select><select><option>全部用例</option></select><select><option>全部状态</option></select><button className="btn rerun-btn" aria-label="重新执行所选监控实例" disabled={selected.length === 0} onClick={onRerun}><RotateCcw size={14} />重新执行</button></div></header>
        <table aria-label="监控实例明细列表">
          <thead><tr><th className="instance-check"><input aria-label="全选监控实例" type="checkbox" checked={selected.length === rows.length} onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.taskName) : [])} /></th><th>关联用例实例</th><th>同步任务 / 比对任务</th><th>全量同步状态</th><th>比对模式</th><th>差异数</th><th>差异样例</th><th>状态</th><th>消息</th></tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.taskName}>
                <td className="instance-check"><input aria-label={`选择监控实例${row.caseName}`} type="checkbox" checked={selected.includes(row.taskName)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.taskName] : current.filter((name) => name !== row.taskName))} /></td>
                <td><b>{row.caseName}</b><small>{row.source}</small></td>
                <td className="task-pair-cell"><button type="button" aria-label={`同步任务 ${row.taskName}`}>{row.taskName}</button><button type="button" aria-label={`比对任务 ${row.compareName}`}>{row.compareName}</button></td>
                <td><span className={`field-status ${index === 0 ? "success" : "waiting"}`}>{index === 0 ? "已完成" : "等待同步"}</span></td>
                <td><span className="mode-tag">{index === 0 ? "全量比对" : "增量比对"}</span></td>
                <td><strong className={index === 0 ? "negative" : "positive"}>{index === 0 ? 3 : 0}</strong></td>
                <td>{index === 0 ? <button className="diff-link" onClick={() => setShowDiff(true)}>查看差异样例</button> : <span className="muted">—</span>}</td>
                <td><span className={`field-status ${index === 0 ? "failed" : "success"}`}>{index === 0 ? "比对失败" : "正常"}</span></td>
                <td><p className={index === 0 ? "monitor-msg error" : "monitor-msg"}>{index === 0 ? "目标表行数与源端不一致，发现 3 条差异记录" : "数据比对完成，未发现差异"}</p></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDiff ? <DiffSampleModal onClose={() => setShowDiff(false)} /> : null}
    </div>
  );
}

function CompareDetailModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal className="task-modal-wide" title="比对明细" onClose={onClose} footer={<><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={onClose}>确认</button></>}>
      <table className="item-detail-table">
        <thead><tr><th>环境</th><th>动作名称</th><th>动作类型</th><th>SQL / 配置</th><th>执行结果</th></tr></thead>
        <tbody>
          <tr><td>预发环境 83</td><td>重建测试表</td><td>create</td><td>AUTOTEST_ORDER</td><td><ItemResult status="success" /></td></tr>
          <tr><td>测试环境 85</td><td>插入基线数据</td><td>custom_sql</td><td>INSERT INTO AUTOTEST_ORDER(ID, STATUS) VALUES (1, 'INIT');</td><td><ItemResult status="success" /></td></tr>
          <tr><td>测试环境 51</td><td>任务级比对</td><td>check_task</td><td>oracle_CDC_INSERT_001</td><td><ItemResult status="fail" reason="目标表状态值与预期不一致" /></td></tr>
        </tbody>
      </table>
    </Modal>
  );
}

function DiffSampleModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal className="task-modal-wide" title="查看差异样例" onClose={onClose} footer={<button className="btn primary" onClick={onClose}>关闭</button>}>
      <div className="diff-summary"><span>比对名称</span><b>订单主表一致性比对</b><span>差异总数</span><b className="negative">3</b></div>
      <div className="diff-record-grid">
        <section><header>source_record</header><pre>{`{\n  "id": 1001,\n  "status": "PAID",\n  "amount": 268.00\n}`}</pre></section>
        <section><header>target_record</header><pre>{`{\n  "id": 1001,\n  "status": "INIT",\n  "amount": 268.00\n}`}</pre></section>
      </div>
      <p className="diff-hint">差异字段：<b>status</b>，源端值 PAID，目标端值 INIT。</p>
    </Modal>
  );
}

function ReportView() {
  const cards = [
    ["用例分类占比", "2", [["CDC同步", "1"], ["异常场景", "1"]]],
    ["标签占比", "3", [["基础", "1"], ["冒烟", "1"], ["异常恢复", "1"]]],
    ["数据源类型占比", "2", [["Oracle 订单主库", "2"]]],
    ["监控实例分布", "6", [["通过", "3"], ["未监控", "3"]]],
    ["用例运行结果", "2", [["用例通过", "1"], ["用例未通过", "1"]]],
    ["监控执行结果", "6", [["通过", "3"], ["未监控", "3"]]],
  ] as const;
  return <div className="report-cards">{cards.map(([title, total, legends], cardIndex) => <section key={title}><h3>{title}</h3><div className={`donut chart-${cardIndex}`}><strong>{total}</strong><small>{cardIndex < 3 ? "用例实例" : "监控实例"}</small></div><div className="chart-legend">{legends.map(([label, value], index) => <span key={label}><i className={`c${index}`} />{label}　{value}<em>{legends.length === 1 ? "100%" : "50%"}</em></span>)}</div></section>)}</div>;
}

function HistoryPanel({ results }: { results: ReturnType<typeof usePrototype>["state"]["taskRuns"][number]["results"] }) {
  const entries = results.length ? results : [{ caseName: "Oracle 插入实时同步", environmentName: "预发环境", reason: "目标端数据校验未通过" }] as typeof results;
  return <aside className="history-panel"><header><b>执行历史</b><span>最近 10 次执行的失败记录</span></header>{[...entries, ...entries].slice(0, 6).map((item, index) => <div key={index}><time>2026-06-{24 - Math.floor(index / 3)} {16 - index}:02</time><b>Oracle 订单主库 / {item.caseName}</b><span>{item.environmentName} / sync_task_0{index + 1}</span><em>{item.reason || "目标表行数不一致"}</em></div>)}</aside>;
}

function RunModal({ onClose, onRun }: { onClose: () => void; onRun: () => void }) {
  return (
    <Modal title="确认执行参数" onClose={onClose} footer={<><label className="save-default"><input type="checkbox" />将本次参数同步保存为任务默认值</label><button className="btn" onClick={onClose}>取消</button><button className="btn primary" onClick={onRun}>执行</button></>}>
      <div className="run-params">
        <label>比对检查间隔 <small>允许范围 ≥ 1000ms，推荐 5000ms</small><span><input aria-label="比对检查间隔" type="number" defaultValue={1000} /><em>ms</em></span></label>
        <label>用例并发数 <small>允许 1—20，推荐 2</small><input type="number" defaultValue={2} /></label>
        <label>单用例超时 <small>允许 1—20，推荐 2</small><span><input type="number" defaultValue={2} /><em>ms</em></span></label>
        <label>WAIT_SYNC 重试 <small>允许 0—100 次，推荐 10</small><span><input type="number" defaultValue={10} /><em>次</em></span></label>
        <b>失败策略</b><div className="failure-options"><label><input type="checkbox" defaultChecked />失败快速终止</label></div>
      </div>
    </Modal>
  );
}

function ItemResult({ status, reason }: { status: "success" | "fail" | "skipped"; reason?: string }) {
  const label = status === "success" ? "成功" : status === "fail" ? "失败" : "跳过";
  return <span className={`item-result ${status}`}><b>{label}</b>{reason ? <small>{reason}</small> : null}</span>;
}

function Switch({ checked }: { checked: boolean }) {
  return <span className={`mini-switch ${checked ? "on" : ""}`}><i /></span>;
}

function Modal({ title, children, footer, onClose, className = "" }: { title: string; children: ReactNode; footer: ReactNode; onClose: () => void; className?: string }) {
  return <div className="task-modal-layer"><div className={`task-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}><header><b>{title}</b><button type="button" aria-label="关闭" onClick={onClose}><X /></button></header><div className="task-modal-body">{children}</div><footer>{footer}</footer></div></div>;
}
