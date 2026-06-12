(async () => {
  try {
    const localtunnel = require('localtunnel');
    console.log('Starting localtunnel on port 3001...');
    const tunnel = await localtunnel({ port: 3001 });
    console.log('Public URL:', tunnel.url);
    tunnel.on('close', () => console.log('Tunnel closed'));
    process.on('SIGINT', async () => { await tunnel.close(); process.exit(0); });
  } catch (err) {
    console.error('Failed to start localtunnel:', err.message || err);
    process.exit(1);
  }
})();
