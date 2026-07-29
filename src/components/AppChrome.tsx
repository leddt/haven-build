import { Link, Outlet, useLocation } from "react-router-dom";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Bookmark, Settings } from "lucide-react";
import { WindowControls } from "@/components/WindowControls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppChrome() {
  const location = useLocation();
  const onSettings = location.pathname.startsWith("/settings");
  const onBookmarks = location.pathname.startsWith("/bookmarks");
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
    <div className="flex h-full min-h-0 flex-col">
      <header
        className="flex items-center justify-between gap-4 border-b border-border pl-4"
        data-tauri-drag-region
        onDoubleClick={() => {
          void getCurrentWindow().toggleMaximize();
        }}
      >
        <Link
          to="/"
          className="font-display text-xl font-semibold tracking-tight"
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
      <div className={cn("min-h-0 flex-1")}>
        <Outlet />
      </div>
    </div>
  );
}
