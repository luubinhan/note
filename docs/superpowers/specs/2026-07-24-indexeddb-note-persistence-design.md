# IndexedDB Single-Note Persistence

**Date:** 2026-07-24  
**Repo:** [luubinhan/note](https://github.com/luubinhan/note)  
**Status:** Approved design

## Goal

Persist the single `contentEditable` note so a refresh (or leaving the tab) does not lose plain-text content. Storage is browser IndexedDB. Export UI is deferred; the persistence API should stay easy to read later for export.

## Context

- App is a Vite + React + Tailwind SPA with one full-page `contentEditable` editor (`src/App.tsx`).
- No persistence today; focus/caret setup runs on mount only.
- Product choice: one draft note only (not a multi-note list).

## Decisions

| Topic | Choice |
|-------|--------|
| Scope | One draft note |
| Storage | IndexedDB (native API, no Dexie/idb) |
| Content format | Plain text (`innerText`) |
| Save timing | Debounce ~400ms on `input`, plus flush on `visibilitychange` / `pagehide` |
| Structure | `noteDb` module + `usePersistedNote` hook; `App` stays UI-only |
| Error UX | Log only; editor stays usable if IndexedDB fails |
| Export | Out of scope now; hook/DB must expose readable text later |

### Alternatives considered

1. **`localStorage`** — simpler sync API; enough for small text. Rejected in favor of IndexedDB for headroom and future binary/longer content.
2. **`localStorage` with a swappable storage interface** — good migration path; skipped because IndexedDB was chosen directly.
3. **Dexie / `idb` library** — nicer if many stores/queries; overkill for one record. Rejected for YAGNI; revisit if multi-note lands.
4. **Inline IndexedDB in `App`** — fewest files; rejected because it muddies UI and makes export/reuse harder.
5. **`innerHTML` persistence** — preserves rich formatting; rejected; product wants plain text for now.

## Architecture

```
contentEditable (App)
        │
        ▼
usePersistedNote(editorRef)
        │
        ▼
noteDb.getNote() / noteDb.saveNote(text)
        │
        ▼
IndexedDB: note-app / notes / key "draft"
```

### Units

| Unit | Responsibility | Depends on |
|------|----------------|------------|
| `src/lib/noteDb.ts` | Open DB, get/put single draft | IndexedDB |
| `src/hooks/usePersistedNote.ts` | Load on mount, debounce save, flush on hide | `noteDb`, editor ref |
| `src/App.tsx` | Layout + editor DOM; call hook | `usePersistedNote` |

### Data model

```ts
type NoteRecord = {
  id: 'draft'
  text: string
  updatedAt: number // Date.now()
}
```

- Database name: `note-app`
- Object store: `notes` (keyPath: `id`)
- Single key: `'draft'`
- Empty editor saves `text: ''` (clears content, keeps record shape)

## Data flow

1. Mount → `getNote()` → if text present, set `el.textContent` (or equivalent plain assignment) → focus caret (end if content, start if empty — match current focus behavior where practical).
2. User types → `input` → reset debounce timer (400ms) → `saveNote(el.innerText)`.
3. Document becomes hidden (`visibilitychange` when `document.visibilityState === 'hidden'`) or `pagehide` → cancel timer → `saveNote` immediately (async, fire-and-forget with error log).
4. Unmount → remove listeners; cancel pending timer; optional final flush.

Use `innerText` (not `textContent`) when reading from the editor so line breaks from the contentEditable map to `\n` more faithfully. On restore, assigning plain text via `textContent` is fine (no HTML).

## Error handling

- IndexedDB unavailable / quota / transaction errors: `console.error`, do not throw into React render, do not block typing.
- No toast or banner in this scope.
- Failed load → empty editor, still focusable.

## Testing (manual)

1. Type several lines → wait >400ms → refresh → content restored.
2. Type → switch tab immediately → return / refresh → content restored.
3. Delete all text → wait or switch tab → refresh → editor empty.

## Out of scope

- Export download UI
- Multi-note list / titles
- Cross-tab live sync (`storage` / `BroadcastChannel`)
- Cloud sync
- Rich-text / HTML persistence
- User-visible save/error indicators
- New npm dependencies for IDB wrappers

## Success criteria

- Refresh does not lose the draft note under normal browser conditions.
- Persistence logic lives outside `App` UI (`noteDb` + `usePersistedNote`).
- Content stored and restored as plain text via IndexedDB.
- Future export can call `getNote()` or read current editor text without a rewrite.
