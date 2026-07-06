import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../App";

describe("测试任务模块新版原型", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("展示设计稿中的任务列表，并仅在选中任务后显示批量操作", () => {
    history.pushState({}, "", "/tasks");
    render(<App />);

    expect(screen.getByRole("heading", { name: "测试任务" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("搜索任务名称")).toBeInTheDocument();
    expect(screen.getByText("共享执行源")).toBeInTheDocument();
    expect(screen.queryByText("批量执行")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(screen.getByText("批量执行")).toBeInTheDocument();
    expect(screen.getByText("已选择 1 项")).toBeInTheDocument();
  });

  it("新建任务在同一页面完成环境、数据源、用例和任务映射配置", () => {
    history.pushState({}, "", "/tasks/new");
    render(<App />);

    expect(screen.getByText("基本信息")).toBeInTheDocument();
    expect(screen.getByText("环境与任务配置")).toBeInTheDocument();
    expect(screen.getByText("用例配置")).toBeInTheDocument();
    expect(screen.getByText("预发环境 83")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("搜索数据源或用例")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "添加数据源" }));
    expect(screen.getByRole("dialog", { name: "添加数据源" })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("选择本地MySQL8"));
    fireEvent.click(screen.getByRole("button", { name: "添加" }));

    expect(screen.getAllByText("本地MySQL8")).toHaveLength(2);
    fireEvent.click(screen.getByLabelText("选择配置数据源本地MySQL8"));
    fireEvent.click(screen.getByRole("button", { name: "配置用例" }));
    expect(screen.getByRole("dialog", { name: "配置用例" })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("选择DDL 新增字段同步"));
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));

    fireEvent.click(screen.getByRole("button", { name: "查看数据源本地MySQL8" }));
    fireEvent.click(screen.getByRole("button", { name: "配置实例DDL 新增字段同步" }));
    expect(screen.getAllByText("DDL_ADD_COL_001").length).toBeGreaterThan(0);
    expect(screen.getByRole("columnheader", { name: "环境" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "关联任务" })).toBeInTheDocument();
  });

  it("详情页包含三种视图和执行参数弹窗", () => {
    history.pushState({}, "", "/tasks/task-1");
    render(<App />);

    expect(screen.getByText("配置统计")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "用例实例" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("执行历史")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "监控实例" }));
    expect(screen.getByText("监控实例明细")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "统计报告" }));
    expect(screen.getByText("用例分类占比")).toBeInTheDocument();
    expect(screen.getByText("监控执行结果")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "开始执行" }));
    const dialog = screen.getByRole("dialog", { name: "确认执行参数" });
    expect(within(dialog).getByLabelText("比对检查间隔")).toHaveValue(1000);
    expect(within(dialog).getByRole("button", { name: "执行" })).toBeInTheDocument();
  });

  it("监控实例明细展示需求文档规定的字段并可查看差异样例", () => {
    history.pushState({}, "", "/tasks/task-1");
    render(<App />);

    fireEvent.click(screen.getByRole("tab", { name: "监控实例" }));
    const table = screen.getByRole("table", { name: "监控实例明细列表" });
    for (const column of ["关联用例实例", "同步任务 / 比对任务", "全量同步状态", "比对模式", "差异数", "差异样例", "状态", "消息"]) {
      expect(within(table).getByRole("columnheader", { name: column })).toBeInTheDocument();
    }
    expect(within(table).getByRole("button", { name: "同步任务 oracle_CDC_INSERT_001_task_PRE" })).toBeInTheDocument();
    expect(within(table).getByRole("button", { name: "比对任务 oracle_CDC_INSERT_001_task_PRE_check" })).toBeInTheDocument();

    fireEvent.click(within(table).getByRole("button", { name: "查看差异样例" }));
    expect(screen.getByRole("dialog", { name: "查看差异样例" })).toBeInTheDocument();
    expect(screen.getByText("source_record")).toBeInTheDocument();
    expect(screen.getByText("target_record")).toBeInTheDocument();
  });

  it("比对明细使用宽弹窗并展示每个环境动作的执行结果", () => {
    history.pushState({}, "", "/tasks/task-1");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "配置实例Oracle 插入实时同步" }));
    fireEvent.click(screen.getByRole("button", { name: "比对明细" }));
    const dialog = screen.getByRole("dialog", { name: "比对明细" });
    expect(dialog).toHaveClass("task-modal-wide");
    expect(within(dialog).getByRole("columnheader", { name: "环境" })).toBeInTheDocument();
    expect(within(dialog).getByRole("columnheader", { name: "执行结果" })).toBeInTheDocument();
    expect(within(dialog).getAllByText("成功").length).toBeGreaterThan(0);
    expect(within(dialog).getByText("失败")).toBeInTheDocument();
    expect(within(dialog).getByText("目标表状态值与预期不一致")).toBeInTheDocument();
  });

  it("支持多选数据源统一配置对应类型与共用用例", () => {
    history.pushState({}, "", "/tasks/new");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "添加数据源" }));
    fireEvent.click(screen.getByLabelText("选择本地MySQL8"));
    fireEvent.click(screen.getByLabelText("选择oracle19c"));
    fireEvent.click(screen.getByRole("button", { name: "添加" }));

    fireEvent.click(screen.getByLabelText("选择配置数据源本地MySQL8"));
    fireEvent.click(screen.getByLabelText("选择配置数据源oracle19c"));
    fireEvent.click(screen.getByRole("button", { name: "配置用例" }));

    const dialog = screen.getByRole("dialog", { name: "配置用例" });
    expect(within(dialog).getByText("DDL 新增字段同步")).toBeInTheDocument();
    expect(within(dialog).getByText("Oracle 插入实时同步")).toBeInTheDocument();
    expect(within(dialog).getByText("异常恢复与重试")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByLabelText("选择DDL 新增字段同步"));
    fireEvent.click(within(dialog).getByLabelText("选择Oracle 插入实时同步"));
    fireEvent.click(within(dialog).getByLabelText("选择异常恢复与重试"));
    fireEvent.click(within(dialog).getByRole("button", { name: "保存配置" }));

    fireEvent.click(screen.getByRole("button", { name: "查看数据源本地MySQL8" }));
    expect(screen.getAllByText("DDL 新增字段同步").length).toBeGreaterThan(0);
    expect(screen.getAllByText("异常恢复与重试").length).toBeGreaterThan(0);
    expect(screen.queryByText("Oracle 插入实时同步")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "查看数据源oracle19c" }));
    expect(screen.getAllByText("Oracle 插入实时同步").length).toBeGreaterThan(0);
    expect(screen.getAllByText("异常恢复与重试").length).toBeGreaterThan(0);
    expect(screen.queryByText("DDL 新增字段同步")).not.toBeInTheDocument();
  });

  it("数据源树按当前实例切换右侧匹配的环境任务", () => {
    history.pushState({}, "", "/tasks/new");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "添加数据源" }));
    fireEvent.click(screen.getByLabelText("选择本地MySQL8"));
    fireEvent.click(screen.getByLabelText("选择oracle19c"));
    fireEvent.click(screen.getByRole("button", { name: "添加" }));
    fireEvent.click(screen.getByLabelText("选择配置数据源本地MySQL8"));
    fireEvent.click(screen.getByRole("button", { name: "配置用例" }));
    fireEvent.click(screen.getByLabelText("选择DDL 新增字段同步"));
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));
    fireEvent.click(screen.getByRole("button", { name: "配置实例DDL 新增字段同步" }));
    expect(screen.getByText("本地MySQL8 · DDL同步")).toBeInTheDocument();
    expect(screen.queryByText("oracle_CDC_INSERT_001_task_PRE")).not.toBeInTheDocument();
  });

  it("用例和监控实例表格始终显示重新执行按钮并按勾选状态启用", () => {
    history.pushState({}, "", "/tasks/task-1");
    render(<App />);

    const caseButton = screen.getByRole("button", { name: "重新执行所选用例实例" });
    expect(caseButton).toBeDisabled();
    fireEvent.click(screen.getByLabelText("选择用例实例Oracle 插入实时同步"));
    expect(screen.getByText("已选择 1 项")).toBeInTheDocument();
    expect(caseButton).toBeEnabled();

    fireEvent.click(screen.getByRole("tab", { name: "监控实例" }));
    const monitorButton = screen.getByRole("button", { name: "重新执行所选监控实例" });
    expect(monitorButton).toBeDisabled();
    fireEvent.click(screen.getByLabelText("选择监控实例Oracle 插入实时同步"));
    expect(screen.getByText("已选择 1 项")).toBeInTheDocument();
    expect(monitorButton).toBeEnabled();
  });
});
