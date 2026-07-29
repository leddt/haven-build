import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { locationPath } from "@/content/types";
import { useProgress } from "@/state/progress";

export function BookmarksPage() {
  const { bookmarks } = useProgress();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <BackButton />
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        Bookmarks
      </h1>
      <p className="mt-2 text-muted-foreground">
        Jump back to pages you marked for later.
      </p>

      {bookmarks.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No bookmarks yet.</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <Link
                to={locationPath(bookmark)}
                className="block border-b border-border py-3 transition-colors hover:text-primary"
              >
                {bookmark.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
