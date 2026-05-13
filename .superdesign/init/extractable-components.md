# extractable-components.md
## SharedHeader
- Source: `src/app/components/layouts/SharedHeader.tsx`
- Category: layout
- Description: Top header with search, role switcher, and user dropdown menu.
- Extractable props: searchPlaceholder (string, default: "Search bookings, events, users..."), searchValue (string, default: ""), brandInHeader (string, default: "mobileOnly")
- Hardcoded: logo assets, user menu labels, icon SVG paths, gradient/background classes

## SharedSidebar
- Source: `src/app/components/layouts/SharedSidebar.tsx`
- Category: layout
- Description: Corporate sidebar navigation with collapsible mode and badges.
- Extractable props: collapsed (boolean, default: false), activeNav (string, default: ""), unreadNotificationsCount (number, default: 2), unreadMessagesCount (number, default: 0)
- Hardcoded: nav labels, icon mappings, section headings, class names

## MogzuCorporateScrollSurface
- Source: `src/app/components/layouts/MogzuCorporateScrollSurface.tsx`
- Category: layout
- Description: Scroll surface with ambient backdrop for corporate pages.
- Extractable props: className (string, default: "")
- Hardcoded: backdrop variant/density and wrapper structure

## MogzuLogo
- Source: `src/app/components/branding/MogzuLogo.tsx`
- Category: basic
- Description: Shared logo component for wordmark and mark variants.
- Extractable props: variant (string, default: "wordmark"), blendWhite (boolean, default: true), wordmarkAlign (string, default: "center")
- Hardcoded: logo image sources and blend behavior
