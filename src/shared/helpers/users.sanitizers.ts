import { Document } from 'mongoose';
import { _IDbUser } from '../interfaces/users.interface';

export function sanitizeUserFn(user: Document): _ISafeUser {
  if (!user) {
    return null;
  }

  // Remove or modify sensitive or unnecessary fields
  delete user.__v; // Remove Mongoose version key if present
  user._id.toString();

  return user as unknown as _ISafeUser;
}

export function sanitizeLoginUserFn(user: _IDbUser): _ISafeUser {
  if (!user) {
    return null;
  }

  // Return only the necessary fields
  return {
    _id: user._id.toString(),
    email: user.email,
    isVerified: user.isVerified
  };
}
