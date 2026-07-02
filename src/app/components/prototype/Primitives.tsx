import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="page-title-row"><div><h1>{title}</h1><div className="subtitle">{subtitle}</div></div><div className="page-actions">{actions}</div></div>;
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{title ? <div className="panel-head"><span className="panel-title">{title}</span>{action}</div> : null}{children}</section>;
}

export function StatusBadge({ status, children }: { status: string; children: ReactNode }) {
  return <span className={`status ${status}`}>● {children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}
