// Builds every app in apps/ into dist/<slug>/ and generates dist/index.html.
// An app with a package.json is built with `pnpm run build` and must output to its own dist/.
// An app without one is copied as-is (plain HTML/JS).
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const OUT = 'dist';
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// empty dist/ rather than delete it: on Windows a running `wrangler dev` holds the folder open
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) rmSync(join(OUT, f), { recursive: true, force: true });

const entries = [];

for (const d of readdirSync('apps', { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const slug = d.name;
  const dir = join('apps', slug);
  const meta = readJson(join(dir, 'meta.json'));

  if (existsSync(join(dir, 'package.json'))) {
    console.log(`building ${slug}`);
    execSync('pnpm run build', { cwd: dir, stdio: 'inherit' });
    cpSync(join(dir, 'dist'), join(OUT, slug), { recursive: true });
  } else {
    console.log(`copying ${slug}`);
    cpSync(dir, join(OUT, slug), { recursive: true, filter: (src) => basename(src) !== 'meta.json' });
  }
  entries.push({ ...meta, url: `/${slug}/` });
}

for (const link of readJson('links.json')) entries.push({ ...link, external: true });

entries.sort((a, b) => a.title.localeCompare(b.title));

const cards = entries
  .map(
    (e) => `
    <a class="card" href="${esc(e.url)}"${e.external ? ' target="_blank" rel="noopener"' : ''}>
      <h2>${esc(e.title)}${e.external ? ' <span class="ext">↗</span>' : ''}</h2>
      <p>${esc(e.description)}</p>
      <ul class="tags">${(e.tags ?? []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </a>`,
  )
  .join('');

const template = readFileSync('site/index.html', 'utf8');
writeFileSync(join(OUT, 'index.html'), template.replace('<!-- CARDS -->', cards));
console.log(`done: ${entries.length} entries`);
