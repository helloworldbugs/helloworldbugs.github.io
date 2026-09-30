/**
 * Return at most `maxChars` characters from `input`, counted in Unicode code
 * points rather than UTF-16 code units.
 *
 * A plain `String.prototype.slice` works on UTF-16 code units, so it can cut a
 * surrogate pair (emoji, rare CJK extension-B characters, some symbols) in half
 * and leave a lone surrogate that renders as a broken replacement character.
 * Iterating with `for...of` yields whole code points, so a multi-unit character
 * is either kept entirely or dropped entirely.
 *
 * Semantics:
 * - count is code points, not bytes or grapheme clusters (a combined emoji
 *   sequence still counts as multiple code points)
 * - no ellipsis or other suffix is appended
 * - a non-positive `maxChars` yields an empty string
 */
export function sliceByCodePoints(input: string, maxChars: number): string {
  if (maxChars <= 0) {
    return "";
  }

  let result = "";
  let count = 0;

  for (const char of input) {
    if (count >= maxChars) {
      break;
    }
    result += char;
    count += 1;
  }

  return result;
}
