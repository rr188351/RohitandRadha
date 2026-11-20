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
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/RohitandRadha/Wedding/' : '/',
}));

