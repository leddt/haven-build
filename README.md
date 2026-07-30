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

**Install a local launcher + icon** (needed so the release binary shows the correct icon in the taskbar):

```bash
npm run build:deb          # or any release build that produces the binary
npm run install:desktop
```

Then run from the app menu, or:

```bash
~/code/haven-build/src-tauri/target/release/haven-build
```

## Packages

**GitHub Release** (`.deb`, `.AppImage`, Windows NSIS):

```bash
git tag v0.2.0
git push origin v0.2.0
```

The `Release` workflow builds on Ubuntu 22.04 and Windows, then attaches artifacts to the GitHub release for that tag.

**Debian / Ubuntu package** (local; small; uses system WebKit):

```bash
npm run build:deb
```

Output: `src-tauri/target/release/bundle/deb/`

**AppImage** (local; Arch / CachyOS): linuxdeploy’s bundled `strip` breaks on modern system libraries. Build with stripping disabled:

```bash
npm run build:appimage
# or: NO_STRIP=true npm run tauri build -- --bundles appimage
```

Output: `src-tauri/target/release/bundle/appimage/`
## Sample content

Frosthaven → Banner Spear with three builds from the community guide:

- **Tactician** — formations-first
- **Stonewall** — tank-first
- **Breezing Banner** — banners / ranged support

Plus character-shared card reviews (levels 1–9). Images live under `content/.../images/`.

Add more games/characters/builds under `content/` using the same manifest layout.
