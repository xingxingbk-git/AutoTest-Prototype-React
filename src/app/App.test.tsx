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
    expect(screen.queryByText("执行批次")).not.toBeInTheDocument();
  });
});
