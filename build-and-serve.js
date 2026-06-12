/**
 * Build the React app using esbuild directly (bypasses Vite's rollup dependency)
 * Then serve it with Cloudflare Tunnel support
 */
const esbuild = require("esbuild");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const ROOT = __dirname;
const FRONTEND = path.join(ROOT, "frontend");
const DIST = path.join(ROOT, "dist");
const SRC = path.join(FRONTEND, "src");
const PORT = 5180;

async function build() {
  console.log("Building SERVER HUB v5 frontend...\n");

  // Clean dist
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });

  // Copy static files
  const PUBLIC = path.join(FRONTEND, "public");
  if (fs.existsSync(PUBLIC)) {
    for (const f of fs.readdirSync(PUBLIC)) {
      fs.copyFileSync(path.join(PUBLIC, f), path.join(DIST, f));
    }
  }

  // Bundle the main entry
  const result = await esbuild.build({
    entryPoints: [path.join(SRC, "main.tsx")],
    bundle: true,
    outfile: path.join(DIST, "assets", "app.js"),
    format: "esm",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    jsxImportSource: "react",
    loader: {
      ".tsx": "tsx",
      ".ts": "ts",
      ".css": "css",
      ".svg": "dataurl",
      ".png": "dataurl",
      ".jpg": "file",
    },
    alias: {
      "@": SRC,
    },
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.VITE_API_URL": '""',
    },
    minify: true,
    sourcemap: false,
    metafile: false,
    external: [],
    inject: [],
    plugins: [
      {
        name: "css-inject",
        setup(build) {
          build.onLoad({ filter: /\.css$/ }, async (args) => {
            const content = fs.readFileSync(args.path, "utf8");
            // Remove tailwind directives that won't work without Tailwind processing
            let processed = content
              .replace(/@import "tailwindcss"/g, "")
              .replace(/@import "tw-animate-css"/g, "")
              .replace(/@plugin[^;]+;/g, "")
              .replace(/@custom-variant[^;]+;/g, "")
              .replace(/@tailwind[^;]+;/g, "")
              .replace(/@apply[^;]+;/g, "")
              .replace(/\b@theme\s*\{[^}]*\}/g, "")
              .replace(/@layer\s+base\s*\{[^}]*\}/g, "");
            return { contents: processed, loader: "css" };
          });
        },
      },
    ],
  });

  // Create HTML entry
  const html = `<!DOCTYPE html>
<html lang="en" class="dark" data-theme="kali">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1"/>
<title>SERVER HUB v5</title>
<meta name="description" content="SERVER HUB v5 - Professional Server Management Platform"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#root{height:100%;width:100%}
body{font-family:'Inter',sans-serif;background:#0b0616;color:#fff;overflow:hidden}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#6d28d9;border-radius:4px}
</style>
</head>
<body>
<div id="root"></div>
<script type="module" src="/assets/app.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(DIST, "index.html"), html);

  console.log("Build complete!\n");
  console.log("Files in dist/:");
  for (const f of fs.readdirSync(DIST, { recursive: true })) {
    console.log(`  ${f}`);
  }
  console.log("\n");

  // Start server
  startServer();
}

function startServer() {
  const MIME_MAP = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
  };

  const server = http.createServer((req, res) => {
    let url = req.url.split("?")[0];

    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (url === "/") url = "/index.html";
    if (url.startsWith("/api/")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Backend unavailable", status: "frontend-only" }));
      return;
    }

    let filePath = path.join(DIST, url);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST, "index.html");
    }

    const ext = path.extname(filePath);
    const ct = MIME_MAP[ext] || "application/octet-stream";
    try {
      res.writeHead(200, { "Content-Type": ct });
      res.end(fs.readFileSync(filePath));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n  ╔═══════════════════════════════════════╗`);
    console.log(`  ║       SERVER HUB v5 - RUNNING         ║`);
    console.log(`  ╚═══════════════════════════════════════╝\n`);
    console.log(`  Local URL:   http://localhost:${PORT}/\n`);

    // Auto-create Cloudflare tunnel
    tryCreateTunnel(PORT);
  });
}

function tryCreateTunnel(port) {
  // Check if cloudflared is available
  let cloudflaredPath = null;
  try {
    cloudflaredPath = execSync("where cloudflared 2>nul || echo ''", { encoding: "utf8" }).trim();
  } catch {}

  if (cloudflaredPath) {
    console.log("  Creating Cloudflare Tunnel...");
    const proc = spawn(cloudflaredPath, ["tunnel", "--url", `http://localhost:${port}`], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    proc.stdout.on("data", (data) => {
      const out = data.toString();
      const match = out.match(/https:\/\/[a-zA-Z0-9.-]+\.trycloudflare\.com/);
      if (match) {
        console.log(`\n  ╔═══════════════════════════════════════╗`);
        console.log(`  ║    🌐  PUBLIC URL (Cloudflare)        ║`);
        console.log(`  ╚═══════════════════════════════════════╝\n`);
        console.log(`  ${match[0]}\n`);
        console.log(`  Share this link to access from anywhere!\n`);
        proc.stdout.removeAllListeners("data");
      }
      process.stdout.write(out);
    });

    proc.stderr.on("data", (data) => process.stdout.write(data.toString()));
    proc.on("error", () => console.log("  Cloudflare tunnel failed to start.\n"));
  } else {
    console.log("  ⚠  cloudflared not found. Install it from:\n");
    console.log("     https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/\n");
    console.log("  Or use an alternative tunnel like ngrok, localtunnel, etc.\n");
    console.log(`  For now, access locally at http://localhost:${PORT}/\n`);
  }
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
