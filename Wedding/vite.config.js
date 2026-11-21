import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Royal Wedding Invitation site.
//
// It lives inside the existing "RohitandRadha" GitHub Pages repository as a
// subdirectory, so the production build must use the matching base path:
//   https://<user>.github.io/RohitandRadha/Wedding/
//
// During local development we keep base "/" so `npm run dev` serves from
// http://localhost:5173/ and the dev server works normally.
//
// NOTE: `vite preview` receives command "serve" (not "build"), so it cannot
// pick up the deployment base from this conditional. It must therefore be told
// to serve with the same base the build was created with — the `preview`
// script in package.json passes `--base=/RohitandRadha/Wedding/` for exactly
// that reason. If the repository name ever changes, update both places.

/**
 * The invitation's two songs live at the repository root, beside the reception
 * site — they are that site's tracks, so they are referenced there rather than
 * copied into this project.
 *
 * On GitHub Pages the deployment publishes the root as the site, which makes
 * them available at `/RohitandRadha/song1.mp3` and `/RohitandRadha/song2.mp3`.
 * Development and preview do not have that layout, so this middleware answers
 * those exact two URLs from the parent folder. What is heard locally is
 * therefore the same file, at the same path, as what is heard in production.
 */
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const SONG_ROUTE = /^\/RohitandRadha\/(song[12]\.mp3)$/;

function serveSong(request, response) {
  const [pathname] = (request.url ?? '').split('?');
  const match = SONG_ROUTE.exec(pathname);
  if (!match) return false;

  const file = path.join(REPO_ROOT, match[1]);

  if (!fs.existsSync(file)) {
    response.statusCode = 404;
    response.end();
    return true;
  }

  const { size } = fs.statSync(file);
  const range = request.headers.range;

  response.setHeader('Content-Type', 'audio/mpeg');
  response.setHeader('Accept-Ranges', 'bytes');

  // Seeking needs byte ranges, exactly as the static host provides them.
  if (range) {
    const [startText, endText] = range.replace(/bytes=/, '').split('-');
    const start = Number.parseInt(startText, 10) || 0;
    const end = endText
      ? Math.min(Number.parseInt(endText, 10), size - 1)
      : size - 1;

    if (start >= size || start > end) {
      response.statusCode = 416;
      response.setHeader('Content-Range', `bytes */${size}`);
      response.end();
      return true;
    }

    response.statusCode = 206;
    response.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    response.setHeader('Content-Length', String(end - start + 1));

    if (request.method === 'HEAD') {
      response.end();
      return true;
    }

    fs.createReadStream(file, { start, end }).pipe(response);
    return true;
  }

  response.statusCode = 200;
  response.setHeader('Content-Length', String(size));

  if (request.method === 'HEAD') {
    response.end();
    return true;
  }

  fs.createReadStream(file).pipe(response);
  return true;
}

/** Serves the reception site's songs during `vite dev` and `vite preview`. */
const repositorySongs = () => {
  const middleware = (request, response, next) => {
    if (!serveSong(request, response)) next();
  };

  return {
    name: 'repository-songs',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};

export default defineConfig(({ command }) => ({
  plugins: [react(), repositorySongs()],

  base: command === 'build' ? '/RohitandRadha/Wedding/' : '/',
}));

