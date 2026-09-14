import { describe, expect, it } from "vitest";
import { isEmailAllowed } from "@/lib/allowed-emails";

describe("isEmailAllowed", () => {
  it("returns false when ALLOWED_EMAILS is empty", () => {
    const previous = process.env.ALLOWED_EMAILS;
    delete process.env.ALLOWED_EMAILS;

    expect(isEmailAllowed("me@example.com")).toBe(false);

    process.env.ALLOWED_EMAILS = previous;
  });

  it("matches emails case-insensitively", () => {
    const previous = process.env.ALLOWED_EMAILS;
    process.env.ALLOWED_EMAILS = "Me@Example.com, other@test.com";

    expect(isEmailAllowed("me@example.com")).toBe(true);
    expect(isEmailAllowed("OTHER@test.com")).toBe(true);
    expect(isEmailAllowed("nope@test.com")).toBe(false);

    process.env.ALLOWED_EMAILS = previous;
  });
});
