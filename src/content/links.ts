import type { AppLocation, PageScope } from "./types";
import { locationPath } from "./types";

export type GuideLinkTarget = {
  scope: PageScope;
  pageId: string;
  buildId?: string;
  heading?: string;
};

type LinkMap = Record<string, GuideLinkTarget>;

const linkModules = import.meta.glob("../../content/**/links.json", {
  eager: true,
}) as Record<string, { default: LinkMap } | LinkMap>;

function unwrap<T>(mod: { default: T } | T): T {
  if (mod && typeof mod === "object" && "default" in mod) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}

export function getCharacterLinkMap(
  gameId: string,
  characterId: string,
): LinkMap {
  const key = `../../content/${gameId}/characters/${characterId}/links.json`;
  const mod = linkModules[key];
  return mod ? unwrap(mod) : {};
}

export function resolveGuideHref(
  href: string | undefined,
  ctx: {
    gameId: string;
    characterId: string;
    buildId?: string;
  },
): { path: string; heading?: string } | null {
  if (!href) return null;
  if (/^(https?:|mailto:)/i.test(href)) {
    return { path: href };
  }
  if (!href.startsWith("#")) return null;

  const anchor = href.slice(1);
  const map = getCharacterLinkMap(ctx.gameId, ctx.characterId);
  const target = map[anchor];
  if (!target) return null;

  const loc: AppLocation = {
    gameId: ctx.gameId,
    characterId: ctx.characterId,
    scope: target.scope,
    pageId: target.pageId,
    buildId:
      target.scope === "build"
        ? target.buildId
        : ctx.buildId,
  };
  if (!loc.buildId) return null;

  return {
    path: locationPath(loc),
    heading: target.heading,
  };
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\\-/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
