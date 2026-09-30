import { describe, expect, it } from "bun:test";
import { resolveSiteTitle } from "./siteTitle";

describe("resolveSiteTitle", () => {
  it("should return customTitle when behavior is custom and customTitle is non-blank", () => {
    const result = resolveSiteTitle({
      siteName: "神楽的博客",
      brand: { logo: "", title: "", subtitle: "." },
      home: { title: { behavior: "custom", customTitle: "神楽的博客" } },
    });
    expect(result).toBe("神楽的博客");
  });

  it("should trim customTitle when behavior is custom", () => {
    const result = resolveSiteTitle({
      home: { title: { behavior: "custom", customTitle: "  My Site  " } },
    });
    expect(result).toBe("My Site");
  });

  it("should fall through to brand composition when custom behavior has a blank customTitle", () => {
    const result = resolveSiteTitle({
      siteName: "神楽的博客",
      brand: { title: "Brand", subtitle: "Sub" },
      home: { title: { behavior: "custom", customTitle: "   " } },
    });
    expect(result).toBe("Brand = Sub");
  });

  it("should fall through to brand composition when custom behavior has a missing customTitle", () => {
    const result = resolveSiteTitle({
      siteName: "神楽的博客",
      brand: { title: "Brand" },
      home: { title: { behavior: "custom" } },
    });
    expect(result).toBe("Brand");
  });

  it("should keep only non-empty brand parts for default behavior", () => {
    const result = resolveSiteTitle({
      siteName: "神楽的博客",
      brand: { logo: "", title: "", subtitle: "." },
      home: { title: { behavior: "default" } },
    });
    expect(result).toBe(".");
  });

  it("should join non-empty brand parts with ' = ' in logo/title/subtitle order", () => {
    const result = resolveSiteTitle({
      brand: { logo: "✨", title: "Title", subtitle: "Subtitle" },
      home: { title: { behavior: "default" } },
    });
    expect(result).toBe("✨ = Title = Subtitle");
  });

  it("should drop blank brand parts before joining", () => {
    const result = resolveSiteTitle({
      brand: { logo: "  ", title: "Title", subtitle: "   " },
      home: { title: { behavior: "default" } },
    });
    expect(result).toBe("Title");
  });

  it("should fall back to siteName when all brand parts are empty", () => {
    const result = resolveSiteTitle({
      siteName: "神楽的博客",
      brand: { logo: "", title: "", subtitle: "" },
    });
    expect(result).toBe("神楽的博客");
  });

  it("should return the default title when everything is empty", () => {
    const result = resolveSiteTitle({});
    expect(result).toBe("ShokaX");
  });

  it("should be safe with missing nested fields", () => {
    const result = resolveSiteTitle({ brand: {}, home: {} });
    expect(result).toBe("ShokaX");
  });
});
