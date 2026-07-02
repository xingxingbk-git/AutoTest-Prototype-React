import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { PrototypeProvider } from "./prototype/store";
import { AppShell } from "./layout/AppShell";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { CasesPage, CaseEditorPage } from "./features/cases/CasesPage";
import { TasksPage, TaskDetailPage, TaskEditorPage } from "./features/tasks/TasksPage";

export default function App() {
  return (
    <PrototypeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/new" element={<CaseEditorPage />} />
            <Route path="/cases/:caseId" element={<CaseEditorPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/new" element={<TaskEditorPage />} />
            <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="/tasks/:taskId/edit" element={<TaskEditorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PrototypeProvider>
  );
}
