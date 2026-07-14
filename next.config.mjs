/** @type {import('next').NextConfig} */

// GitHub Pages serves this site from https://<user>.github.io/<repo>/ (a
// subpath), not the domain root, so the build needs a basePath/assetPrefix
// matching the repo name whenever it runs inside GitHub Actions. Locally
// (`npm run dev` / `npm run build` on your machine) GITHUB_ACTIONS is unset,
// so basePath stays empty and nothing changes for local development.
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

let assetPrefix = "";
let basePath = "";

if (isGithubActions) {
  // GITHUB_REPOSITORY is formatted "owner/repo" — we only want "repo".
  const repo = (process.env.GITHUB_REPOSITORY || "").replace(/.*?\//, "");
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages only serves static files — no Node server, no API routes,
  // no on-demand image optimization. `output: "export"` makes `next build`
  // emit a fully static site into ./out (what the deploy workflow uploads).
  // output: "export",
  // Static export has no image-optimization server to call, so the (unused
  // here — this app renders exercise GIFs via plain <img>, not next/image)
  // Image component must run unoptimized.
  images: {
    unoptimized: true,
  },
  // Ensures each route exports as routeName/index.html (e.g. program/index.html)
  // instead of routeName.html, which is what GitHub Pages' static file
  // server expects for clean /program/ style URLs.
  trailingSlash: true,
  assetPrefix,
  basePath,
  // Exposed to client code (see components/ExercisePhoto.tsx) so hand-built
  // asset URLs — anything not going through next/link or next/image, which
  // pick up basePath automatically — still resolve correctly under the
  // GitHub Pages subpath.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
