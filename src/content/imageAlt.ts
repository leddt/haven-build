/** Parse `![label|h=26rem|w=12rem](...)` style size hints from markdown image alt text. */

const SIZE_TOKEN = /^(h|w)=(\d*\.?\d+(?:px|rem|em|%|vh|vw))$/i;

export type ImageAltSize = {
  alt: string;
  height?: string;
  width?: string;
};

function applySizeToken(
  token: string,
  out: { height?: string; width?: string },
): boolean {
  const match = SIZE_TOKEN.exec(token);
  if (!match) return false;
  const [, key, value] = match;
  if (key!.toLowerCase() === "h") out.height = value;
  else out.width = value;
  return true;
}

/**
 * Size specs live after `|` (or as the whole alt): `card|h=26rem`, `|h=26rem w=12rem`, `h=26rem`.
 * Non-size segments become the visible alt text.
 */
export function parseImageAlt(raw: string): ImageAltSize {
  const trimmed = raw.trim();
  if (!trimmed) return { alt: "" };

  const segments = trimmed.split("|").map((part) => part.trim());
  const labelParts: string[] = [];
  const size: { height?: string; width?: string } = {};

  for (const segment of segments) {
    if (!segment) continue;
    const tokens = segment.split(/\s+/).filter(Boolean);
    if (tokens.length > 0 && tokens.every((token) => SIZE_TOKEN.test(token))) {
      for (const token of tokens) applySizeToken(token, size);
      continue;
    }
    labelParts.push(segment);
  }

  // Bare alt that is only size tokens (no `|`), e.g. `![h=26rem](...)`.
  if (labelParts.length === 1 && !size.height && !size.width) {
    const tokens = labelParts[0]!.split(/\s+/).filter(Boolean);
    if (tokens.length > 0 && tokens.every((token) => SIZE_TOKEN.test(token))) {
      for (const token of tokens) applySizeToken(token, size);
      return { alt: "", ...size };
    }
  }

  return { alt: labelParts.join(" | ").trim(), ...size };
}
