import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../App";

describe("test case module", () => {
  it("renders the screenshot-aligned case library without copy actions", () => {
    history.pushState({}, "", "/cases");
    render(<App />);

    expect(screen.getByRole("heading", { name: "用例库" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "描述" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "操作" })).toBeInTheDocument();
    expect(screen.getAllByTitle("编辑").length).toBeGreaterThan(0);
    expect(screen.getAllByTitle("删除").length).toBeGreaterThan(0);
    expect(screen.queryByTitle("复制")).not.toBeInTheDocument();
    expect(screen.queryByText("批量启用")).not.toBeInTheDocument();
  });

  it("renders the new case form with three parallel phase columns and drawer entries", () => {
    history.pushState({}, "", "/cases/new");
    render(<App />);

    expect(screen.getByLabelText("用例名称")).toBeInTheDocument();
    expect(screen.getByLabelText("用例描述")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "三阶段动作编排" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加 PRE_TEST 子项" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加 TEST 子项" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加 POST_TEST 子项" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存草稿" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "校验用例" })).toBeInTheDocument();
    const phaseRegion = screen.getByRole("region", { name: "三阶段动作编排" });
    expect(within(phaseRegion).getByText("PRE_TEST", { exact: true })).toBeInTheDocument();
    expect(within(phaseRegion).getByText("TEST", { exact: true })).toBeInTheDocument();
    expect(within(phaseRegion).getByText("POST_TEST", { exact: true })).toBeInTheDocument();
  });

  it("supports removable tags, hidden select placeholders and a readonly drawer phase", async () => {
    const user = userEvent.setup();
    history.pushState({}, "", "/cases/new");
    render(<App />);

    const taskTypeSelect = screen.getByRole("combobox", { name: "任务类型" });
    const categorySelect = screen.getByRole("combobox", { name: "功能分类" });
    const dataSourceSelect = screen.getByRole("combobox", { name: "数据源类型" });
    expect(taskTypeSelect).toHaveValue("");
    expect(taskTypeSelect.querySelector('option[value=""]')).toHaveAttribute("hidden");
    expect(categorySelect.querySelector('option[value=""]')).toHaveAttribute("hidden");
    expect(dataSourceSelect.querySelector('option[value=""]')).toHaveAttribute("hidden");

    const removeBaseTag = screen.getByRole("button", { name: "删除标签 基础" });
    await user.click(removeBaseTag);
    expect(screen.queryByText("基础", { selector: ".case-tag-input .tag" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "添加 PRE_TEST 子项" }));
    expect(screen.getByLabelText("阶段类型")).toBeDisabled();
    expect(screen.getByLabelText("阶段类型")).toHaveValue("PRE_TEST");
  });
});
