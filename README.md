# HavenBuild

Personal desktop app for following character build guides (Frosthaven first).

## Stack

- Tauri 2 + React + TypeScript + Vite
- Tailwind + light shadcn-style UI primitives
- Local Markdown guides under `content/`
- Persistent state via `@tauri-apps/plugin-store` (last page, bookmarks, done flags, theme)

## Develop

```bash
# Ensure rustup toolchain is on PATH if needed:
# export PATH="$HOME/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/bin:$PATH"

npm install
npm run tauri dev
```

On NVIDIA + Wayland, HavenBuild sets WebKit workarounds at startup so the window does not die with `Error 71 (Protocol error)`. You can override them in the environment if needed.
## Sample content

Frosthaven → Banner Spear → Frontline Tank, plus character-shared pages (overview, perks, tips).

Add more games/characters/builds under `content/` using the same manifest layout.
