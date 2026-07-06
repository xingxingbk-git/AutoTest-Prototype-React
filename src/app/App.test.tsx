import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("application shell", () => {
  it("shows the three modules and task-centric dashboard", () => {
    history.pushState({}, "", "/dashboard");
    render(<App />);
    expect(screen.getByText("自动化测试平台")).toBeInTheDocument();
    const navigation = screen.getByRole("navigation", { name: "主导航" });
    expect(within(navigation).getByRole("link", { name: "工作台" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "测试用例" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "测试任务" })).toBeInTheDocument();
    expect(screen.getByText("自动化测试工作台")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新建用例" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "新建任务" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "执行任务" })).toBeInTheDocument();
    for (const title of ["正在执行的测试任务", "最近一次任务执行结果", "最近失败记录", "环境健康状态", "系统动态"]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
    for (const label of ["启用测试用例", "测试任务", "最近执行通过率", "异常环境"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.queryByText("执行批次")).not.toBeInTheDocument();
  });
});
