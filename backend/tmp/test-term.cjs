const fetch = globalThis.fetch || require('node-fetch');
const WebSocket = require('ws');

function wait(ms){return new Promise(r=>setTimeout(r,ms));}

async function main(){
  const base = 'http://localhost:3001';
  for(let i=0;i<10;i++){
    try{ const r = await fetch(base+'/healthz'); if (r.ok) break; }catch(e){ }
    await wait(500);
  }
  console.log('Creating terminal session...');
  const res = await fetch(base+'/api/terminal/sessions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: 'test' }) });
  const json = await res.json().catch(()=>null);
  console.log('Create response:', json);
  if(!json || !json.id){ console.error('Failed to create session'); process.exit(1); }
  const id = json.id;
  console.log('Connecting WS to session', id);
  const ws = new WebSocket(`ws://localhost:3001/api/terminal/ws/${id}`);
  ws.on('open', ()=>{
    console.log('WS open');
    ws.send(JSON.stringify({ type: 'input', data: 'echo hello_world\n' }));
  });
  ws.on('message', (m)=>{
    try{ const msg = JSON.parse(m.toString()); console.log('WS message:', msg.type, msg.data ? msg.data.toString().slice(0,200) : ''); }
    catch(e){ console.log('WS raw:', m.toString().slice(0,200)); }
  });
  ws.on('close', ()=>{ console.log('WS closed'); process.exit(0); });
  ws.on('error',(err)=>{ console.error('WS error', err); process.exit(1); });
  setTimeout(()=>{ try{ ws.close(); }catch(e){} }, 5000);
}

main().catch(e=>{ console.error(e); process.exit(1); });
