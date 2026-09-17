import { describe, expect, it } from "vitest";
import { validateConfig } from "../src/config";
describe("configuration", () => {
  it("defaults individual cards and preserves future settings and explicit false or empty values", () => {
    expect(
      validateConfig({
        type: "custom:oven-card",
        device: "My oven",
        future: { a: 1 },
        expand: false,
        confirm_start: false,
        oven_modules: [],
      }),
    ).toEqual({
      type: "custom:oven-card",
      device: "My oven",
      future: { a: 1 },
      expand: false,
      confirm_start: false,
      appearance: "default",
      oven_modules: [],
    });
    expect(
      validateConfig({ type: "custom:oven-card", device: "id" }),
    ).toMatchObject({
      expand: true,
      confirm_start: true,
      oven_modules: "auto",
    });
  });
  it("normalizes module duplicates without mutating the source", () => {
    const raw = {
      type: "custom:oven-card",
      device: "id",
      oven_modules: ["steam", "microwave", "steam"],
    };
    expect(validateConfig(raw).oven_modules).toEqual(["steam", "microwave"]);
    expect(raw.oven_modules).toHaveLength(3);
  });
  it("allows overview filters and explicit empty selections", () => {
    expect(
      validateConfig({
        type: "custom:kitchen-panel-card",
        devices: [],
        area: "Kitchen",
      }),
    ).toMatchObject({ devices: [], area: "Kitchen" });
  });
  it.each([
    { type: "custom:oven-card" },
    { type: "custom:no-card", device: "id" },
    { type: "custom:oven-card", device: 2 },
    { type: "custom:oven-card", device: "id", expand: "false" },
    { type: "custom:oven-card", device: "id", confirm_start: 0 },
    { type: "custom:oven-card", device: "id", appearance: "bad" },
    { type: "custom:oven-card", device: "id", oven_modules: ["bad"] },
    { type: "custom:kitchen-panel-card", devices: [3] },
    { type: "custom:kitchen-panel-card", area: 3 },
    { type: "custom:oven-card", device: "  " },
    { type: "custom:oven-card", device: "id", title: 3 },
  ])("rejects invalid fields %j", (raw) =>
    expect(() => validateConfig(raw)).toThrow(),
  );
});
