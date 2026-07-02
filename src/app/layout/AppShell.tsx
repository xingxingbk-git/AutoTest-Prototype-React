import { ChevronRight, User } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";

const labels: Record<string, string> = { dashboard: "工作台", cases: "测试用例", tasks: "测试任务", new: "新建" };

export function AppShell() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const current = parts[0] || "dashboard";
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span>自动化测试平台</span></div>
        <nav className="module-nav" aria-label="主导航">
          <NavLink to="/dashboard">工作台</NavLink>
          <NavLink to="/cases">测试用例</NavLink>
          <NavLink to="/tasks">测试任务</NavLink>
        </nav>
        <div className="top-actions">
          <button className="user-button"><span className="avatar"><User size={14} /></span>张工</button>
        </div>
      </header>
      <main className="main">
        <div className="crumbbar">
          {current === "cases" && parts.length > 1 ? <><NavLink to="/cases">用例库</NavLink><ChevronRight size={13} /><strong>{parts[1] === "new" ? "新建用例" : "编辑用例"}</strong></> : <NavLink to={`/${current}`}>{labels[current]}</NavLink>}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
