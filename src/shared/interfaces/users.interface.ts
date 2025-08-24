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

export interface _ICreateUser {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface _ILoginUser {
  email: string;
  password: string;
}

export { _IDbUser, _ISanitizedUser };
