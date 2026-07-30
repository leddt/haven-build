import { Link, Outlet, useLocation } from "react-router-dom";
import { Bookmark, Settings } from "lucide-react";
import { WindowControls } from "@/components/WindowControls";
import { WindowResizeHandles } from "@/components/WindowResizeHandles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function isBuildRoute(pathname: string) {
  return /^\/g\/[^/]+\/c\/[^/]+\/b\/[^/]+/.test(pathname);
}

export function AppChrome() {
  const location = useLocation();
  const onSettings = location.pathname.startsWith("/settings");
  const onBookmarks = location.pathname.startsWith("/bookmarks");
  const inBuild = isBuildRoute(location.pathname);
  const existingFrom = (
    location.state as { from?: typeof location } | null
  )?.from;
  const returnState =
    onSettings || onBookmarks
      ? existingFrom
        ? { from: existingFrom }
        : undefined
      : { from: location };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground">
      <WindowResizeHandles />
      <header
        className="flex shrink-0 items-center justify-between gap-4 pl-4"
        data-tauri-drag-region
      >
        <Link
          to="/"
          className="font-display text-xl font-semibold tracking-tight text-sidebar-foreground"
        >
          HavenBuild
        </Link>
        <div className="flex items-center gap-1 py-2 pr-1">
          <Button
            asChild
            variant={onBookmarks ? "secondary" : "ghost"}
            size="sm"
          >
            <Link to="/bookmarks" state={returnState}>
              <Bookmark className="size-4" />
              Bookmarks
            </Link>
          </Button>
          <Button
            asChild
            variant={onSettings ? "secondary" : "ghost"}
            size="sm"
          >
            <Link to="/settings" state={returnState}>
              <Settings className="size-4" />
              Settings
            </Link>
          </Button>
          <WindowControls />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        {inBuild ? (
          <Outlet />
        ) : (
          <div
            className={cn(
              "mx-2 mb-2 mt-0 h-[calc(100%-0.5rem)] min-h-0 overflow-hidden rounded-xl bg-background text-foreground shadow-sm",
            )}
          >
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
}
