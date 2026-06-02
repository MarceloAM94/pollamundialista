<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design Decisions (Phase 8)
- Background: `#000000` (negro absoluto), cards: `#111217` (gris oscuro)
- Primary brand: Gold `#D4AF37` (trophy color)
- FIFA 2026 campaign colors: Red `#E61D25`, Blue `#2A398D`, Cyan `#00A3E0`, Green `#3CAC3B`, Yellow `#FBE84E`, Purple `#A2238E`
- Cards have colored left border per group/round (colors from `src/app/lib/colores.ts`)
- Buttons: gold background `#D4AF37`, black text; admin buttons red `#E61D25`
- Inputs: `#000` background, white text, focus border in group/round color
- NavBar: black gradient, gold active state, gold avatar gradient
- Tailwind v4: custom colors defined via `@theme inline` in globals.css, but components use inline styles with direct hex for FIFA colors (avoids Tailwind class name limitations with special chars like `#`)
- Animations: `fadeIn` keyframe (0.4s ease-out) with staggered delays for cards, `shimmer` for skeletons
- Typography: `var(--font-geist-sans)` as primary font family
- CountryFlag: emoji only (ISO code fallback removed); font-family stack for cross-OS emoji support
