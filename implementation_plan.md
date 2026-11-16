# Sankore Retreat implementation plan

## Phase 1: Project Foundation
- Set up the Next.js App Router, TypeScript, Tailwind, metadata, and accessible page structure.
- Bind local development and production servers to port 5173.

## Phase 2: Media Assets & Optimization Pipeline
1. Generate `public/images/poster-hero.webp` and `poster-reveal.webp` from the supplied source frames, each below 80 KB.
2. Copy the supplied 120 JPEG frames into `/public/sequence-1/`; create a 60-frame, 900 px mobile derivative sequence in `/public/sequence-1-mobile/`.
3. Use a high-priority poster for immediate first paint and serve immutable cache headers for sequence files.
4. Configure frame counts and paths in `lib/constants.ts`.

## Phase 3: Smooth Scroll, Progressive Loading & Canvas Engine
1. Configure Lenis with `lerp: 0.06`, `duration: 1.6`, and `smoothWheel: true`; respect reduced-motion preferences.
2. Keep the hero poster visible beneath a transparent high-DPI canvas while sequence frames load.
3. Load four priority frames first; stream remaining frames near the current scroll frame and select lite mode for mobile or slow/save-data connections.
4. Use a non-blocking, two-pixel gold progress indicator.

## Phase 4: Resort Experience
- Build the hero, retreat story, experiences, villa cards, responsive enquiry form, and footer.
- Lazy-load the experiences, villas, and enquiry components.
- Use villa slugs as stable IDs and support enquiry delivery through Resend when configured.

## Phase 5: Accessibility & Responsive Design
- Respect reduced motion, use semantic landmarks, label forms, and provide keyboard-accessible navigation.
- Test desktop and mobile layouts.

## Phase 6: Inquiry Delivery
- Configure `RESEND_API_KEY`, `RESORT_INQUIRY_EMAIL`, and `RESEND_FROM_EMAIL` (`Name <email@domain>`).
- Return clear validation and service errors without exposing credentials.

## Phase 7: Pre-Deploy Verification
- Run `npm run typecheck`, `npm run lint`, and `npm run build`.
- Run `npm run test:perf` against the production server on port 5173.
- Deploy only after verifying the performance report and cache headers.

## Phase 8: Performance Budget & Automated Slow 3G Testing
- Keep each generated poster below 80 KB.
- Require a non-near-black screenshot within three seconds at 400 Kbps / 400 ms and Lighthouse TTI within ten seconds.
- Run both desktop and lite-mode mobile checks and confirm no sequence-2 requests occur on initial load.
- Write the measured values and pass/fail results to `perf-report.json`.
- This environment does not expose a TestSprite MCP tool; the local Playwright/CDP and Lighthouse runner records that limitation and runs the fallback.
