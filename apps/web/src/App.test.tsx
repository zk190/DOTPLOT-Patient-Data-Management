import { expect, it } from "vitest";
import { roles } from "@dotplot/shared";

it("supports the three clinical roles used by the UI", () => {
  expect(roles).toContain("RADIOLOGIST");
  expect(roles).toContain("NURSE");
  expect(roles).toContain("IT_ADMIN");
});
