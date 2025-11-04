import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
  } catch (err) {
    return null;
  }
};
