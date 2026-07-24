# React + Tailwind + GitHub Pages Scaffold

**Date:** 2026-07-24  
**Repo:** [luubinhan/note](https://github.com/luubinhan/note)  
**Status:** Approved design

## Goal

Scaffold a React + TypeScript + Tailwind CSS app and publish it to GitHub Pages automatically on every commit to `main`. This round is scaffold only — no note-taking features.

## Context

- Repo is nearly empty (`README.md`, `.gitignore`, `.vscode/`).
- README describes a personal note-taking app; note UI comes later.
- Project Pages URL will be `https://luubinhan.github.io/note/`.

## Decisions

| Topic | Choice |
|-------|--------|
| Scope | Scaffold only |
| Language | TypeScript |
| Routing | None (bare single page) |
| Build tool | Vite |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Package manager | npm |
| Deploy | GitHub Actions → official Pages deploy (`upload-pages-artifact` + `deploy-pages`) |

### Alternatives considered

1. **Vite + Tailwind v4 + Actions Pages (chosen)** — modern, official flow, no `gh-pages` branch.
2. **peaceiris/actions-gh-pages → `gh-pages` branch** — works, but adds branch clutter.
3. **Create React App + `gh-pages` npm script** — CRA is unmaintained; rejected.

## Architecture

Static SPA. No backend, no API, no client-side router.

```
Browser → GitHub Pages (static files from dist/)
         ↑
         GitHub Actions build on push to main
```

Vite `base` must be `'/note/'` so asset URLs resolve under the project Pages path.

## Project layout

```
note/
  .github/workflows/deploy.yml
  public/
  src/
    App.tsx              # placeholder UI proving Tailwind works
    main.tsx
    index.css            # @import "tailwindcss"
  index.html
  package.json           # scripts: dev, build, preview
  package-lock.json      # required for npm ci in CI
  vite.config.ts         # plugins: react, tailwindcss; base: '/note/'
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  .gitignore             # keep existing; ensure Vite/Node entries
  README.md              # local run, Pages URL, one-time Pages setup
```

Use the current Vite React-TS template defaults for tooling (including whatever lint config the template ships). Do not add custom ESLint fights in this scaffold.

## Deploy pipeline

**Trigger:** push to `main` only.

**Jobs:**

1. **build**
   - checkout
   - setup-node with npm cache
   - `npm ci`
   - `npm run build`
   - upload `dist/` as Pages artifact

2. **deploy**
   - needs: build
   - `actions/deploy-pages`
   - environment: `github-pages`

**Permissions:** `contents: read`, `pages: write`, `id-token: write`.  
**Concurrency:** group `pages`, `cancel-in-progress: true` — newest `main` push wins.

**One-time manual step (repo owner):** GitHub → Settings → Pages → Source = **GitHub Actions**.

**Live URL:** `https://luubinhan.github.io/note/`

Failed builds do not publish a partial site.

## Verification

- `npm run build` exits 0
- `npm run preview` shows a styled placeholder page
- After first successful `main` push (and Pages source set to Actions), the live URL loads

## Out of scope

- Note-taking UI or data persistence
- React Router / multi-page routes / 404 fallback for SPA routes
- Unit/E2E tests and lint-as-CI
- Custom domain

## Success criteria

1. `npm run dev` runs a Vite React + Tailwind app locally.
2. Push to `main` triggers Actions build + deploy.
3. Site is reachable at `https://luubinhan.github.io/note/` with correct asset paths (no broken CSS/JS).
