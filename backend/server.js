import http from 'http';
import { parse } from 'url';
import { handleUserRoutes } from './routes/userRoutes.js';
import { handlePropertyRoutes } from './routes/propertyRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  // Basic CORS preflight & headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // route delegation
  const url = parse(req.url).pathname;

  try {
    if (url.startsWith('/api/users')) return handleUserRoutes(req, res);
    if (url.startsWith('/api/properties')) return handlePropertyRoutes(req, res);

    // default route
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Land Tax Backend (no-express)'}));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
