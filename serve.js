const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "frontend");
const PORT = 5180;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

const server = http.createServer((req, res) => {
  let url = req.url.split("?")[0];

  // API proxy (would need backend)
  if (url.startsWith("/api/")) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Backend not available" }));
    return;
  }

  if (url === "/") url = "/index.html";

  let filePath = path.join(ROOT, url);

  if (!fs.existsSync(filePath)) {
    // SPA fallback - serve index.html for all non-file routes
    filePath = path.join(ROOT, "index.html");
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" });
    res.end(content);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  SERVER HUB v5 - Static Server\n`);
  console.log(`  Local:   http://localhost:${PORT}/\n`);
});
