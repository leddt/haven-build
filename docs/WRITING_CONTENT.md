# Writing content

HavenBuild loads guides from the `content/` tree at build time. Add games, characters, and builds by creating folders and JSON manifests next to Markdown pages — no app code changes required for new guide content.

## Directory layout

```
content/
└── <game-id>/
    ├── game.json
    └── characters/
        └── <character-id>/
            ├── character.json
            ├── links.json          # optional; internal #fragment map
            ├── images/             # shared character assets (convention)
            ├── shared/             # pages shared across all builds
            │   ├── pages.json
            │   └── *.md
            └── builds/
                └── <build-id>/
                    ├── build.json
                    ├── pages.json
                    └── *.md
```

### Conventions

- **Folder name = JSON `id`**. Use kebab-case (`banner-spear`, `breezing-banner`). A mismatch means the app will not find the entry.
- Markdown files usually share the page `id` as their basename (`summary.md`, `level-2-hand.md`).
- Put character art under `characters/<id>/images/`. From a build page use `../../images/…`; from a shared page use `../images/…`.

### Example (current sample)

Frosthaven → Banner Spear → Tactician / Stonewall / Breezing Banner, with shared card reviews under `shared/`.

## Manifests

### `game.json`

```json
{ "id": "frosthaven", "title": "Frosthaven", "order": 1 }
```

| Field | Purpose |
|-------|---------|
| `id` | Must match the game folder name |
| `title` | Display name on the game picker |
| `order` | Sort key (then title) |

### `character.json`

```json
{ "id": "banner-spear", "title": "Banner Spear", "order": 1 }
```

Same shape as games. Lives in `content/<game>/characters/<character>/`.

### `build.json`

```json
{ "id": "tactician", "title": "Tactician", "order": 1 }
```

One per build folder under `builds/`.

### `pages.json`

Defines the sidebar TOC and which Markdown file backs each page.

```json
{
  "pages": [
    {
      "id": "summary",
      "title": "Summary",
      "file": "summary.md"
    },
    {
      "id": "opener",
      "title": "Opener",
      "file": "opener.md"
    }
  ]
}
```

| Field | Purpose |
|-------|---------|
| `id` | URL segment (`pageId`) |
| `title` | Sidebar label and reader chrome heading |
| `file` | Markdown filename in the **same directory** as this `pages.json` |
| `children` | Optional nested entries (resolved by id; **not shown in the sidebar TOC** today) |

There are two `pages.json` files per character:

- `shared/pages.json` — “Character” section in the TOC
- `builds/<build>/pages.json` — “This build” section

Only pages listed here are reachable. An orphan `.md` file is ignored.

### `links.json` (optional)

Maps Markdown `#fragments` to app pages so `[Javelin](#javelin)` navigates in-app.

Path: `content/<game>/characters/<character>/links.json` (character-scoped, not per-build).

```json
{
  "javelin": {
    "scope": "shared",
    "pageId": "level-01-cards",
    "heading": "javelin"
  },
  "tactician/summary": {
    "scope": "build",
    "pageId": "summary",
    "buildId": "tactician"
  },
  "level-02": {
    "scope": "shared",
    "pageId": "level-02"
  }
}
```

| Field | Purpose |
|-------|---------|
| key | Fragment without `#` (what appears in `[text](#key)`) |
| `scope` | `"shared"` or `"build"` |
| `pageId` | Target page id from the relevant `pages.json` |
| `buildId` | Required when `scope` is `"build"` |
| `heading` | Optional `h2` id to scroll to after navigation |

Unregistered `#fragments` render as plain emphasized text (not a dead link).

## URLs

The app uses a hash router. Paths look like:

| Content | Path |
|---------|------|
| Build page | `/g/<game>/c/<character>/b/<build>/p/<pageId>` |
| Shared page | `/g/<game>/c/<character>/b/<build>/shared/<pageId>` |

Shared pages are always opened in the context of a build so the sidebar can show both “This build” and “Character” pages.

Examples:

- `#/g/frosthaven/c/banner-spear/b/tactician/p/summary`
- `#/g/frosthaven/c/banner-spear/b/tactician/shared/level-01-cards`

