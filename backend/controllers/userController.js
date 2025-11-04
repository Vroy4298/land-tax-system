import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';
import { createToken } from '../utils/jwt.js';

const getRequestBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try { resolve(JSON.parse(body || '{}')); } catch (e) { reject(e); }
  });
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = await getRequestBody(req);
    const db = await connectDB();
    const users = db.collection('users');
    const existing = await users.findOne({ email });
    if (existing) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User already exists' }));
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, password: hashed, role: 'user', createdAt: new Date() });
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Registered', userId: result.insertedId }));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Registration failed' }));
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = await getRequestBody(req);
    const db = await connectDB();
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid credentials' }));
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid credentials' }));
      return;
    }
    const token = createToken(String(user._id));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ token }));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Login failed' }));
  }
};
