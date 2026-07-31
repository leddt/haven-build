import { NavLink } from "react-router-dom";
import { Bookmark, Check } from "lucide-react";
import type { PageEntry, PageScope } from "@/content/types";
import { locationPath, type AppLocation } from "@/content/types";
import { cn } from "@/lib/utils";
import { useProgress } from "@/state/progress";
import { Separator } from "@/components/ui/separator";

function TocLink({
  loc,
  title,
}: {
  loc: AppLocation;
  title: string;
}) {
  const { isDone, isBookmarked } = useProgress();
  const done = isDone(loc);
  const bookmarked = isBookmarked(loc);

  return (
    <NavLink
      to={locationPath(loc)}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          done && "text-muted-foreground/60",
          isActive
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/70",
        )
      }
    >
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {bookmarked ? (
        <Bookmark
          className="size-3.5 shrink-0 fill-current opacity-80"
          aria-label="Bookmarked"
        />
      ) : null}
      {done ? (
        <Check className="size-3.5 shrink-0 opacity-80" aria-label="Done" />
      ) : null}
    </NavLink>
  );
}

function TocGroup({
  title,
  kind,
  pages,
  base,
}: {
  title: string;
  kind: string;
  pages: PageEntry[];
  base: Omit<AppLocation, "pageId"> & { scope: PageScope };
}) {
  return (
    <div className="space-y-1">
      <p className="px-2 text-xs font-semibold tracking-wide">
        <span className="uppercase">{title}</span>{" "}
        <span className="font-normal text-muted-foreground">({kind})</span>
      </p>
      <ul className="space-y-0.5">
        {pages.map((page) => (
          <li key={page.id}>
            <TocLink
              title={page.title}
              loc={{ ...base, pageId: page.id }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GuideToc({
  gameId,
  characterId,
  buildId,
  buildTitle,
  characterTitle,
  buildPages,
  sharedPages,
}: {
  gameId: string;
  characterId: string;
  buildId: string;
  buildTitle: string;
  characterTitle: string;
  buildPages: PageEntry[];
  sharedPages: PageEntry[];
}) {
  return (
    <nav className="space-y-5 p-3">
      <TocGroup
        title={buildTitle}
        kind="build"
        pages={buildPages}
        base={{
          gameId,
          characterId,
          buildId,
          scope: "build",
        }}
      />
      <Separator />
      <TocGroup
        title={characterTitle}
        kind="character"
        pages={sharedPages}
        base={{
          gameId,
          characterId,
          buildId,
          scope: "shared",
        }}
      />
    </nav>
  );
}
