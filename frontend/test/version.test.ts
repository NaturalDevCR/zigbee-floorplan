import { describe, expect, it } from "vitest";
import { isStaleBundle, LOADED_BUNDLE_HASH } from "../src/version";

describe("isStaleBundle", () => {
  it("never reports stale without a served hash on both sides", () => {
    // tests load the module without ?v=, like the dev server
    expect(LOADED_BUNDLE_HASH).toBeNull();
    expect(isStaleBundle("abc123")).toBe(false);
    expect(isStaleBundle(null)).toBe(false);
    expect(isStaleBundle(undefined)).toBe(false);
  });
});
