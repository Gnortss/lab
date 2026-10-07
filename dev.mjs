// Dev server: builds once, runs `wrangler dev`, and rebuilds dist/ whenever a source file changes.
import { spawn, spawnSync } from 'node:child_process';
import { watch } from 'node:fs';

const build = () => spawnSync(process.execPath, ['build.mjs'], { stdio: 'inherit' });

// app build outputs and installs live under apps/ too; ignore them or every build would trigger another
const ignored = (f) => /(^|[\\/])(dist|node_modules|\.git)([\\/]|$)/.test(f);

let timer;
const onChange = (file) => {
  if (!file || ignored(file)) return;
  clearTimeout(timer);
  timer = setTimeout(() => { console.log(`\nchanged: ${file}, rebuilding`); build(); }, 150);
};

build();
watch('apps', { recursive: true }, (_, f) => onChange(f && `apps/${f}`));
watch('site', { recursive: true }, (_, f) => onChange(f && `site/${f}`));
for (const f of ['links.json', 'build.mjs']) watch(f, () => onChange(f));

spawn('pnpm', ['exec', 'wrangler', 'dev'], { stdio: 'inherit', shell: true })
  .on('exit', (code) => process.exit(code ?? 0));
