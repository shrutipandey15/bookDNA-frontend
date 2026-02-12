# ◈ Book DNA — Frontend

**Not what you read. What it did to you.**

This is the face of Book DNA — the interface where readers log the emotional wreckage of their reading life, discover their reading personality, and share it with the world. Built with React, designed to feel like a bookshelf that knows your secrets.

---

## What This Does

Book DNA replaces star ratings with emotional truth. Instead of "4 out of 5 stars," you tag a book with *grief*, *2am*, *obsession* — the feelings it actually left behind. After three books, the app generates your reading personality: a shareable card that tells you something about yourself you probably already suspected but never had words for.

The frontend handles the entire user journey:

**Log** → Add books, tag emotions, set intensity, write echoes
**Discover** → See your heatmap, stats, and emotional patterns
**Reveal** → Generate your DNA card — your reading personality
**Share** → Beautiful OG images for social sharing

---

## Screenshots

*The Shelf — your emotional reading history, rendered as tactile book cards*

*The DNA Card — your reading personality, revealed*

*The Heatmap — emotion × book matrix, patterns you didn't know you had*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite |
| Routing | React Router v6 |
| Styling | Vanilla CSS with custom properties |
| Typography | Cormorant Garamond + Outfit + JetBrains Mono |
| Covers | Open Library Covers API |
| Backend | FastAPI (separate repo) |

---

## Getting Started

```bash
# Clone
git clone <repo-url>
cd book-dna-frontend

# Install
npm install

# Run (make sure the backend is running on port 8000)
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000)

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`, so both frontend and backend need to be running.

---

## Project Structure

```
src/
├── main.jsx                  React root + router
├── App.jsx                   Shell — auth gating, data loading, tab navigation
├── App.css
│
├── services/
│   ├── api.js                Every API call + JWT token management
│   └── emotions.js           Emotion constants, colors, icons, helpers
│
├── components/
│   ├── BookCard.jsx/css       Shelf card — cover, spine, emotion tabs, 3D tilt
│   ├── EntryModal.jsx/css     Add/edit modal — emotion picker, intensity slider
│   ├── DNACard.jsx/css        Personality card — fingerprint bars, blind spots
│   └── Panels.jsx/css         Heatmap, Echoes feed, Stats dashboard
│
├── pages/
│   └── AuthPage.jsx/css       Login / register flow
│
└── styles/
    └── global.css             CSS variables, base resets, shared animations
```

---

## Design Language

Book DNA's visual identity is built on a few deliberate choices:

**Dark canvas.** `#06060a` — nearly black, because books live in your head at night.

**Emotion-driven color.** Every element inherits its accent from the dominant emotion. A grief-heavy shelf looks different from an obsession-heavy one. The UI literally reflects what you feel.

**Tactile books.** Cards have spines, page edges, and sticky-note emotion tabs. They tilt in 3D on hover. The metaphor is a physical bookshelf, not a database.

**Three typefaces, three roles:**
- **Cormorant Garamond** — the literary voice. Book titles, personality names, quotes. Serif, warm, bookish.
- **Outfit** — the interface voice. Navigation, labels, body text. Clean, modern, stays out of the way.
- **JetBrains Mono** — the data voice. Counts, percentages, timestamps. Precise, technical, trustworthy.

**Animations that mean something.** Books stagger in like they're being shelved. The DNA card reveals with a glow. Emotion bars grow to fill. Nothing moves without purpose.

---

## Key Components

### BookCard
The heart of the shelf view. Fetches real book covers from Open Library, falls back to a styled card with emotion colors if the cover isn't available. Features a colored spine (primary emotion), sticky-note tabs (all tagged emotions), an intensity bar on the right edge, and a 3D perspective tilt on hover.

### EntryModal
The add/edit flow. Emotion tags are pill-shaped toggles that glow in their emotion color when selected. The intensity slider goes from 1 ("barely") to 10 ("wrecked"). The Public Echo section is visually separated — it's the only part other people might see.

### DNACard
The personality reveal. Renders with a subtle glow in the personality color, animated fingerprint bars, blind spots as italic callouts, and a footer with the username. Designed to be screenshot-worthy.

### Panels
Three analytics views: **Heatmap** (scrollable emotion × book matrix), **Echoes** (public vibes in gradient cards), and **Stats** (reading metrics in a dashboard grid).

---

## API Integration

All API calls live in `src/services/api.js`. The module handles:

- **Token storage** in localStorage (access + refresh)
- **Auto-refresh** — if a request returns 401, it silently refreshes the token and retries
- **Logout** — clears tokens and reloads

Every function is a clean async call: `getEntries()`, `createEntry(data)`, `generateDNA()`, etc. No global state library — the App component manages state and passes it down. This keeps the architecture simple and portable to React Native.

---

## Connecting to the Backend

**Development:** Vite proxies `/api` → `http://127.0.0.1:8000`

**Production:** Replace the proxy with an environment variable:

```js
// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || "/api";
```

```bash
# .env.production
VITE_API_URL=https://your-api-domain.com/api
```

---

## Mobile

The React Native app is planned as the primary mobile experience. The web frontend shares:

- The entire `services/api.js` layer (identical API calls)
- Emotion constants and color system
- DNA card layout logic
- The design language and typography choices

What gets rebuilt: CSS → StyleSheet, HTML → React Native components, navigation → React Navigation.

---

## Build

```bash
npm run build     # Output in dist/
npm run preview   # Preview production build locally
```

Deploy `dist/` to Vercel, Netlify, or any static host.

---

## License

Private. Not open source.

---

*Because "4 stars" never captured what a book actually did to you.*