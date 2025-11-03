export const handlePropertyRoutes = (req, res) => {
  // placeholder for property routes
  if (req.url === '/api/properties' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Properties route placeholder' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Property route not found' }));
};
