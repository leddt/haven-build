import { Link, Navigate, useParams } from "react-router-dom";
import { getGame, listCharacters } from "@/content/loader";
import { Button } from "@/components/ui/button";

export function CharacterPicker() {
  const { gameId = "" } = useParams();
  const game = getGame(gameId);
  const characters = listCharacters(gameId);

  if (!game) return <Navigate to="/" replace />;

  return (
    <main className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-8 px-6 py-10">
      <div>
        <Button asChild variant="link" className="h-auto px-0">
          <Link to="/">← Games</Link>
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">{game.title}</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
          Pick a character
        </h1>
      </div>
      <ul className="space-y-2">
        {characters.map((character) => (
          <li key={character.id}>
            <Link
              to={`/g/${gameId}/c/${character.id}`}
              className="block border-b border-border py-4 text-xl font-medium transition-colors hover:text-primary"
            >
              {character.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
