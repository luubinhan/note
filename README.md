# note

My personal note taking app.

## Local development

```bash
npm install
npm run dev
```

Build and preview the production bundle (includes the `/note/` base path):

```bash
npm run build
npm run preview
```

## GitHub Pages

Site URL: https://luubinhan.github.io/note/

Every push to `main` builds and deploys via GitHub Actions (`.github/workflows/deploy.yml`).

### One-time setup

1. Open the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
3. Push to `main` (or re-run the workflow) and wait for the deploy job to finish.
