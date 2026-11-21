/**
 * The invitation's two songs.
 *
 * Both tracks already live at the repository root, beside the reception site.
 * The GitHub Pages deployment publishes that root as the site itself, so they
 * are reachable one level above the Wedding build's own base path — no copy,
 * no rename, no second upload:
 *
 *   https://<user>.github.io/RohitandRadha/song1.mp3
 *   https://<user>.github.io/RohitandRadha/Wedding/  ← this build
 *
 * `npm run dev` and `npm run preview` serve these same two URLs from the repo
 * root (see the middleware in `vite.config.js`), so the guest's browser loads
 * exactly the files that production serves.
 */
const SITE_ROOT = '/RohitandRadha/';

export const TRACKS = [
  { id: 'song1', label: 'Song 1', src: `${SITE_ROOT}song1.mp3` },
  { id: 'song2', label: 'Song 2', src: `${SITE_ROOT}song2.mp3` },
];