## Markdown

Content is rendered with GitHub-Flavored Markdown (`remark-gfm`): tables, task lists, strikethrough, and the usual Markdown features.

### Headings

- Do **not** repeat the page title as a `#` heading when it matches the `pages.json` title — the reader chrome already shows it.
- Only **`##` headings** get stable ids for scrolling and `links.json` `heading` targets.
- Heading ids are slugified: lowercased, non-alphanumeric runs become `-`.  
  `## At All Costs` → `at-all-costs`.

### Links

| Form | Behavior |
|------|----------|
| `[label](https://…)` / `mailto:` | Opens externally |
| `[label](#fragment)` | Looks up `links.json`; navigates / scrolls if found |
| Unknown `#fragment` or other relative href | Shown as non-clickable emphasized text |

### Images

Relative paths resolve against the page directory (via `..` as needed). Supported: `png`, `jpg`, `jpeg`, `webp`, `gif`, `svg`.

#### Size annotations

Put size hints in the image alt text:

```markdown
![h=26rem](../../images/javelin.png)
![Card name|h=26rem|w=12rem](../../images/javelin.png)
![h=20rem w=12rem](../../images/javelin.png)
```

| Token | Meaning |
|-------|---------|
| `h=<length>` | CSS height |
| `w=<length>` | CSS width |

Allowed units: `px`, `rem`, `em`, `%`, `vh`, `vw`.

- With a label, separate sizes with `|`: `![Javelin|h=20rem](…)`.
- **Inside GFM tables, do not use a leading `|`** before the size (`![|h=…]` breaks columns). Prefer `![h=16rem](…)`.
- Images **with** `h=` or `w=` are clickable (full-resolution lightbox).
- Images **without** size annotations are static (no zoom).

Typical sizes in the sample content:

| Context | Example |
|---------|---------|
| Build card lists / perks sheet | `h=26rem` |
| Hand pages | `h=20rem` |
| Opener tables | `h=16rem` |
| Character pages / mat (unsized) | plain `![](…)` |

Side-by-side cards: put several images in one paragraph (no blank lines between them). Image-only table cells are centered automatically.

### Interactive checkboxes

GFM task lists are interactive **only** when tagged with a stable id comment:

```markdown
- [ ] <!-- check:ignore-item-effects --> Buy armor and ignore negative item effects.
- [x] <!-- check:rolling-shields --> Replace (-1)s with rolling shields.
```

Rules:

- Id must match `[a-z0-9-]+` (kebab-case).
- Place the comment anywhere in the list item (commonly right after `[ ]`).
- Checked state is stored per user as `<pageKey>#<checkId>` — it does **not** rewrite the Markdown file.
- Prefer **semantic ids** (`rolling-shields`), not positional ones (`perk-1`), so reordering items does not orphan progress.
- Task items **without** `<!-- check:… -->` render as disabled (display-only).

### Tables

Standard GFM tables work. Useful for openers:

```markdown
|  | Turn One | Turn Two | Turn Three |
| --- | --- | --- | --- |
| Top Action | ![h=16rem](../../images/javelin.png) | ![h=16rem](../../images/incendiary-throw.png) | … |
| Bottom Action | ![h=16rem](../../images/rallying-cry.png) | … | … |
```

Remember: no `|` inside image alts in table cells.

## Adding a new guide (checklist)

1. Create `content/<game>/game.json` (folder name = `id`).
2. Create `characters/<character>/character.json`.
3. Optionally add `images/` and `links.json`.
4. Add `shared/pages.json` and the listed `.md` files.
5. Add each build under `builds/<build>/` with `build.json`, `pages.json`, and `.md` files.
6. Register every in-guide `#fragment` you link to in `links.json`.
7. For checklists, use `- [ ] <!-- check:stable-id --> …`.
8. For zoomable art, set `h=` / `w=` on the image alt.
9. Restart the dev server after adding **new** files so Vite’s content glob picks them up.

## What content cannot do

- No MDX / React components in Markdown.
- No frontmatter.
- Writing checkmarks or edits back into `.md` files (progress lives in local app storage).
- Nested `pages.json` children are not shown in the sidebar yet.
