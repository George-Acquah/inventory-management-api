import { Document } from 'mongoose';

interface _IDbUser extends Document {
  email: string;
  name: string;
  readonly password: string;
  userImage?: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
}

interface _ISanitizedUser {
  _id: string;
  email: string;
  userImage: string;
}

export interface _ISafeUser {
  _id: string;
  email: string;
  name: string;
}

export { _IDbUser, _ISanitizedUser };
