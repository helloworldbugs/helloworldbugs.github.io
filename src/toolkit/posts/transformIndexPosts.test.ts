import { describe, expect, it } from "bun:test";
import { calculateReadTime, getExcerpt, transformIndexPosts } from "./transformIndexPosts";

type MockPost = {
  id: string;
  body?: string;
  data: {
    title: string;
    date: Date;
    description?: string;
    encrypted?: boolean;
    categories?: string[];
  };
};

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

describe("transformIndexPosts", () => {
  it("calculates read time with ceil strategy", () => {
    expect(calculateReadTime(0)).toBe(0);
    expect(calculateReadTime(1)).toBe(1);
    expect(calculateReadTime(300)).toBe(1);
    expect(calculateReadTime(301)).toBe(2);
  });

  it("returns encrypted excerpt when post is encrypted", () => {
    const post: MockPost = {
      id: "encrypted-post",
      body: "secret content",
      data: {
        title: "Encrypted",
        date: new Date("2025-01-01T00:00:00Z"),
        encrypted: true,
        description: "should not show",
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(post as any, "[ENCRYPTED]")).toBe("[ENCRYPTED]");
  });

  it("prioritizes description, then falls back to body excerpt", () => {
    const withDescription: MockPost = {
      id: "with-description",
      body: "this body should not be used",
      data: {
        title: "With Description",
        date: new Date("2025-01-01T00:00:00Z"),
        description: "description first",
      },
    };

    const longBody = "a".repeat(350);
    const withoutDescription: MockPost = {
      id: "without-description",
      body: longBody,
      data: {
        title: "Without Description",
        date: new Date("2025-01-01T00:00:00Z"),
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(withDescription as any, "[ENCRYPTED]")).toBe("description first");
    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(withoutDescription as any, "[ENCRYPTED]")).toBe(longBody.slice(0, 300));
  });

  it("cleans markdown syntax in body-derived excerpts", () => {
    const post: MockPost = {
      id: "markdown-post",
      body: "# Title\n\n**bold** and `code`\n\n- item",
      data: {
        title: "Markdown",
        date: new Date("2025-01-04T00:00:00Z"),
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(post as any, "[ENCRYPTED]")).toBe("Title bold and code item");
  });

  it("builds transformed cards with url, category and stats", () => {
    const body = Array.from({ length: 301 }, (_, i) => `w${i}`).join(" ");
    const post: MockPost = {
      id: "folder/Hello World.md",
      body,
      data: {
        title: "Hello",
        date: new Date("2025-01-02T00:00:00Z"),
        categories: ["父级", "末级"],
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    const transformed = transformIndexPosts([post as any], {
      encryptedExcerpt: "[ENCRYPTED]",
      // eslint-disable-next-line no-unsafe-type-assertion
      resolveCover: () => "cover://test",
    });

    expect(transformed).toHaveLength(1);
    expect(transformed[0]).toMatchObject({
      title: "Hello",
      url: "/posts/folder/Hello%20World/",
      excerpt: body.slice(0, 300),
      category: "末级",
      categoryUrl: "/categories/%E6%9C%AB%E7%BA%A7/",
      wordCount: 301,
      readTime: 2,
      cover: "cover://test",
    });
  });

  it("returns undefined category fields when category list is empty", () => {
    const post: MockPost = {
      id: "no-category",
      body: "one two",
      data: {
        title: "No Category",
        date: new Date("2025-01-03T00:00:00Z"),
        categories: [],
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    const transformed = transformIndexPosts([post as any], {
      encryptedExcerpt: "[ENCRYPTED]",
    });

    expect(transformed[0].category).toBeUndefined();
    expect(transformed[0].categoryUrl).toBeUndefined();
  });

  it("prefers AI summary over description and body when provided", () => {
    const post: MockPost = {
      id: "ai-post",
      body: "body content",
      data: {
        title: "AI Post",
        date: new Date("2025-01-01T00:00:00Z"),
        description: "description text",
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(post as any, "[ENCRYPTED]", 300, "AI 摘要内容")).toBe("AI 摘要内容");
  });

  it("ignores blank AI summary and falls back to description", () => {
    const post: MockPost = {
      id: "blank-ai-post",
      body: "body content",
      data: {
        title: "Blank AI",
        date: new Date("2025-01-01T00:00:00Z"),
        description: "description text",
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(post as any, "[ENCRYPTED]", 300, "   ")).toBe("description text");
  });

  it("still uses encrypted excerpt for encrypted posts even with AI summary", () => {
    const post: MockPost = {
      id: "encrypted-ai-post",
      body: "secret",
      data: {
        title: "Encrypted AI",
        date: new Date("2025-01-01T00:00:00Z"),
        encrypted: true,
        description: "should not show",
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    expect(getExcerpt(post as any, "[ENCRYPTED]", 300, "AI 摘要内容")).toBe("[ENCRYPTED]");
  });

  it("uses AI summary from aiSummaries map when excerptSource is ai", () => {
    const post: MockPost = {
      id: "ai-source-post",
      body: "body content",
      data: {
        title: "AI Source",
        date: new Date("2025-01-01T00:00:00Z"),
        description: "description text",
      },
    };

    const aiSummaries = new Map<string, string>([["ai-source-post", "AI 摘要内容"]]);

    // eslint-disable-next-line no-unsafe-type-assertion
    const transformed = transformIndexPosts([post as any], {
      encryptedExcerpt: "[ENCRYPTED]",
      excerptSource: "ai",
      aiSummaries,
    });

    expect(transformed[0].excerpt).toBe("AI 摘要内容");
  });

  it("falls back to default excerpt when excerptSource is ai but no AI summary", () => {
    const post: MockPost = {
      id: "missing-ai-post",
      body: "body content here",
      data: {
        title: "Missing AI",
        date: new Date("2025-01-01T00:00:00Z"),
        description: "description text",
      },
    };

    // eslint-disable-next-line no-unsafe-type-assertion
    const transformed = transformIndexPosts([post as any], {
      encryptedExcerpt: "[ENCRYPTED]",
      excerptSource: "ai",
      aiSummaries: new Map(),
    });

    expect(transformed[0].excerpt).toBe("description text");
  });

  it("ignores aiSummaries when excerptSource is default", () => {
    const post: MockPost = {
      id: "default-source-post",
      body: "body content",
      data: {
        title: "Default Source",
        date: new Date("2025-01-01T00:00:00Z"),
        description: "description text",
      },
    };

    const aiSummaries = new Map<string, string>([["default-source-post", "AI 摘要内容"]]);

    // eslint-disable-next-line no-unsafe-type-assertion
    const transformed = transformIndexPosts([post as any], {
      encryptedExcerpt: "[ENCRYPTED]",
      excerptSource: "default",
      aiSummaries,
    });

    expect(transformed[0].excerpt).toBe("description text");
  });

  it("keeps surrogate pairs intact when the excerpt boundary falls inside an emoji", () => {
    const body = "abcde😀fghij";
    const post: MockPost = {
      id: "emoji-excerpt-post",
      body,
      data: {
        title: "Emoji Excerpt",
        date: new Date("2025-01-05T00:00:00Z"),
      },
    };

    // A UTF-16 slice(6) splits the emoji and leaves a lone high surrogate.
    expect(hasLoneSurrogate(body.slice(0, 6))).toBe(true);

    // eslint-disable-next-line no-unsafe-type-assertion
    const excerpt = getExcerpt(post as any, "[ENCRYPTED]", 6);

    expect(excerpt).toBe("abcde😀");
    expect(Array.from(excerpt)).toHaveLength(6);
    expect(hasLoneSurrogate(excerpt)).toBe(false);
    expect(excerpt).not.toContain("\uFFFD");
  });
});
