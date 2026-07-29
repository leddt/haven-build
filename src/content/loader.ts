import type {
  BuildMeta,
  CharacterMeta,
  GameMeta,
  PageEntry,
  PagesManifest,
} from "./types";

type JsonModule = { default: unknown } | unknown;

const jsonModules = import.meta.glob("../../content/**/*.json", {
  eager: true,
}) as Record<string, JsonModule>;

const mdModules = import.meta.glob("../../content/**/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function unwrapJson<T>(mod: JsonModule): T {
  if (mod && typeof mod === "object" && "default" in mod) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}

function contentPath(relative: string): string {
  return `../../content/${relative}`;
}

function compareOrder<T extends { order: number; title: string }>(a: T, b: T) {
  return a.order - b.order || a.title.localeCompare(b.title);
}

export function listGames(): GameMeta[] {
  return Object.entries(jsonModules)
    .filter(([path]) => path.endsWith("/game.json"))
    .map(([, mod]) => unwrapJson<GameMeta>(mod))
    .sort(compareOrder);
}

export function getGame(gameId: string): GameMeta | undefined {
  return listGames().find((g) => g.id === gameId);
}

export function listCharacters(gameId: string): CharacterMeta[] {
  const prefix = contentPath(`${gameId}/characters/`);
  return Object.entries(jsonModules)
    .filter(
      ([path]) =>
        path.startsWith(prefix) && path.endsWith("/character.json"),
    )
    .map(([, mod]) => unwrapJson<CharacterMeta>(mod))
    .sort(compareOrder);
}

export function getCharacter(
  gameId: string,
  characterId: string,
): CharacterMeta | undefined {
  return listCharacters(gameId).find((c) => c.id === characterId);
}

export function listBuilds(
  gameId: string,
  characterId: string,
): BuildMeta[] {
  const prefix = contentPath(`${gameId}/characters/${characterId}/builds/`);
  return Object.entries(jsonModules)
    .filter(
      ([path]) => path.startsWith(prefix) && path.endsWith("/build.json"),
    )
    .map(([, mod]) => unwrapJson<BuildMeta>(mod))
    .sort(compareOrder);
}

export function getBuild(
  gameId: string,
  characterId: string,
  buildId: string,
): BuildMeta | undefined {
  return listBuilds(gameId, characterId).find((b) => b.id === buildId);
}

function readPages(relativeDir: string): PageEntry[] {
  const key = contentPath(`${relativeDir}/pages.json`);
  const mod = jsonModules[key];
  if (!mod) return [];
  return unwrapJson<PagesManifest>(mod).pages;
}

export function getSharedPages(
  gameId: string,
  characterId: string,
): PageEntry[] {
  return readPages(`${gameId}/characters/${characterId}/shared`);
}

export function getBuildPages(
  gameId: string,
  characterId: string,
  buildId: string,
): PageEntry[] {
  return readPages(
    `${gameId}/characters/${characterId}/builds/${buildId}`,
  );
}

export function getPageMarkdown(
  gameId: string,
  characterId: string,
  scope: "build" | "shared",
  pageId: string,
  buildId?: string,
): string | undefined {
  const pages =
    scope === "shared"
      ? getSharedPages(gameId, characterId)
      : getBuildPages(gameId, characterId, buildId!);

  const entry = findPage(pages, pageId);
  if (!entry?.file) return undefined;

  const dir =
    scope === "shared"
      ? `${gameId}/characters/${characterId}/shared`
      : `${gameId}/characters/${characterId}/builds/${buildId}`;

  return mdModules[contentPath(`${dir}/${entry.file}`)];
}

export function findPage(
  pages: PageEntry[],
  pageId: string,
): PageEntry | undefined {
  for (const page of pages) {
    if (page.id === pageId) return page;
    if (page.children) {
      const nested = findPage(page.children, pageId);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function flattenPages(pages: PageEntry[]): PageEntry[] {
  const out: PageEntry[] = [];
  for (const page of pages) {
    out.push(page);
    if (page.children?.length) {
      out.push(...flattenPages(page.children));
    }
  }
  return out;
}
