import { describe, expect, it } from "vitest";
import { movingAverage } from "@/lib/date";

describe("movingAverage", () => {
  it("computes a trailing average and skips nulls", () => {
    expect(movingAverage([1, null, 3, 5], 2)).toEqual([1, 1, 3, 4]);
  });
});
