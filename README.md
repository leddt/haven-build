# HavenBuild

Personal desktop app for following character build guides (Frosthaven first).

## License

The application code is licensed under the [MIT License](LICENSE).

The Markdown guides and images under `content/` are **not** covered by that
license — they come from public community guides. See [`content/NOTICE`](content/NOTICE).

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

The `Release` workflow builds:

- `.deb` on Ubuntu 22.04 (broader glibc compatibility)
- `.AppImage` on Ubuntu 24.04 (newer bundled libs — better on Arch / CachyOS)
- Windows NSIS on `windows-latest`

Then attaches artifacts to the GitHub release for that tag.

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

## Content

Guides live as local Markdown under `content/`. See [Writing content](docs/WRITING_CONTENT.md) for the layout and authoring conventions.
