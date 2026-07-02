import { ArrowLeft, ChevronLeft, ChevronRight, Edit3, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { EmptyState } from "../../components/prototype/Primitives";
import { usePrototype } from "../../prototype/store";
import type { CaseItem, CasePhase, TestCase } from "../../prototype/types";

const phaseMeta: Record<CasePhase, { title: string; subtitle: string }> = {
  pre_test: { title: "PRE_TEST", subtitle: "准备数据" },
  test: { title: "TEST", subtitle: "执行与验证" },
  post_test: { title: "POST_TEST", subtitle: "恢复清理" },
};

export function CasesPage() {
  const { state, dispatch } = usePrototype();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [taskType, setTaskType] = useState("");
  const [enabled, setEnabled] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const rows = useMemo(() => state.cases.filter(item =>
    (!query || `${item.code}${item.name}`.toLowerCase().includes(query.toLowerCase())) &&
    (!category || item.category === category) &&
    (!tag || item.tags.includes(tag)) &&
    (!dataSource || item.dataSource === dataSource) &&
    (!taskType || item.taskType === taskType) &&
    (!enabled || String(item.enabled) === enabled)
  ), [state.cases, query, category, tag, dataSource, taskType, enabled]);

  const reset = () => {
    setQuery(""); setCategory(""); setTag(""); setDataSource(""); setTaskType(""); setEnabled("");
  };
  const allSelected = rows.length > 0 && rows.every(item => selected.includes(item.id));

  return <div className="case-library-page">
    <div className="case-library-heading">
      <div><h1>用例库</h1><p>管理固定功能用例和三阶段动作资产</p></div>
      <Link className="btn primary case-create-button" to="/cases/new"><Plus size={16} />新建用例</Link>
    </div>
    <section className="case-library-card">
      <div className="case-filter-row">
        <input className="case-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索用例名称或编码" />
        <div className="case-filters">
          <select aria-label="分类筛选" value={category} onChange={event => setCategory(event.target.value)}><option value="">全部分类</option>{[...new Set(state.cases.map(item => item.category))].map(item => <option key={item}>{item}</option>)}</select>
          <select aria-label="标签筛选" value={tag} onChange={event => setTag(event.target.value)}><option value="">全部标签</option>{[...new Set(state.cases.flatMap(item => item.tags))].map(item => <option key={item}>{item}</option>)}</select>
          <select aria-label="数据源筛选" value={dataSource} onChange={event => setDataSource(event.target.value)}><option value="">全部数据源</option>{[...new Set(state.cases.map(item => item.dataSource))].map(item => <option key={item}>{item}</option>)}</select>
          <select aria-label="任务类型筛选" value={taskType} onChange={event => setTaskType(event.target.value)}><option value="">全部任务类型</option><option>REALTIME</option><option>FULL</option><option>FULL_REALTIME</option></select>
          <select aria-label="状态筛选" value={enabled} onChange={event => setEnabled(event.target.value)}><option value="">全部状态</option><option value="true">已启用</option><option value="false">已禁用</option></select>
          <button className="btn" onClick={reset}><RotateCcw size={15} />重置</button>
        </div>
      </div>
      {selected.length > 0 ? <div className="case-batch-row">
        <label><input type="checkbox" checked={allSelected} onChange={event => setSelected(event.target.checked ? rows.map(item => item.id) : [])} />全部</label>
        <span>已选择 {selected.length} 项</span>
        <button onClick={() => dispatch({ type: "toggleCases", ids: selected, enabled: true })}>批量启用</button>
        <button className="danger-text" onClick={() => dispatch({ type: "toggleCases", ids: selected, enabled: false })}>批量禁用</button>
      </div> : null}
      <div className="case-table-wrap">
        <table className="case-library-table">
          <thead><tr><th className="case-check-cell"><input aria-label="全选" type="checkbox" checked={allSelected} onChange={event => setSelected(event.target.checked ? rows.map(item => item.id) : [])} /></th><th>用例编码</th><th>名称</th><th>描述</th><th>分类</th><th>数据源</th><th>任务类型</th><th>标签</th><th>启用</th><th>操作</th></tr></thead>
          <tbody>{rows.map(item => <tr key={item.id}>
            <td className="case-check-cell"><input aria-label={`选择${item.name}`} type="checkbox" checked={selected.includes(item.id)} onChange={event => setSelected(event.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))} /></td>
            <td><Link className="code-link" to={`/cases/${item.id}`}>{item.code}</Link></td>
            <td>{item.name}</td>
            <td className="case-description">{item.description || "—"}</td>
            <td>{item.category}</td><td>{item.dataSource || "—"}</td><td>{item.taskType}</td>
            <td>{item.tags.map(value => <span className="tag" key={value}>{value}</span>)}</td>
            <td><button className={`switch ${item.enabled ? "on" : ""}`} aria-label={`切换${item.name}`} onClick={() => dispatch({ type: "toggleCases", ids: [item.id], enabled: !item.enabled })} /></td>
            <td><div className="row-actions"><Link to={`/cases/${item.id}`} title="编辑"><Edit3 /></Link><button title="删除" onClick={() => confirm(`确认删除 ${item.name}？`) && dispatch({ type: "deleteCase", id: item.id })}><Trash2 /></button></div></td>
          </tr>)}</tbody>
        </table>
        {rows.length === 0 ? <EmptyState>没有找到匹配的测试用例</EmptyState> : null}
      </div>
      <div className="case-pagination"><span>共{Math.max(100, rows.length)}条</span><button disabled><ChevronLeft /></button><button className="active">1</button><button>2</button><button>3</button><button>4</button><button>5</button><span>…</span><button>10</button><button><ChevronRight /></button><select aria-label="每页条数"><option>10条/页</option><option>20条/页</option></select></div>
    </section>
  </div>;
}

