# 📖 Book DNA — Frontend

**The interface where readers confess what books did to them.**

This is the React frontend for [Book DNA](https://bookdna.fdev31.space). It's where emotions meet bookshelves — a dark, moody UI built for people who feel things when they read and want proof of it.

🔗 **Live:** [bookdna.fdev31.space](https://bookdna.fdev31.space)  
⚙️ **Backend repo:** [bookDNA](https://github.com/shrutipandey15/bookDNA)

---

## What You Can Do

**Build your emotional shelf.** Search for books (fuzzy-matched across Google Books, Open Library, and a self-growing local catalog), tag them with up to 24 emotions, score intensity 1–10, and write public echoes — one-line emotional verdicts visible to other readers.

**Discover your reader DNA.** After 3+ books, generate your personality profile. The engine analyzes your emotion patterns — what you gravitate toward, what you avoid, what co-occurs — and assigns one of 8 archetypes. Export it as a shareable PNG card.

**See your patterns.** Emotion heatmap across your shelf. Stats breakdown. Personality history over time. Monthly recaps. The data is yours.

**Admin it.** If you're running an instance — dashboard with user stats, a browsable book catalog, database health, and token cleanup.

---

## Stack

| What | How |
|------|-----|
| Framework | React 18 + React Router 6 |
| Build | Vite 5 |
| Styling | Vanilla CSS with custom properties |
| Export | html2canvas for DNA card PNG |
| Fonts | Cormorant Garamond — because data deserves typography |

No component library. No Tailwind. Every pixel is intentional.

---

## Pages

| Route | What happens |
|-------|-------------|
| `/` | Your shelf — books as spined cards with emotion tabs, filter/sort, analytics |
| `/login` | Auth with password strength meter, lockout countdown, client-side validation |
| `/admin` | Dashboard, user management, book catalog browser, DB health (admin only) |

---

## The Shelf

Each book renders as a physical book card — spine colored by primary emotion, cover from Google Books (styled fallback if unavailable), emotion tabs on the edge, intensity bar on the side. Click to edit. Swipe to explore.

Optimistic CRUD — adds, edits, and deletes happen instantly in the UI and roll back if the API disagrees.

---

## Search

The entry modal has an autocomplete search that queries the backend's three-layer engine:

```
You type "iron flam"
      ↓
Local catalog (trigram fuzzy match) + Google Books + Open Library
      ↓
Deduplicated, scored, ranked
      ↓
"Iron Flame" by Rebecca Yarros — first result, with cover
```

Debounced at 600ms. Minimum 3 characters. Results show cover, author, year.

---

## Run Locally

```bash
npm install
npm run dev     # → localhost:3000
```

Vite proxies `/api` to `localhost:8000`. Make sure the [backend](https://github.com/shrutipandey15/bookDNA) is running.

### Build & Deploy

```bash
npm run build   # → dist/
```

Set `VITE_API_URL=/api` in `.env.production`. Copy `dist/` to your web server.

---

## Project Structure

```
src/
├── App.jsx                    Shelf, tabs, main shell
├── contexts/
│   └── AuthContext.jsx        Login/register/logout state
├── services/
│   ├── api.js                 apiFetch + token refresh
│   ├── offline.js             localStorage entry cache
│   └── emotions.js            24 emotions: labels, colors, icons
├── components/
│   ├── BookCard.jsx           Spined book card with emotion tabs
│   ├── EntryModal.jsx         Add/edit with search autocomplete
│   ├── DNACard.jsx            Personality card + PNG export
│   ├── ShareModal.jsx         Native share / clipboard fallback
│   ├── HeatmapPanel.jsx       Emotion × book matrix
│   ├── EchoesPanel.jsx        Public emotional verdicts
│   ├── StatsPanel.jsx         Reading statistics
│   └── ErrorBoundary.jsx      Graceful crash handling
├── pages/
│   ├── AuthPage.jsx           Login/register + password strength
│   └── AdminPage.jsx          Dashboard, users, catalog, DB health
└── styles/
    └── global.css             Theme variables, dark palette
```

---

## What's Next

See [ROADMAP.md](./ROADMAP.md) — public profiles, Goodreads import, reading status tracking, DNA comparison, and eventually a community where readers find each other through what they feel.

---

## License

MIT

---

*Every book you've ever loved changed you in ways you can't articulate.*

*This tries.*