# thetisisland.net

The community website for Thetis Island, BC — serving residents, visitors, and the organizations that make the island work. This site replaces the original hand-coded HTML site with a modern, maintainable static site. It is managed by the Thetis Island Residents and Ratepayers Association (TIRRA) and designed so that routine content edits can be made without writing code.

## Tech Stack

- **[Astro](https://astro.build/)** — static site generator (TypeScript, strict mode)
- **[Tailwind CSS](https://tailwindcss.com/)** v4 — utility-first styling with custom design tokens
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — hosting (free tier)
- **[Decap CMS](https://decapcms.org/)** — web-based content editor (planned for Stage 3)

## Project Documentation

The `docs/` directory contains the full project history:

- **`Thetisisland_Rebuild_Spec_v2.docx`** — the current specification (source of truth for content structure, architecture, and dynamic features)
- **`Thetisisland Rebuild BuildPlan.docx`** — the staged development plan
- **`Thetisisland Rebuild Spec - Karl comments.docx`** — Karl Unger's original feedback on the v1 spec
- **`october_2025_poc/`** — the October 2025 HTML proof-of-concept, useful for design cues and working Google Calendar IDs
- **`notes.md`** — build notes including calendar IDs and design token values

## Local Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Start with network access (for testing on other devices)
npm run dev -- --host

# Build for production
npm run build

# Preview the production build
npm run preview
```

The dev server runs at `http://localhost:4321/` by default.

## Project Status

This site is being built in stages per the Build Plan:

- **Stage 1** — Scaffold (Astro project, navigation, design tokens, deployment) *current*
- **Stage 2** — Migrate static content from the current site and October PoC
- **Stage 3** — Wire up Decap CMS for content editing
- **Stage 4** — Dynamic content: calendar, webcams, membership form, ferry info
- **Stage 5** — Dynamic content: fire hazard rating, snake ferry schedule
- **Stage 6** — Polish and Karl review
- **Stage 7** — Cutover to thetisisland.net

## For Future Maintainers

The entire site is plain files in a Git repository — Astro components, Tailwind CSS, and (eventually) Markdown content. There are no databases, no PHP, and no proprietary platform dependencies. Anyone with basic web development skills can maintain this site. See the Build Plan and Spec in `docs/` for the full architectural context.
