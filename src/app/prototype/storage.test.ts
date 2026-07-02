import { describe, expect, it } from "vitest";
import { seedState } from "./seed";
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  loadPrototypeState,
  savePrototypeState,
} from "./storage";

describe("prototype storage", () => {
  it("returns seed data when no cache exists", () => {
    expect(loadPrototypeState()).toEqual(seedState);
  });

  it("falls back to seed data for broken or stale cache", () => {
    localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadPrototypeState()).toEqual(seedState);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION - 1, data: { cases: [] } }),
    );
    expect(loadPrototypeState()).toEqual(seedState);
  });

  it("stores data inside a versioned envelope", () => {
    savePrototypeState(seedState);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({
      version: STORAGE_VERSION,
      data: seedState,
    });
  });
});
