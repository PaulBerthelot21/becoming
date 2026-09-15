import { describe, expect, it } from "vitest";
import {
  blobPathnameFromUrl,
  isVercelBlobUrl,
  mealBlobBelongsToUser,
  mealImageSrc,
} from "@/lib/blob";

describe("lib/blob", () => {
  it("accepts public and private vercel blob hosts", () => {
    expect(isVercelBlobUrl("https://abc.public.blob.vercel-storage.com/meals/u/1.png")).toBe(true);
    expect(isVercelBlobUrl("https://abc.private.blob.vercel-storage.com/meals/u/1.png")).toBe(true);
    expect(isVercelBlobUrl("https://evil.com/meals/u/1.png")).toBe(false);
    expect(isVercelBlobUrl("not-a-url")).toBe(false);
  });

  it("extracts pathname and checks ownership", () => {
    const url = "https://abc.private.blob.vercel-storage.com/meals/user-1/123.png";
    expect(blobPathnameFromUrl(url)).toBe("meals/user-1/123.png");
    expect(mealBlobBelongsToUser(url, "user-1")).toBe(true);
    expect(mealBlobBelongsToUser(url, "user-2")).toBe(false);
  });

  it("builds proxy src", () => {
    const url = "https://abc.private.blob.vercel-storage.com/meals/u/1.png";
    expect(mealImageSrc(url)).toBe(`/api/blob/file?url=${encodeURIComponent(url)}`);
  });
});
