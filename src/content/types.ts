export type PageEntry = {
  id: string;
  title: string;
  file?: string;
  children?: PageEntry[];
};

export type PagesManifest = {
  pages: PageEntry[];
};

export type GameMeta = {
  id: string;
  title: string;
  order: number;
};

export type CharacterMeta = {
  id: string;
  title: string;
  order: number;
};

export type BuildMeta = {
  id: string;
  title: string;
  order: number;
};

export type PageScope = "build" | "shared";

export type AppLocation = {
  gameId: string;
  characterId: string;
  buildId?: string;
  scope: PageScope;
  pageId: string;
};

export type Bookmark = AppLocation & {
  id: string;
  label: string;
};

export type ThemePreference = "system" | "light" | "dark";

export function pageKey(loc: {
  gameId: string;
  characterId: string;
  scope: PageScope;
  buildId?: string;
  pageId: string;
}): string {
  if (loc.scope === "shared") {
    return `${loc.gameId}/${loc.characterId}/shared/${loc.pageId}`;
  }
  return `${loc.gameId}/${loc.characterId}/b/${loc.buildId}/${loc.pageId}`;
}

export function locationPath(loc: AppLocation): string {
  if (loc.scope === "shared") {
    return `/g/${loc.gameId}/c/${loc.characterId}/b/${loc.buildId}/shared/${loc.pageId}`;
  }
  return `/g/${loc.gameId}/c/${loc.characterId}/b/${loc.buildId}/p/${loc.pageId}`;
}
