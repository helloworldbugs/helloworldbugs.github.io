/**
 * Convert markdown source into readable plain text suitable for a one-line excerpt.
 *
 * The transformation is intentionally lossy but conservative:
 * - fenced code blocks and their content are dropped
 * - inline code backticks are removed while keeping the inner text
 * - images keep their alt text, links keep their label
 * - headings, blockquotes and list markers are unwrapped
 * - emphasis / strike markers are removed while keeping the text
 * - HTML tags and a leading YAML frontmatter block are stripped
 * - all whitespace runs collapse into single spaces
 *
 * Patterns are simple and anchored to avoid catastrophic backtracking, and the
 * function is safe on empty or partial syntax.
 */

/**
 * True for thematic breaks and setext underlines: a line made only of 3+ of
 * `-`, `=`, `_`, `*` (spaces allowed between the markers), e.g. `----`, `***`,
 * `* * *`, `___`, `===`. Lines containing any other character (bullets, bold
 * text, prose) are left alone.
 */
function isRuleLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return false;
  }

  let markers = 0;
  for (const char of trimmed) {
    if (char === " " || char === "\t") {
      continue;
    }
    if (char === "-" || char === "=" || char === "_" || char === "*") {
      markers += 1;
      continue;
    }
    return false;
  }

  return markers >= 3;
}

/**
 * True for markdown table separator rows: a line containing `|` whose only
 * characters are `|`, `-`, `:`, and whitespace (e.g. `|---|---|`, `|:--|--:|`).
 */
function isTableSeparatorLine(line: string): boolean {
  if (!line.includes("|") || !line.includes("-")) {
    return false;
  }

  for (const char of line) {
    if (char === "|" || char === "-" || char === ":" || char === " " || char === "\t") {
      continue;
    }
    return false;
  }

  return true;
}

/**
 * Strip structural markdown that survives on a per-line basis: setext underlines
 * and horizontal rules are dropped, table separator rows are dropped, and the
 * pipes of remaining table rows are turned into spaces so cell text stays readable.
 */
function stripStructuralLines(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      if (isRuleLine(line) || isTableSeparatorLine(line)) {
        return "";
      }
      if (line.includes("|")) {
        return line.replaceAll("|", " ");
      }
      return line;
    })
    .join("\n");
}

export function stripMarkdown(markdown: string): string {
  if (typeof markdown !== "string" || markdown.length === 0) {
    return "";
  }

  let text = markdown;

  // Defensive: drop a leading YAML frontmatter block.
  text = text.replace(/^\uFEFF?---[ \t]*\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/, "");

  // Remove fenced code blocks (``` and ~~~), including the fence lines and content.
  text = text.replaceAll(/```[\s\S]*?```/g, " ");
  text = text.replaceAll(/~~~[\s\S]*?~~~/g, " ");

  // Temporarily protect inline code so its inner text survives the rules below.
  const codeSpans: string[] = [];
  text = text.replaceAll(/`([^`\n]+)`/g, (_, code: string) => {
    const index = codeSpans.push(code) - 1;
    return `\u0000${index}\u0000`;
  });

  // Remove leftover fence lines (for example an unterminated opening fence).
  text = text.replaceAll(/^[ \t]*(?:`{3,}|~{3,})[^\n]*$/gm, " ");

  // Drop setext underlines, horizontal rules and table separator rows, and
  // flatten table rows (pipes were already removed inside fenced code blocks).
  text = stripStructuralLines(text);

  // Images: keep the alt text only.
  text = text.replaceAll(/!\[([^\]]*)\]\([^)]*\)/g, "$1");

  // Links: keep the label only.
  text = text.replaceAll(/\[([^\]]*)\]\([^)]*\)/g, "$1");

  // HTML comments and tags.
  text = text.replaceAll(/<!--[\s\S]*?-->/g, " ");
  text = text.replaceAll(/<\/?[a-zA-Z][^>]*>/g, "");

  // Line-leading structural markers.
  text = text.replaceAll(/^[ \t]{0,3}#{1,6}[ \t]*/gm, "");
  text = text.replaceAll(/^[ \t]{0,3}>[ \t]?/gm, "");
  text = text.replaceAll(/^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+/gm, "");

  // Emphasis / strike markers, keeping the inner text.
  text = text.replaceAll(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "$2");
  text = text.replaceAll(/~~(?=\S)([\s\S]*?\S)~~/g, "$1");
  text = text.replaceAll(/([*_])(?=\S)([^*_]*?\S)\1/g, "$2");

  // Remove leftover unmatched emphasis markers and stray backticks.
  text = text.replaceAll(/[*_~]+/g, "");
  text = text.replaceAll(/`/g, "");

  // Restore the protected inline code.
  text = text.replaceAll(
    /\u0000(\d+)\u0000/g,
    (_, index: string) => codeSpans[Number(index)] ?? "",
  );

  // Collapse every whitespace run into a single space, then trim.
  return text.replaceAll(/\s+/g, " ").trim();
}