const emptyCase = (): TestCase => ({
  id: `case-${Date.now()}`, code: `TC_AUTO_${Date.now().toString().slice(-4)}`, name: "", description: "",
  category: "", dataSource: "", taskType: "" as TestCase["taskType"], tags: ["基础", "冒烟"], enabled: true, smoke: false,
  result: "pending", taskName: "", items: [],
});

const newItem = (phase: CasePhase): CaseItem => ({
  id: `item-${Date.now()}`, phase, name: "", description: "", type: "create", enabled: true,
  timeout: 3000, config: "table_task_001", retry: true, continueOnFail: true,
});

export function CaseEditorPage() {
  const { caseId } = useParams();
  const { state, dispatch } = usePrototype();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<TestCase>(() => structuredClone(state.cases.find(item => item.id === caseId) || emptyCase()));
  const [activePhase, setActivePhase] = useState<CasePhase>("pre_test");
  const [drawerItem, setDrawerItem] = useState<CaseItem | null>(null);
  const [tagInput, setTagInput] = useState("");
  const phaseItems = draft.items.filter(item => item.phase === activePhase);

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    dispatch({ type: "saveCase", value: draft });
    navigate("/cases");
  };
  const saveDraft = () => dispatch({ type: "saveCase", value: draft });
  const addTag = () => {
    const value = tagInput.trim();
    if (value && !draft.tags.includes(value)) setDraft(current => ({ ...current, tags: [...current.tags, value] }));
    setTagInput("");
  };
  const saveDrawerItem = () => {
    if (!drawerItem?.name.trim()) return;
    setDraft(current => {
      const exists = current.items.some(item => item.id === drawerItem.id);
      return { ...current, items: exists ? current.items.map(item => item.id === drawerItem.id ? drawerItem : item) : [...current.items, drawerItem] };
    });
    setDrawerItem(null);
  };

  return <form className="case-editor-page" onSubmit={save}>
    <section className="case-editor-basic">
      <label>用例名称<input aria-label="用例名称" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="请输入用例名称" required /></label>
      <label className="wide">用例描述<input aria-label="用例描述" value={draft.description || ""} onChange={event => setDraft({ ...draft, description: event.target.value })} placeholder="请输入用例描述" /></label>
    </section>
    <section className="case-editor-config">
      <label>任务类型<select aria-label="任务类型" value={draft.taskType} onChange={event => setDraft({ ...draft, taskType: event.target.value as TestCase["taskType"] })}><option value="" disabled hidden>请选择任务类型</option><option>REALTIME</option><option>FULL</option><option>FULL_REALTIME</option></select></label>
      <label>功能分类<select aria-label="功能分类" value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })}><option value="" disabled hidden>请选择功能分类</option><option>CDC同步</option><option>DDL同步</option><option>全局规则</option><option>异常场景</option></select></label>
      <label>数据源类型<select aria-label="数据源类型" value={draft.dataSource} onChange={event => setDraft({ ...draft, dataSource: event.target.value })}><option value="" disabled hidden>请选择数据源类型</option><option>MySQL</option><option>Oracle</option><option>PostgreSQL</option><option>SQLServer</option></select></label>
      <label>约定任务名<input value={draft.taskName || ""} onChange={event => setDraft({ ...draft, taskName: event.target.value })} placeholder="请输入约定任务名" /></label>
      <label>标签<div className="case-tag-input">{draft.tags.map(value => <span className="tag removable-tag" key={value}>{value}<button type="button" aria-label={`删除标签 ${value}`} onClick={() => setDraft(current => ({ ...current, tags: current.tags.filter(tag => tag !== value) }))}><X size={12} /></button></span>)}<input value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} placeholder="输入标签后按回车" /></div></label>
    </section>
    <section className="case-phase-workspace">
      <div className="case-phase-toolbar"><span>三阶段动作编排</span><button type="button" className="btn primary" onClick={() => setDrawerItem(newItem(activePhase))}>添加子项</button></div>
      <div className="case-phase-body">
        <nav className="case-phase-nav" aria-label="动作阶段">
          {(Object.keys(phaseMeta) as CasePhase[]).map(phase => {
            const count = draft.items.filter(item => item.phase === phase).length;
            return <button type="button" className={activePhase === phase ? "active" : ""} key={phase} onClick={() => setActivePhase(phase)}><b>{phaseMeta[phase].title}</b><span>{phaseMeta[phase].subtitle} · {count} 项</span></button>;
          })}
        </nav>
        <div className="case-phase-list">
          {phaseItems.map(item => <article className="case-action-card" key={item.id} onClick={() => setDrawerItem(structuredClone(item))}>
            <div><b>{item.name}</b><span className="action-type">{item.type}</span><button type="button" className={`switch ${item.enabled ? "on" : ""}`} onClick={event => { event.stopPropagation(); setDraft(current => ({ ...current, items: current.items.map(value => value.id === item.id ? { ...value, enabled: !value.enabled } : value) })); }} /></div>
            <p>{item.timeout}ms　{item.retry ? "可重试" : "不重试"}　{item.continueOnFail ? "失败继续" : "失败中断"}</p>
            {item.type === "custom_sql" && item.config ? <pre>{item.config}</pre> : null}
          </article>)}
          {phaseItems.length === 0 ? <EmptyState>当前阶段暂无子项，点击“添加子项”开始配置</EmptyState> : null}
        </div>
      </div>
    </section>
    <footer className="case-editor-footer"><button type="button" className="btn" onClick={() => navigate("/cases")}>返回</button><button type="button" className="btn" onClick={saveDraft}>保存草稿</button><button type="button" className="btn">校验用例</button><button className="btn primary">保存</button></footer>
    {drawerItem ? <CaseItemDrawer item={drawerItem} onChange={setDrawerItem} onClose={() => setDrawerItem(null)} onSave={saveDrawerItem} /> : null}
  </form>;
}

