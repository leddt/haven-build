import { Link, Navigate, useParams } from "react-router-dom";
import {
  getBuildPages,
  getCharacter,
  getGame,
  listBuilds,
} from "@/content/loader";
import { Button } from "@/components/ui/button";

export function BuildPicker() {
  const { gameId = "", characterId = "" } = useParams();
  const game = getGame(gameId);
  const character = getCharacter(gameId, characterId);
  const builds = listBuilds(gameId, characterId);

  if (!game || !character) return <Navigate to="/" replace />;

  return (
    <main className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-8 px-6 py-10">
      <div>
        <Button asChild variant="link" className="h-auto px-0">
          <Link to={`/g/${gameId}`}>← Characters</Link>
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          {game.title} · {character.title}
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
          Pick a build
        </h1>
      </div>
      <ul className="space-y-2">
        {builds.map((build) => {
          const firstPage =
            getBuildPages(gameId, characterId, build.id)[0]?.id ?? "summary";
          return (
            <li key={build.id}>
              <Link
                to={`/g/${gameId}/c/${characterId}/b/${build.id}/p/${firstPage}`}
                className="block border-b border-border py-4 text-xl font-medium transition-colors hover:text-primary"
              >
                {build.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
