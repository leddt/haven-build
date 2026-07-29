import { useEffect } from "react";
import { Link, Navigate, Outlet, useParams } from "react-router-dom";
import { Bookmark, Check } from "lucide-react";
import { GuideToc } from "@/components/GuideToc";
import { MarkdownPage } from "@/components/MarkdownPage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  findPage,
  getBuild,
  getBuildPages,
  getCharacter,
  getGame,
  getPageMarkdown,
  getSharedPages,
} from "@/content/loader";
import { pageKey, type AppLocation } from "@/content/types";
import { useProgress } from "@/state/progress";

export function ReaderLayout() {
  const { gameId = "", characterId = "", buildId = "" } = useParams();
  const game = getGame(gameId);
  const character = getCharacter(gameId, characterId);
  const build = getBuild(gameId, characterId, buildId);
  const buildPages = getBuildPages(gameId, characterId, buildId);
  const sharedPages = getSharedPages(gameId, characterId);

  if (!game || !character || !build) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
        <div className="space-y-1 border-b border-border px-3 py-3">
          <p className="text-xs text-muted-foreground">{game.title}</p>
          <p className="font-medium leading-tight">{character.title}</p>
          <p className="text-sm text-muted-foreground">{build.title}</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1 pt-1 text-sm">
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link to="/">All games</Link>
            </Button>
            <span className="text-muted-foreground">·</span>
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link to={`/g/${gameId}`}>Character</Link>
            </Button>
            <span className="text-muted-foreground">·</span>
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <Link to={`/g/${gameId}/c/${characterId}`}>Build</Link>
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <GuideToc
            gameId={gameId}
            characterId={characterId}
            buildId={buildId}
            buildPages={buildPages}
            sharedPages={sharedPages}
          />
        </div>
      </aside>
      <div className="min-h-0 min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export function BuildPage() {
  const { gameId = "", characterId = "", buildId = "", pageId = "" } =
    useParams();
  return (
    <PageBody
      loc={{
        gameId,
        characterId,
        buildId,
        pageId,
        scope: "build",
      }}
    />
  );
}

export function SharedPage() {
  const { gameId = "", characterId = "", buildId = "", pageId = "" } =
    useParams();
  return (
    <PageBody
      loc={{
        gameId,
        characterId,
        buildId,
        pageId,
        scope: "shared",
      }}
    />
  );
}

function PageBody({ loc }: { loc: AppLocation }) {
  const { gameId, characterId, buildId, pageId, scope } = loc;
  const {
    isDone,
    toggleDone,
    isBookmarked,
    toggleBookmark,
    rememberLocation,
  } = useProgress();

  const pages =
    scope === "shared"
      ? getSharedPages(gameId, characterId)
      : getBuildPages(gameId, characterId, buildId!);
  const entry = findPage(pages, pageId);
  const markdown = getPageMarkdown(
    gameId,
    characterId,
    scope,
    pageId,
    buildId,
  );

  const key = pageKey(loc);
  useEffect(() => {
    if (entry) rememberLocation(loc);
    // Intentionally key-stable: avoid re-saving on new object identity each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, key, rememberLocation]);

  if (!entry || markdown === undefined) {
    const fallback =
      scope === "build"
        ? `/g/${gameId}/c/${characterId}/b/${buildId}/p/${pages[0]?.id ?? "summary"}`
        : `/g/${gameId}/c/${characterId}/b/${buildId}/shared/${pages[0]?.id ?? "overview"}`;
    return <Navigate to={fallback} replace />;
  }

  const done = isDone(loc);
  const bookmarked = isBookmarked(loc);
  const game = getGame(gameId);
  const character = getCharacter(gameId, characterId);
  const build = getBuild(gameId, characterId, buildId!);
  const bookmarkLabel = [
    game?.title,
    character?.title,
    scope === "build" ? build?.title : "Character",
    entry.title,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {scope === "build" ? "This build" : "Character"}
          </p>
          <h1 className="font-display text-xl font-semibold">{entry.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={bookmarked ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleBookmark(loc, bookmarkLabel)}
          >
            <Bookmark className="size-4" />
            {bookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
          <Button
            variant={done ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleDone(loc)}
          >
            <Check className="size-4" />
            {done ? "Done" : "Mark done"}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-6 py-8">
          <MarkdownPage content={markdown} />
        </div>
      </ScrollArea>
    </div>
  );
}

export function RedirectToFirstBuildPage() {
  const { gameId = "", characterId = "", buildId = "" } = useParams();
  const pages = getBuildPages(gameId, characterId, buildId);
  const first = pages[0]?.id;
  if (!first) {
    return <Navigate to={`/g/${gameId}/c/${characterId}`} replace />;
  }
  return (
    <Navigate
      to={`/g/${gameId}/c/${characterId}/b/${buildId}/p/${first}`}
      replace
    />
  );
}
