import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { AppChrome } from "@/components/AppChrome";
import {
  getBuildPages,
  getSharedPages,
  listBuilds,
} from "@/content/loader";
import { locationPath, type AppLocation } from "@/content/types";
import { BuildPicker } from "@/pages/BuildPicker";
import { BookmarksPage } from "@/pages/BookmarksPage";
import { CharacterPicker } from "@/pages/CharacterPicker";
import { GamePicker } from "@/pages/GamePicker";
import {
  BuildPage,
  ReaderLayout,
  RedirectToFirstBuildPage,
  SharedPage,
} from "@/pages/Reader";
import { SettingsPage } from "@/pages/SettingsPage";
import { loadLastLocation } from "@/state/persistence";

function SessionBootstrap({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const didRestore = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const loc = await loadLastLocation();
        if (cancelled) return;
        if (!didRestore.current && loc && isValidLocation(loc)) {
          didRestore.current = true;
          navigate(locationPath(loc), { replace: true });
        }
      } catch {
        // Ignore store errors and continue to the UI.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return children;
}

function isValidLocation(loc: AppLocation): boolean {
  if (!loc.buildId) return false;
  const builds = listBuilds(loc.gameId, loc.characterId);
  if (!builds.some((b) => b.id === loc.buildId)) return false;

  if (loc.scope === "shared") {
    return Boolean(
      findIn(getSharedPages(loc.gameId, loc.characterId), loc.pageId),
    );
  }
  return Boolean(
    findIn(
      getBuildPages(loc.gameId, loc.characterId, loc.buildId),
      loc.pageId,
    ),
  );
}

function findIn(
  pages: { id: string; children?: { id: string }[] }[],
  pageId: string,
): boolean {
  return pages.some(
    (p) => p.id === pageId || (p.children && findIn(p.children, pageId)),
  );
}

export default function App() {
  return (
    <SessionBootstrap>
      <Routes>
        <Route element={<AppChrome />}>
          <Route index element={<GamePicker />} />
          <Route path="g/:gameId" element={<CharacterPicker />} />
          <Route path="g/:gameId/c/:characterId" element={<BuildPicker />} />
          <Route
            path="g/:gameId/c/:characterId/b/:buildId"
            element={<ReaderLayout />}
          >
            <Route index element={<RedirectToFirstBuildPage />} />
            <Route path="p/:pageId" element={<BuildPage />} />
            <Route path="shared/:pageId" element={<SharedPage />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </SessionBootstrap>
  );
}
