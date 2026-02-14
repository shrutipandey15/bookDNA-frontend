# Book DNA Frontend

React + Vite frontend for the Book DNA app.

It lets authenticated users log books with emotions, view analytics from the API, and generate/share a “reading personality” card.

## Current Scope

Implemented in this repo today:

- Email/password auth UI (sign in + register)
- Shelf view with add/edit/delete entries
- Book search autocomplete in the entry modal (`/books/search`)
- Emotion tagging and 1-10 intensity scoring per entry
- Shelf filters (by emotion) and sorting (newest, intensity, title)
- Analytics tabs:
  - Heatmap (`emotion x book` matrix)
  - Echoes (entries with `public_echo`)
  - Stats summary
- DNA generation flow (`/dna/generate`) and DNA card display
- DNA card export as PNG via `html2canvas`
- Native share/clipboard fallback for share text + URL
- Optimistic UI updates for create/update/delete with rollback on failure
- Local cache of entries in `localStorage`

## Known Limitations

- “Offline” support is read-cache only (`bookdna_entries` in `localStorage`); there is no offline write queue/sync yet.
- Share URLs are built as `/u/:username`, but this frontend does not define a route for public profile pages.
- No test suite or lint script is configured in `package.json`.
- Some API helpers are present but not currently used by UI tabs (`getDNAHistory`, `updateSettings`).
- DNA card subtitle year is currently hardcoded to `2026` in `src/components/DNACard.jsx`.

## Stack

- React 18
- React Router 6 (app currently runs as one main screen with tab state)
- Vite 5
- Vanilla CSS
- `html2canvas` for PNG export

## Local Development

Prereqs:

- Node.js 18+ (recommended)
- Book DNA backend running locally

Install and run:

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

### API Base URL

`src/services/api.js` uses:

```js
const API_BASE = import.meta.env.VITE_API_URL || "/api";
```

In dev, Vite proxies `/api` to `http://127.0.0.1:8000` (`vite.config.js`).

For deployed frontend, set `VITE_API_URL` to your backend API base.

## Build

```bash
npm run build
npm run preview
```

## Backend Endpoints Expected

From `src/services/api.js`, this frontend expects these endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `GET /entries`
- `POST /entries`
- `PUT /entries/:id`
- `DELETE /entries/:id`
- `GET /dna/profile`
- `POST /dna/generate`
- `GET /dna/heatmap`
- `GET /dna/stats`
- `GET /dna/history` (helper exists)
- `PATCH /user/settings` (helper exists)
- `GET /books/search?q=...`

## Storage Keys

- `bookdna_tokens`: auth tokens
- `bookdna_entries`: cached shelf entries

## Project Layout

```text
src/
  App.jsx                  Main app shell and tab logic
  contexts/AuthContext.jsx Auth state + login/register/logout wiring
  services/api.js          API calls + token refresh logic
  services/offline.js      Entry cache helpers
  services/emotions.js     Emotion dictionary (labels/colors/icons)
  components/              UI building blocks (cards, modal, panels, boundary)
  pages/AuthPage.jsx       Auth screen
  styles/global.css        Theme variables + base styles
```

## License

Private repository.
