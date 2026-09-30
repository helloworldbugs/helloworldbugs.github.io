import { describe, expect, it } from "bun:test";
import { sliceByCodePoints } from "./sliceByCodePoints";

/** True when `value` contains an unpaired UTF-16 surrogate code unit. */
function hasLoneSurrogate(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return true;
      }
      index += 1;
      continue;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      return true;
    }
  }
  return false;
}

describe("sliceByCodePoints", () => {
  it("slices plain ASCII by code points", () => {
    expect(sliceByCodePoints("hello world", 5)).toBe("hello");
    expect(sliceByCodePoints("hello world", 100)).toBe("hello world");
  });

  it("slices CJK text by code points", () => {
    expect(sliceByCodePoints("你好世界你好", 3)).toBe("你好世");
    expect(sliceByCodePoints("你好世界你好", 6)).toBe("你好世界你好");
  });

  it("keeps surrogate pairs intact at the boundary", () => {
    const input = "😀abc";

    const limitedToOne = sliceByCodePoints(input, 1);
    expect(limitedToOne).toBe("😀");
    expect(Array.from(limitedToOne)).toHaveLength(1);
    expect(hasLoneSurrogate(limitedToOne)).toBe(false);
    expect(limitedToOne).not.toContain("\uFFFD");

    // The legacy UTF-16 slice cuts the emoji in half.
    expect(hasLoneSurrogate(input.slice(0, 1))).toBe(true);

    const limitedToTwo = sliceByCodePoints(input, 2);
    expect(limitedToTwo).toBe("😀a");
    expect(Array.from(limitedToTwo)).toHaveLength(2);
    expect(hasLoneSurrogate(limitedToTwo)).toBe(false);
  });

  it("returns an empty string for empty input", () => {
    expect(sliceByCodePoints("", 5)).toBe("");
  });

  it("returns the whole string when the limit exceeds its code point count", () => {
    const input = "😀你好";
    const result = sliceByCodePoints(input, 10);

    expect(result).toBe(input);
    expect(Array.from(result)).toHaveLength(3);
  });

  it("returns an empty string for a non-positive limit", () => {
    expect(sliceByCodePoints("abc", 0)).toBe("");
    expect(sliceByCodePoints("abc", -1)).toBe("");
  });
});
