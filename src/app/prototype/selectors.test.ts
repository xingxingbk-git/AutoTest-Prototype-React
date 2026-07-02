import { describe, expect, it } from "vitest";
import { seedState } from "./seed";
import { dashboardMetrics, recentFailures } from "./selectors";

describe("prototype selectors", () => {
  it("derives task-centric dashboard metrics", () => {
    expect(dashboardMetrics(seedState)).toEqual({
      enabledCases: 3,
      tasks: 3,
      passRate: 50,
      abnormalEnvironments: 1,
    });
  });

  it("returns failed and warning results newest first", () => {
    expect(recentFailures(seedState).map((item) => item.caseName)).toEqual([
      "订单状态变更",
      "库存扣减同步",
    ]);
  });
});
