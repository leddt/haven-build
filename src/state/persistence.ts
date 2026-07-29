import { load, type Store } from "@tauri-apps/plugin-store";
import type { AppLocation, Bookmark, ThemePreference } from "@/content/types";

const STORE_NAME = "haven-build.json";

let storePromise: Promise<Store | null> | null = null;
let memoryFallback: Record<string, unknown> = {};
let useMemory = false;

async function getStore(): Promise<Store | null> {
  if (useMemory) return null;
  if (!storePromise) {
    storePromise = load(STORE_NAME).catch(() => {
      useMemory = true;
      return null;
    });
  }
  return storePromise;
}

async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const store = await getStore();
    if (!store) {
      return (memoryFallback[key] as T | undefined) ?? fallback;
    }
    const value = await store.get<T>(key);
    return value ?? fallback;
  } catch {
    useMemory = true;
    return (memoryFallback[key] as T | undefined) ?? fallback;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const store = await getStore();
    if (!store) {
      memoryFallback[key] = value;
      return;
    }
    await store.set(key, value);
    await store.save();
  } catch {
    useMemory = true;
    memoryFallback[key] = value;
  }
}

export async function loadTheme(): Promise<ThemePreference> {
  return getItem<ThemePreference>("theme", "system");
}

export async function saveTheme(theme: ThemePreference): Promise<void> {
  await setItem("theme", theme);
}

export async function loadLastLocation(): Promise<AppLocation | null> {
  return getItem<AppLocation | null>("lastLocation", null);
}

export async function saveLastLocation(loc: AppLocation): Promise<void> {
  await setItem("lastLocation", loc);
}

export async function loadDoneKeys(): Promise<string[]> {
  return getItem<string[]>("doneKeys", []);
}

export async function saveDoneKeys(keys: string[]): Promise<void> {
  await setItem("doneKeys", keys);
}

export async function loadBookmarks(): Promise<Bookmark[]> {
  return getItem<Bookmark[]>("bookmarks", []);
}

export async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await setItem("bookmarks", bookmarks);
}
