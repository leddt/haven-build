import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppLocation, Bookmark } from "@/content/types";
import { pageKey } from "@/content/types";
import {
  checkboxStateKey,
  loadBookmarks,
  loadCheckboxState,
  loadDoneKeys,
  saveBookmarks,
  saveCheckboxState,
  saveDoneKeys,
  saveLastLocation,
} from "@/state/persistence";

type ProgressContextValue = {
  ready: boolean;
  doneKeys: Set<string>;
  bookmarks: Bookmark[];
  isDone: (loc: AppLocation) => boolean;
  toggleDone: (loc: AppLocation) => void;
  isBookmarked: (loc: AppLocation) => boolean;
  toggleBookmark: (loc: AppLocation, label: string) => void;
  rememberLocation: (loc: AppLocation) => void;
  isCheckboxChecked: (
    pageKey: string,
    checkId: string,
    mdDefault: boolean,
  ) => boolean;
  toggleCheckbox: (
    pageKey: string,
    checkId: string,
    mdDefault: boolean,
  ) => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [checkboxState, setCheckboxState] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadDoneKeys(),
      loadBookmarks(),
      loadCheckboxState(),
    ]).then(([done, marks, checks]) => {
      if (cancelled) return;
      setDoneKeys(new Set(done));
      setBookmarks(marks);
      setCheckboxState(checks);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const isDone = useCallback(
    (loc: AppLocation) => doneKeys.has(pageKey(loc)),
    [doneKeys],
  );

  const toggleDone = useCallback((loc: AppLocation) => {
    const key = pageKey(loc);
    setDoneKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      void saveDoneKeys([...next]);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (loc: AppLocation) =>
      bookmarks.some((b) => pageKey(b) === pageKey(loc)),
    [bookmarks],
  );

  const toggleBookmark = useCallback((loc: AppLocation, label: string) => {
    const key = pageKey(loc);
    setBookmarks((prev) => {
      const exists = prev.some((b) => pageKey(b) === key);
      const next = exists
        ? prev.filter((b) => pageKey(b) !== key)
        : [...prev, { ...loc, id: key, label }];
      void saveBookmarks(next);
      return next;
    });
  }, []);

  const rememberLocation = useCallback((loc: AppLocation) => {
    void saveLastLocation(loc);
  }, []);

  const isCheckboxChecked = useCallback(
    (page: string, checkId: string, mdDefault: boolean) => {
      const key = checkboxStateKey(page, checkId);
      if (Object.prototype.hasOwnProperty.call(checkboxState, key)) {
        return checkboxState[key]!;
      }
      return mdDefault;
    },
    [checkboxState],
  );

  const toggleCheckbox = useCallback(
    (page: string, checkId: string, mdDefault: boolean) => {
      const key = checkboxStateKey(page, checkId);
      setCheckboxState((prev) => {
        const current = Object.prototype.hasOwnProperty.call(prev, key)
          ? prev[key]!
          : mdDefault;
        const next = { ...prev, [key]: !current };
        void saveCheckboxState(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      ready,
      doneKeys,
      bookmarks,
      isDone,
      toggleDone,
      isBookmarked,
      toggleBookmark,
      rememberLocation,
      isCheckboxChecked,
      toggleCheckbox,
    }),
    [
      ready,
      doneKeys,
      bookmarks,
      isDone,
      toggleDone,
      isBookmarked,
      toggleBookmark,
      rememberLocation,
      isCheckboxChecked,
      toggleCheckbox,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
