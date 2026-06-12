#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const path = require('path');
let tunnel = null;
const useShell = process.platform === 'win32';

function runSync(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: useShell, ...opts });
  if (res.error) {
    console.error(`Failed to run ${cmd}:`, res.error.message || res.error);
    process.exit(1);
  }
  if (res.status !== 0) process.exit(res.status || 1);
}

(async function main() {
  const root = process.cwd();
  console.log('Building frontend...');
  runSync('npm', ['--prefix', 'frontend', 'run', 'build']);
  console.log('Building backend...');
  runSync('npm', ['--prefix', 'backend', 'run', 'build']);

  console.log('Starting backend server...');
  const backend = spawn(process.execPath, ['--enable-source-maps', 'dist/index.js'], {
    cwd: path.join(root, 'backend'),
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  backend.stdout.on('data', (d) => {
    const s = d.toString();
    process.stdout.write(`[backend] ${s}`);
    if (s.includes('Server listening')) {
      startTunnel();
    }
  });
  backend.stderr.on('data', (d) => process.stderr.write(`[backend] ${d.toString()}`));

  backend.on('exit', (code) => {
    console.log('Backend exited with', code);
    if (tunnel) tunnel.close();
    process.exit(code || 0);
  });

  process.on('SIGINT', () => {
    console.log('Stopping...');
    try { backend.kill(); } catch {}
    try { if (tunnel) tunnel.close(); } catch {}
    process.exit(0);
  });

  async function startTunnel() {
    if (tunnel) return;
    try {
      const localtunnel = require('localtunnel');
      console.log('Starting public tunnel via localtunnel (port 3001)...');
      tunnel = await localtunnel({ port: 3001, host: 'https://localtunnel.me' });
      console.log('\nPublic URL:', tunnel.url, '\n');
      tunnel.on('close', () => console.log('Tunnel closed'));
    } catch (err) {
      console.error('Failed to start localtunnel:', err.message || err);
      console.log('Ensure `localtunnel` is installed or run a tunnel manually (ngrok, cloudflared, etc.).');
    }
  }
})();
