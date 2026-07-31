import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthUser } from '../types/auth';

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}
