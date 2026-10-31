// Builds the previous React app (legacy-react/) and publishes it inside this Next.js project:
//   legacy-react/build/index.html -> public/spa.html     (served for /app, /my-order, /invoices, ...)
//   legacy-react/build/static/*   -> public/static/*
// REACT_APP_* variables (Firebase config) come from this Vercel project's environment at build time.
import { execSync } from "node:child_process";
import { cpSync, rmSync, existsSync, copyFileSync } from "node:fs";

const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });

run("npm install --no-audit --no-fund", { cwd: "legacy-react" });
run("npm run build", { cwd: "legacy-react", env: { ...process.env, CI: "false", GENERATE_SOURCEMAP: "false" } });

rmSync("public/static", { recursive: true, force: true });
cpSync("legacy-react/build/static", "public/static", { recursive: true });
copyFileSync("legacy-react/build/index.html", "public/spa.html");
if (existsSync("legacy-react/build/manifest.json")) copyFileSync("legacy-react/build/manifest.json", "public/manifest.json");
console.log("legacy app published to public/spa.html");
