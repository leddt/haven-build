import { Link } from "react-router-dom";
import { listGames } from "@/content/loader";

export function GamePicker() {
  const games = listGames();

  return (
    <main className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-8 px-6 py-10">
      <div>
        <p className="text-sm text-muted-foreground">Choose a game</p>
        <h1 className="font-display mt-1 text-4xl font-semibold tracking-tight">
          HavenBuild
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Follow character build guides. Start with a game, then a character and
          build.
        </p>
      </div>
      <ul className="space-y-2">
        {games.map((game) => (
          <li key={game.id}>
            <Link
              to={`/g/${game.id}`}
              className="block border-b border-border py-4 text-2xl font-medium transition-colors hover:text-primary"
            >
              {game.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
