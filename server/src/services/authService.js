import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

const SALT_ROUNDS = 12;

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id.toString(),
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export async function signupUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ConflictError('An account with this email address already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
  });

  const token = signToken(user);
  return { user: user.toJSON(), token };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = signToken(user);
  return { user: user.toJSON(), token };
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user.toJSON();
}
