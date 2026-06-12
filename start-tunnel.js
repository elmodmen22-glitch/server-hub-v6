// Starts localtunnel and prints the URL
const { spawn } = require('child_process');
const http = require('http');

const PORT = 5173;
const logFile = require('path').join(__dirname, 'tunnel_url.log');

// Start localtunnel via npx
const proc = spawn('npx.cmd', ['--yes', 'localtunnel', '--port', String(PORT)], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let urlFound = false;

const handler = (data) => {
  const text = data.toString();
  console.log('[tunnel]', text.trim());
  const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.loca\.lt/);
  if (match && !urlFound) {
    urlFound = true;
    const url = match[0];
    require('fs').writeFileSync(logFile, url, 'utf8');
    console.log('\n  ╔═══════════════════════════════════════╗');
    console.log('  ║  🌐  PUBLIC URL (localtunnel)         ║');
    console.log('  ╚═══════════════════════════════════════╝\n');
    console.log(`  ${url}\n`);
    console.log('  Share this link to access from anywhere!\n');
  }
};

proc.stdout.on('data', handler);
proc.stderr.on('data', handler);
proc.on('error', (err) => console.error('Tunnel error:', err.message));
proc.on('exit', (code) => console.log('Tunnel exited with code', code));

// Timeout guard
setTimeout(() => {
  if (!urlFound) console.log('Tunnel still initializing...');
}, 15000);
