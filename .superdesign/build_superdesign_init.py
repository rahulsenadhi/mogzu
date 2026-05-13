from pathlib import Path

root = Path(r"C:/Mogzu Figma Cursor")
app = root / "MogzuApplication"
out = root / ".superdesign" / "init"
out.mkdir(parents=True, exist_ok=True)

def read(rel: str) -> str:
    return (app / rel).read_text(encoding="utf-8")

def block(path: str, text: str, lang: str = "tsx") -> str:
    return f"### `{path}`\n```{lang}\n{text}\n```\n"

components = [
    ("src/app/components/ui/button.tsx", "Button primitive with variant classes", "tsx"),
    ("src/app/components/ui/input.tsx", "Input primitive with shared input tokens", "tsx"),
    ("src/app/components/ui/card.tsx", "Card primitives for container structure", "tsx"),
    ("src/app/components/ui/select.tsx", "Select primitive built on Radix", "tsx"),
    ("src/app/components/ui/sonner.tsx", "Toast wrapper mapped to project theme", "tsx"),
    ("src/app/components/ui/utils.ts", "cn utility for class merging", "ts"),
]
components_md = ["# components.md", "Framework shared UI primitives with full source."]
for p, desc, lang in components:
    components_md.append(f"## {Path(p).stem}\n- Path: `{p}`\n- Description: {desc}\n")
    components_md.append(block(p, read(p), lang))
(out / "components.md").write_text("\n".join(components_md), encoding="utf-8")

layouts = [
    ("src/app/components/layouts/SharedHeader.tsx", "Top navigation/header used in corporate pages", "tsx"),
    ("src/app/components/layouts/SharedSidebar.tsx", "Primary corporate left navigation sidebar", "tsx"),
    ("src/app/components/layouts/MogzuCorporateScrollSurface.tsx", "Scrollable ambient content wrapper", "tsx"),
    ("src/app/components/branding/MogzuLogo.tsx", "Brand mark and wordmark logo component", "tsx"),
]
layouts_md = ["# layouts.md", "Shared layout and shell components with full source."]
for p, desc, lang in layouts:
    layouts_md.append(f"## {Path(p).stem}\n- Path: `{p}`\n- Description: {desc}\n")
    layouts_md.append(block(p, read(p), lang))
(out / "layouts.md").write_text("\n".join(layouts_md), encoding="utf-8")

routes_src = read("src/app/routes.tsx")
routes_md = [
    "# routes.md",
    "## Router overview",
    "- Router file: `src/app/routes.tsx`",
    "- Type: React Router v7 (`createBrowserRouter`)",
    "- Deals route: `/deals` -> `DealsPage`",
    "- Claim flow route: `/deals/claim/:id` -> `DealClaimFlow`",
    "",
    "## Full router config",
    "```tsx",
    routes_src,
    "```",
]
(out / "routes.md").write_text("\n".join(routes_md), encoding="utf-8")

theme_files = [
    ("src/styles/index.css", "css"),
    ("src/styles/tailwind.css", "css"),
    ("src/styles/theme.css", "css"),
    ("src/styles/fonts.css", "css"),
    ("src/styles/utilities.css", "css"),
]
theme_md = [
    "# theme.md",
    "Theme tokens, global styles, and Tailwind setup.",
    "## Build/theme context",
    "- Vite + React + Tailwind v4 via `@tailwindcss/vite`",
    "- No standalone `tailwind.config.*` detected; tokens are defined in CSS variables in `src/styles/theme.css`.",
]
for p, lang in theme_files:
    theme_md.append(block(p, read(p), lang))
(out / "theme.md").write_text("\n".join(theme_md), encoding="utf-8")

