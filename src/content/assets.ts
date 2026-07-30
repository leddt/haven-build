const assetModules = import.meta.glob("../../content/**/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

/**
 * Resolve a markdown image src relative to a content page directory.
 * Example: assetBase `frosthaven/characters/banner-spear/shared`,
 * src `../images/resolved-courage.png` → content URL for that file.
 */
export function resolveContentAssetUrl(
  assetBase: string,
  src: string,
): string | undefined {
  if (/^(https?:|data:|blob:)/i.test(src)) return src;

  const baseParts = assetBase.split("/").filter(Boolean);
  const srcParts = src.replace(/^\.\//, "").split("/");
  const stack = [...baseParts];

  for (const part of srcParts) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      stack.pop();
      continue;
    }
    stack.push(part);
  }

  const key = `../../content/${stack.join("/")}`;
  return assetModules[key];
}
