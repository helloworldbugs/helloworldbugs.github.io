import { describe, expect, it } from "bun:test";
import { stripMarkdown } from "./stripMarkdown";

describe("stripMarkdown", () => {
  it("returns empty string for empty or whitespace-only input", () => {
    expect(stripMarkdown("")).toBe("");
    expect(stripMarkdown("   \n\t  ")).toBe("");
    // eslint-disable-next-line no-unsafe-type-assertion
    expect(stripMarkdown(undefined as any)).toBe("");
  });

  it("removes heading markers at line start", () => {
    expect(stripMarkdown("# Title")).toBe("Title");
    expect(stripMarkdown("## Sub\n### Deeper")).toBe("Sub Deeper");
  });

  it("removes bold, italic and strike markers while keeping text", () => {
    expect(stripMarkdown("**bold** and *italic*")).toBe("bold and italic");
    expect(stripMarkdown("__bold__ and _italic_")).toBe("bold and italic");
    expect(stripMarkdown("~~struck~~")).toBe("struck");
  });

  it("removes inline code backticks while keeping the inner text", () => {
    expect(stripMarkdown("use `const x = 1;` here")).toBe("use const x = 1; here");
    expect(stripMarkdown("`snake_case_name`")).toBe("snake_case_name");
  });

  it("removes fenced code blocks including the fence lines and content", () => {
    expect(stripMarkdown("before\n```js\nconst a = 1;\n```\nafter")).toBe("before after");
    expect(stripMarkdown("before\n~~~\nplain\n~~~\nafter")).toBe("before after");
  });

  it("keeps link labels and image alt text", () => {
    expect(stripMarkdown("see [the docs](https://example.com)")).toBe("see the docs");
    expect(stripMarkdown("![a diagram](img.png)")).toBe("a diagram");
    expect(stripMarkdown("![](img.png)")).toBe("");
  });

  it("removes blockquote markers at line start", () => {
    expect(stripMarkdown("> quoted line\n> more")).toBe("quoted line more");
  });

  it("removes unordered and ordered list markers at line start", () => {
    expect(stripMarkdown("- one\n- two\n+ three\n* four")).toBe("one two three four");
    expect(stripMarkdown("1. one\n2. two\n3) three")).toBe("one two three");
  });

  it("drops setext heading underlines", () => {
    expect(stripMarkdown("Title\n-----\nbody")).toBe("Title body");
    expect(stripMarkdown("Title\n===\nbody")).toBe("Title body");
  });

  it("drops horizontal rules", () => {
    expect(stripMarkdown("a\n***\nb")).toBe("a b");
    expect(stripMarkdown("a\n* * *\nb")).toBe("a b");
    expect(stripMarkdown("a\n____\nb")).toBe("a b");
  });

  it("flattens markdown tables into readable text", () => {
    expect(stripMarkdown("| a | b |\n|---|---|\n| 1 | 2 |")).toBe("a b 1 2");
    expect(stripMarkdown("| x | y |\n|:--|--:|\n| 1 | 2 |")).toBe("x y 1 2");
  });

  it("does not strip content that merely resembles a marker", () => {
    expect(stripMarkdown("id=1&#39;")).toBe("id=1&#39;");
    expect(stripMarkdown("SLEEP(5)#")).toBe("SLEEP(5)#");
  });

  it("does not confuse list items or bold text with rules", () => {
    expect(stripMarkdown("- item")).toBe("item");
    expect(stripMarkdown("1. item")).toBe("item");
    expect(stripMarkdown("**bold**")).toBe("bold");
    expect(stripMarkdown("__bold__")).toBe("bold");
  });

  it("removes HTML tags and comments", () => {
    expect(stripMarkdown("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
    expect(stripMarkdown("a <!-- hidden --> b")).toBe("a b");
  });

  it("strips a leading YAML frontmatter block", () => {
    expect(stripMarkdown("---\ntitle: x\n---\n# Heading\nbody")).toBe("Heading body");
  });

  it("collapses whitespace runs and trims", () => {
    expect(stripMarkdown("a\n\n\nb\tc   d")).toBe("a b c d");
  });

  it("is safe on partial or unterminated syntax", () => {
    expect(stripMarkdown("**unclosed and `backtick")).toBe("unclosed and backtick");
    expect(stripMarkdown("```\nunterminated code")).toBe("unterminated code");
    expect(stripMarkdown(">")).toBe("");
  });

  it("handles a mixed real-world sample", () => {
    const sample = [
      "# Getting Started",
      "",
      "Some **bold** text with a [link](https://example.com) and `inline code`.",
      "",
      "```ts",
      "const secret = 1;",
      "```",
      "",
      "> A quote",
      "",
      "- item one",
      "- item two",
      "",
      "![diagram](img.png)",
    ].join("\n");

    expect(stripMarkdown(sample)).toBe(
      "Getting Started Some bold text with a link and inline code. A quote item one item two diagram",
    );
  });
});
