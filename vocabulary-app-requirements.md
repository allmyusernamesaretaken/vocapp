# VocApp – Requirements Document

## Overview

A personal Progressive Web App (PWA) for a German-speaking user who reads English books and wants to save, translate, and review unknown English words. The app runs fully offline on iPhone (Safari, added to home screen) and stores all data locally on the device. The UI is entirely in English.

---

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **UI Component Library:** shadcn/ui (built on Radix UI + Tailwind) — use for all standard components such as buttons, inputs, dialogs, dropdowns, toggles, and sheets
- **Icons:** Lucide React (SVG icon library — no emojis anywhere in the app)
- **Local Storage:** Dexie.js (IndexedDB wrapper)
- **Offline Support:** `vite-plugin-pwa` with a Service Worker
- **Translation:** MyMemory free translation API (EN → DE), with a fallback manual entry field if offline
- **Deployment:** GitHub Pages (free, static hosting)

---

## Core Features

### 1. Add a Word

- A prominent input field on the home screen to type an English word
- On submission, the app automatically fetches the German translation via the MyMemory API (`https://api.mymemory.translated.net/get?q={word}&langpair=en|de`)
- The translated result is shown to the user for confirmation/editing before saving
- The user can also manually enter or correct the translation
- If offline, the translation field is left empty and the user fills it in manually

**Fields saved per word entry:**

| Field | Description |
|---|---|
| `word` | The English word (required) |
| `translation` | German translation (required) |
| `phonetic` | IPA or rough pronunciation (optional, manually entered) |
| `source` | Book or source it came from (optional, free text) |
| `dateAdded` | Auto-set to current date/time on save |
| `id` | Auto-generated unique ID |

---

### 2. Vocabulary List (Browse)

- A scrollable list of all saved words, sorted by date added (newest first) by default
- Each entry shows: English word, German translation, source (if set), and date added
- Tapping an entry opens a detail/edit view where all fields can be modified or the entry deleted
- A search/filter bar to filter by word or source
- Sort options (accessible via a sort icon button):
  - **Date added** (default, newest first)
  - **Alphabetical** (A–Z by English word)
  - **Book / Source** (grouped or sorted alphabetically by source field)

---

### 3. Settings

A dedicated Settings tab containing:

**Export section:**

The user can export their vocabulary collection in multiple formats.

| Format | Description |
|---|---|
| **CSV** | Standard comma-separated, UTF-8. Columns: `word, translation, phonetic, source, dateAdded` |
| **Anki TSV** | Tab-separated, two columns: `word` (front) and `translation` (back). Compatible with Anki's plain text import. Phonetic is appended to the front card if present. |
| **JSON** | Full raw export of all entries, useful for backup/restore |

- Each format triggers a file download in the browser
- The section shows total word count
- A **JSON Import** option allows restoring from a previously exported JSON backup

**Appearance section:**

- A toggle to switch between **dark mode** and **light mode**
- Defaults to the system preference on first launch

---

## UI / UX Requirements

- Mobile-first design, optimized for iPhone screen sizes
- **Bottom navigation bar with three tabs:**
  - **Add** — home screen for adding new words
  - **List** — browse, search, and sort the vocabulary collection
  - **Settings** — export, import, and app preferences
- Each tab in the navigation bar uses a **Lucide React icon** alongside the label
- Icons are used throughout the app for all actions (save, delete, sort, search, edit, export, import, etc.) — all sourced from Lucide React
- **No emojis anywhere in the app** — not in labels, buttons, placeholders, empty states, or messages
- Clean, minimal design
- Use an established UI component library where possible (e.g. **shadcn/ui**, Radix UI, or Headless UI) rather than building components from scratch
- **No purple gradients** — avoid purple tones and gradient backgrounds entirely; prefer neutral, monochromatic, or subtly accented color schemes
- Both **dark mode** and **light mode** are fully supported, toggled in Settings, defaulting to system preference
- The app must work and feel fully usable offline; API translation failure must be handled gracefully with a clear inline message (e.g., "Translation unavailable offline — please enter manually")

---

## PWA Requirements

- Installable via Safari's "Add to Home Screen" on iPhone
- Works fully offline after first load (Service Worker caches all app assets)
- App icon and splash screen configured in the Vite PWA plugin manifest
- App name: **"VocApp"**
- Short name: **"VocApp"**

---

## Data & Storage

- All data stored in IndexedDB via Dexie.js — no backend, no account required
- Database name: `vocapp-db`
- Single table: `words` with the fields listed above
- Data persists across sessions and app restarts
- No data is ever sent to a server (except the word text in the translation API call)

---

## Out of Scope (for now)

- Flashcard or quiz/learning mode (may be added later)
- User accounts or cloud sync
- Spaced repetition
- Audio pronunciation playback
- Browser extension
- **Camera-based word capture:** taking a photo, cropping to a word, and detecting it via OCR / image recognition (planned future feature)

---

## Deployment

- Host on **GitHub Pages** via a GitHub Actions workflow that builds and deploys on push to `main`
- The Vite `base` config must be set to the repository name for correct asset paths on GitHub Pages

---

## Project Structure (suggested)

```
vocapp/
├── public/
│   └── icons/                  # PWA icons
├── src/
│   ├── components/
│   │   ├── AddWord.jsx
│   │   ├── WordList.jsx
│   │   ├── WordDetail.jsx
│   │   └── SettingsScreen.jsx
│   ├── db/
│   │   └── db.js               # Dexie.js database setup
│   ├── hooks/
│   │   └── useWords.js         # Custom hook for CRUD operations
│   ├── utils/
│   │   ├── translate.js        # MyMemory API call
│   │   └── exportUtils.js      # CSV, TSV, JSON export/import logic
│   ├── context/
│   │   └── ThemeContext.jsx    # Dark/light mode context
│   ├── App.jsx
│   └── main.jsx
├── vite.config.js              # Includes vite-plugin-pwa config
└── package.json
```
