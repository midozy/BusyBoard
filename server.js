#!/usr/bin/env node
'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT        = process.env.PORT || 3000;
const STATUS_FILE = path.join(__dirname, '.status.json');
const STATIC_DIR  = __dirname;

// ── Persist status to disk so a server restart keeps the last state ──────────
function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8')); }
  catch { 
    return { 
      status: 'available', 
      customMessage: '',
      panelHidden: false,
      theme: 'light'
    }; 
  }
}
function writeStatus(obj) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(obj));
}

let state = readStatus();
// Ensure all fields exist in state
if (!state.customMessage) state.customMessage = '';
if (state.panelHidden === undefined) state.panelHidden = false;
if (!state.theme) state.theme = 'light';

// ── MIME types for static files ───────────────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

// ── Local IP helper ───────────────────────────────────────────────────────────
function localIP() {
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return '127.0.0.1';
}

// ── Request handler ───────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS — needed when testing from different origins on the same network
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET /api/status ───────────────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  // ── POST /api/status ──────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/status') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.status !== undefined || parsed.panelHidden !== undefined || parsed.theme !== undefined) {
          // Update only the fields that are provided
          if (parsed.status !== undefined) state.status = parsed.status;
          if (parsed.customMessage !== undefined) state.customMessage = parsed.customMessage;
          if (parsed.panelHidden !== undefined) state.panelHidden = parsed.panelHidden;
          if (parsed.theme !== undefined) state.theme = parsed.theme;
          
          writeStatus(state);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(state));
        } else {
          res.writeHead(400); res.end('Bad request');
        }
      } catch {
        res.writeHead(400); res.end('Invalid JSON');
      }
    });
    return;
  }

  // ── Static files ──────────────────────────────────────────────────────────
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // Strip query strings
  filePath = filePath.split('?')[0];
  const fullPath = path.join(STATIC_DIR, filePath);

  // Security: prevent directory traversal
  if (!fullPath.startsWith(STATIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext  = path.extname(fullPath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = localIP();
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║           BusyBoard is running           ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  Display (this machine) :                ║`);
  console.log(`  ║    http://localhost:${PORT}               ║`);
  console.log(`  ║                                          ║`);
  console.log(`  ║  Remote control (phone/tablet):          ║`);
  console.log(`  ║    http://${ip}:${PORT}              ║`);
  console.log('  ╠══════════════════════════════════════════╣');
  console.log('  ║  Ctrl+C to stop                          ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