function CaseItemDrawer({ item, onChange, onClose, onSave }: { item: CaseItem; onChange: (item: CaseItem) => void; onClose: () => void; onSave: () => void }) {
  const customSql = item.type === "custom_sql";
  return <div className="case-drawer-layer">
    <button type="button" className="case-drawer-mask" aria-label="关闭抽屉" onClick={onClose} />
    <aside className="case-item-drawer" role="dialog" aria-modal="true" aria-label="新增子项">
      <header><h2>新增子项</h2><button type="button" onClick={onClose}><X /></button></header>
      <div className="case-drawer-form">
        <div className="two-columns drawer-primary-row"><label>名称<input value={item.name} onChange={event => onChange({ ...item, name: event.target.value })} placeholder="请输入子项名称" /></label><label>阶段类型<input aria-label="阶段类型" value={phaseMeta[item.phase].title} disabled /></label></div>
        <label>描述<input value={item.description || ""} onChange={event => onChange({ ...item, description: event.target.value })} placeholder="请输入子项描述" /></label>
        <div className="two-columns"><label>动作类型<select value={item.type} onChange={event => onChange({ ...item, type: event.target.value })}><option>create</option><option>truncate</option><option>check_task</option><option>custom_sql</option></select></label><label>超时（ms）<input type="number" value={item.timeout} onChange={event => onChange({ ...item, timeout: Number(event.target.value) })} /></label></div>
        {customSql ? <label>SQL<textarea className="sql-textarea" value={item.config || ""} onChange={event => onChange({ ...item, config: event.target.value })} /></label> : <label>表名 / 动态配置<input value={item.config || ""} onChange={event => onChange({ ...item, config: event.target.value })} placeholder="table_task_001" /><small>可配置索引和约束</small></label>}
        <div className="drawer-checks"><label><input type="checkbox" checked={item.retry || false} onChange={event => onChange({ ...item, retry: event.target.checked })} />可重试</label><label><input type="checkbox" checked={item.continueOnFail || false} onChange={event => onChange({ ...item, continueOnFail: event.target.checked })} />失败后继续</label></div>
      </div>
      <footer><button type="button" className="btn" onClick={onClose}>取消</button><button type="button" className="btn primary" onClick={onSave}>保存子项</button></footer>
    </aside>
  </div>;
}
