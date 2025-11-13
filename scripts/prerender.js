import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function prerender() {
  const vite = await createViteServer({
    root,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });

  const template = fs.readFileSync(path.resolve(root, 'index.html'), 'utf-8');
  const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
  const appHtml = await render();
  const html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  const outDir = path.resolve(root, 'dist-ssr');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);

  await vite.close();
  console.log('SSR snapshot written to dist-ssr/index.html');
}

prerender();