pages_md = """# pages.md
## /deals (Deals Page)
Entry: `src/app/components/DealsPage.tsx`
Dependencies:
- `src/app/components/DealsPage.tsx`
  - `src/app/components/layouts/SharedHeader.tsx`
    - `src/app/components/branding/MogzuLogo.tsx`
    - `src/app/components/global/RoleSwitcher.tsx`
    - `src/app/components/global/RoleBanner.tsx`
    - `src/app/components/global/RoleTopNavItems.tsx`
    - `src/app/lib/demoRole.tsx`
    - `src/imports/svg-camfkj9vq4.ts`
  - `src/app/components/layouts/SharedSidebar.tsx`
    - `src/app/components/branding/MogzuLogo.tsx`
    - `src/imports/svg-camfkj9vq4.ts`
  - `src/app/components/layouts/MogzuCorporateScrollSurface.tsx`
    - `src/app/components/layouts/MogzuAmbientBackdrop.tsx`
  - `src/styles/index.css`
    - `src/styles/tailwind.css`
    - `src/styles/theme.css`
    - `src/styles/fonts.css`
    - `src/styles/utilities.css`

## /deals/claim/:id (Deal Claim Flow)
Entry: `src/app/components/DealClaimFlow.tsx`
Dependencies:
- `src/app/components/DealClaimFlow.tsx`
- `src/app/components/layouts/SharedHeader.tsx`
- `src/app/components/layouts/SharedSidebar.tsx`
- `src/app/components/layouts/MogzuCorporateScrollSurface.tsx`
- `src/styles/index.css`
"""
(out / "pages.md").write_text(pages_md, encoding="utf-8")

extract_md = """# extractable-components.md
## SharedHeader
- Source: `src/app/components/layouts/SharedHeader.tsx`
- Category: layout
- Description: Top header with search, role switcher, and user dropdown menu.
- Extractable props: searchPlaceholder (string, default: \"Search bookings, events, users...\"), searchValue (string, default: \"\"), brandInHeader (string, default: \"mobileOnly\")
- Hardcoded: logo assets, user menu labels, icon SVG paths, gradient/background classes

## SharedSidebar
- Source: `src/app/components/layouts/SharedSidebar.tsx`
- Category: layout
- Description: Corporate sidebar navigation with collapsible mode and badges.
- Extractable props: collapsed (boolean, default: false), activeNav (string, default: \"\"), unreadNotificationsCount (number, default: 2), unreadMessagesCount (number, default: 0)
- Hardcoded: nav labels, icon mappings, section headings, class names

## MogzuCorporateScrollSurface
- Source: `src/app/components/layouts/MogzuCorporateScrollSurface.tsx`
- Category: layout
- Description: Scroll surface with ambient backdrop for corporate pages.
- Extractable props: className (string, default: \"\")
- Hardcoded: backdrop variant/density and wrapper structure

## MogzuLogo
- Source: `src/app/components/branding/MogzuLogo.tsx`
- Category: basic
- Description: Shared logo component for wordmark and mark variants.
- Extractable props: variant (string, default: \"wordmark\"), blendWhite (boolean, default: true), wordmarkAlign (string, default: \"center\")
- Hardcoded: logo image sources and blend behavior
"""
(out / "extractable-components.md").write_text(extract_md, encoding="utf-8")

(root / ".superdesign").mkdir(parents=True, exist_ok=True)
design = """# design-system.md
## Product context
Mogzu corporate workspace web app (React + Vite + Tailwind). The Deals page is part of the authenticated corporate dashboard shell.

## Visual direction (current system)
- Base font stack: Inter for body UI, Montserrat for heading/label hierarchy
- Core neutrals: white surfaces, slate text hierarchy, soft gray borders
- Brand accents: blue (`#2563eb`, `#4379ee`) and orange deal tags (`#FA8D40`)
- Surface style: rounded cards (10px-16px), subtle ring overlays, soft shadows
- Density: compact enterprise dashboard spacing with quick-scan cards and sticky filters

## Core tokens
- Background: `#ffffff`, corporate page background `#FFFDF9`
- Primary text: `#0e1e3f`
- Muted text: `#64748b` / `#717182`
- Primary action: `#4379ee` (hover darker)
- Radius base: `0.625rem` (10px)
- Standard spacing scale: 4, 8, 16, 24, 32, 48

## Component patterns
- Layout shell: fixed left sidebar + top header + scrollable content column
- KPI cards: compact metric tiles in 3-column responsive grid
- Sticky filter bar: category chips + search + sort controls
- Deal card: media header with gradient overlay + metadata + primary CTA
- Empty/error/loading states: dedicated card blocks with icon + explanatory text + retry/reset action

## Motion and interactions
- Light hover lift on cards (`-translate-y-0.5`) with increased shadow
- Input focus rings use blue semi-transparent ring
- Skeleton loading uses pulse/shimmer placeholders

## Constraints for redesign iteration
Use only existing typography, color families, spacing rhythm, and border radii from project CSS variables and current Tailwind utility usage. Keep the same information architecture and shell structure while modernizing visual treatment.
"""
(root / ".superdesign" / "design-system.md").write_text(design, encoding="utf-8")

print("superdesign init files generated")
