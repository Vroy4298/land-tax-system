import { registerUser, loginUser } from '../controllers/userController.js';

export const handleUserRoutes = (req, res) => {
  if (req.url === '/api/users/register' && req.method === 'POST') return registerUser(req, res);
  if (req.url === '/api/users/login' && req.method === 'POST') return loginUser(req, res);

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'User route not found' }));
};
