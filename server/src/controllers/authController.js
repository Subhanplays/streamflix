import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../db/store.js';
import { signToken } from '../utils/token.js';

export async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 12);
  const user = createUser({ name, email, password: hash, role: 'user' });
  const token = signToken(user._id, user.role);
  return res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = signToken(user._id, user.role);
  return res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function me(req, res) {
  const user = findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password, ...safe } = user;
  return res.json({ user: safe });
}
