#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BIN="${ROOT}/src-tauri/target/release/haven-build"
ICON_SRC="${ROOT}/src-tauri/icons/icon.png"
DESKTOP_DIR="${HOME}/.local/share/applications"
ICON_BASE="${HOME}/.local/share/icons/hicolor"
PIXMAP_DIR="${HOME}/.local/share/pixmaps"
DESKTOP_FILE="${DESKTOP_DIR}/haven-build.desktop"
# Absolute path is the most reliable for KDE/Plasma launchers.
ICON_FILE="${ICON_BASE}/512x512/apps/haven-build.png"

if [[ ! -x "$BIN" ]]; then
  echo "Release binary not found at:"
  echo "  $BIN"
  echo "Build it first, e.g.:"
  echo "  npm run build:deb"
  exit 1
fi

if [[ ! -f "$ICON_SRC" ]]; then
  echo "Icon not found at $ICON_SRC"
  exit 1
fi

mkdir -p "$DESKTOP_DIR" "$PIXMAP_DIR"

# Ensure a minimal theme index so hicolor lookups work for user icons.
if [[ ! -f "${ICON_BASE}/index.theme" ]]; then
  mkdir -p "$ICON_BASE"
  cat > "${ICON_BASE}/index.theme" <<'EOF'
[Icon Theme]
Name=Hicolor
Comment=Fallback icon theme
Directories=16x16/apps,24x24/apps,32x32/apps,48x48/apps,64x64/apps,128x128/apps,256x256/apps,512x512/apps

[16x16/apps]
Size=16
Context=Applications
Type=Fixed

[24x24/apps]
Size=24
Context=Applications
Type=Fixed

[32x32/apps]
Size=32
Context=Applications
Type=Fixed

[48x48/apps]
Size=48
Context=Applications
Type=Fixed

[64x64/apps]
Size=64
Context=Applications
Type=Fixed

[128x128/apps]
Size=128
Context=Applications
Type=Fixed

[256x256/apps]
Size=256
Context=Applications
Type=Fixed

[512x512/apps]
Size=512
Context=Applications
Type=Fixed
EOF
fi

for size in 16 24 32 48 64 128 256 512; do
  dir="${ICON_BASE}/${size}x${size}/apps"
  mkdir -p "$dir"
  magick "$ICON_SRC" -resize "${size}x${size}" "${dir}/haven-build.png"
done

cp "$ICON_SRC" "${PIXMAP_DIR}/haven-build.png"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=HavenBuild
Comment=Personal character build guide companion
Exec=${BIN}
Icon=${ICON_FILE}
Terminal=false
Categories=Utility;Education;
StartupWMClass=haven-build
EOF
chmod 644 "$DESKTOP_FILE"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f -t "$ICON_BASE" >/dev/null 2>&1 || true
fi
if command -v kbuildsycoca6 >/dev/null 2>&1; then
  kbuildsycoca6 >/dev/null 2>&1 || true
fi

echo "Installed launcher:"
echo "  $DESKTOP_FILE"
echo "Icon:"
echo "  $ICON_FILE"
echo
echo "Re-open the app launcher (or run: kbuildsycoca6) if the icon does not refresh immediately."
