# Project memory

## Product intent & audience

- Appian Fighting Championship (AFC) — a mixed martial arts promotion website.
- Audience: fans browsing fighters, rankings, fight results, news, and buying event tickets.
- Single-page app; hash-based client-side routing.

## Brand personality & voice

- Sports promotion tone; content is embedded directly in code (fighters, news stories, event detail pages).
- Division names used as-is: Lightweight, Heavyweight.

## Visual design & UX direction

- React 19 + Vite + Tailwind CSS.
- App logic and content concentrated in one large app file (~3,150 lines) plus a large stylesheet; files live in project root, not `src/`.
- Pages: Fighters list/profiles, Rankings, Divisions, Fight Night detail pages (1, 2, 3), News list + individual article routes, Ticket booking (map, attendee form, generated demo ticket).
- Fighter records are computed automatically from fight result data.

## Decisions, constraints & rationale

- **Do not rebuild, redesign, replace, or simplify.** Continue developing the existing project; preserve all existing functionality and content.
- Await user approval before making any code changes.
- Two build blockers identified:
  1. `index.html` entry path points to a non-existent `src/` folder; actual app files are in project root.
  2. `@appdeploy/client` is imported but not installable outside AppDeploy.
- AppDeploy dependencies to migrate/remove:
  - `@appdeploy/client` — used only in the ticket booking form submission.
  - `index.ts` (AppDeploy server) — validates and stores bookings in AppDeploy DB table `ticket_bookings`.
  - Harmless leftovers: two Vite config build settings, three AppDeploy metadata files (build manifest, SBOM, tests file).
- Supabase is already connected to the project and is the natural replacement for the booking backend.
- Proposed migration: fix entry path, create `ticket_bookings` table in Supabase matching existing fields, swap frontend booking call from AppDeploy client to Supabase.

## Open questions & assumptions

- Existing ticket bookings stored in AppDeploy's DB are not in the repo; assume unrecoverable unless user provides an export.
- Data content (fighters, fights, news, rankings) assumed complete and intact in code.
- Orlando Maiolo (released fighter) has no country/gym entry in details map — cosmetic only, consistent with off-roster status; decide whether to leave or patch.
- User has not yet approved the proposed migration steps.