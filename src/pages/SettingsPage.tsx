import { version } from "../../package.json";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BackButton } from "@/components/BackButton";
import type { ThemePreference } from "@/content/types";
import { useTheme } from "@/state/theme";

const options: { value: ThemePreference; label: string; hint: string }[] = [
  {
    value: "system",
    label: "System",
    hint: "Follow your desktop light/dark setting",
  },
  { value: "light", label: "Light", hint: "Always use the light theme" },
  { value: "dark", label: "Dark", hint: "Always use the dark theme" },
];

export function SettingsPage() {
  const { preference, setPreference } = useTheme();

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <BackButton />
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">
        Settings
      </h1>
      <p className="mt-2 text-muted-foreground">
        Preferences are saved on this device.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Theme
        </h2>
        <RadioGroup
          value={preference}
          onValueChange={(value) =>
            setPreference(value as ThemePreference)
          }
        >
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-3 hover:bg-muted/50"
            >
              <RadioGroupItem value={option.value} className="mt-1" />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="text-sm text-muted-foreground">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </section>

      <p className="mt-12 text-sm text-muted-foreground">Version {version}</p>
    </main>
  );
}
