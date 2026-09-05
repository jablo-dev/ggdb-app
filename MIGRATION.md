Angular / Material migration
============================

The application now uses Angular, Angular CLI, CDK and Material 22.1.5 with
TypeScript 6.0. PrimeNG, PrimeNG themes, PrimeIcons and the PrimeUI Tailwind
plugin have been removed. The lockfile is included for repeatable installs.

Run `npm ci` and `npm start`. Node must satisfy
`^22.22.3 || ^24.15.0 || ^26.0.0`.

The new dark Material theme uses slate surfaces, cyan accents, spacious panels,
subtle orbital decoration and reduced-motion support. Existing saved accent,
surface, language, playtime, rarity, card-flip and animation preferences remain
available. Feature routes load on demand. Chart.js continues to render the
statistics, independently of PrimeNG. The editor retains DD/MM/YYYY date entry
and sends local YYYY-MM-DD dates to the existing API.

Validation
----------

- Production build passes, below the existing 1 MB initial bundle warning budget.
- Browser checks with intercepted API responses cover login, dashboard charts,
  library cards/table/timeline and search, disabled editor controls, scoring,
  disabled score categories, cover selection, cancelling deletion, update
  payloads, language and theme persistence, and admin pagination/details.
- Unit tests were not added or run, as requested.
- Browser previews are in the ignored `artifacts/` folder. The optional
  `node scripts/browser-smoke.mjs` check uses local Edge and a running dev server;
  its API requests are intercepted and do not change production records.

Live-account verification remains: registration/invitation delivery, real API
CRUD and session handling, live IGDB results/images, and clipboard/download
permissions. Existing API URLs and authentication behavior were retained.

References: https://angular.dev/reference/versions and
https://material.angular.dev/guide/theming . Angular's core and CLI migrations
were applied, including explicit eager change detection and XHR behavior to
preserve the existing asynchronous flows.
