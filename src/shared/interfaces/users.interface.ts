import { Document } from 'mongoose';
import { _IDbUserImage, _IUserImage } from './images.interface';

interface _IDbProfile extends Document {
  first_name: string | null;
  last_name: string | null;
  contact_no: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  user: string;
}

interface _IDbUser extends Document {
  email: string;
  readonly password: string;
  profile: _IDbProfile;
  user_image: _IDbUserImage;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  phone_number: string;
}

interface _ISanitizedProfile {
  _id: string;
  first_name: string | null;
  last_name: string | null;
  contact_no: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
}

interface _ISanitizedUser {
  _id: string;
  email: string;
  profile: _ISanitizedProfile;
  user_image: _IUserImage;
}

export interface _ISafeUser {
  _id: string;
  email: string;
  isVerified: boolean;
}

export interface _IDbAccountVerification extends Document {
  verificationToken: string;
  email: string;
  expiresAt: Date;
}

export { _IDbProfile, _ISanitizedProfile, _IDbUser, _ISanitizedUser };
