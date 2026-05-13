# design-system.md
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
