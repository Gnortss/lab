# lab.devsoup.xyz

A collection of small demos, visualizations, calculators and games.

## Adding things

**Small app (hosted here):** create `apps/<slug>/` with a `meta.json` (`title`, `description`, `tags`). It is served at `/<slug>/`.
- Plain HTML/JS: just put an `index.html` in the folder, and it is copied as-is.
- With a build step (Vite etc.): add a `package.json` with a `build` script that outputs to `dist/`.
  For Vite, set `base: './'` in `vite.config` so assets resolve under `/<slug>/`.

**Bigger project (hosted elsewhere):** add an entry to `links.json`.

## Commands

```sh
pnpm install
pnpm dev      # wrangler dev + rebuild on file changes (refresh the browser)
pnpm build    # -> dist/
pnpm deploy   # build + wrangler deploy to lab.devsoup.xyz
```
