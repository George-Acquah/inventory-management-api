import { Document } from 'mongoose';

interface _IDbImage extends Document {
  file_id: string;
  filename: string;
  mimetype: string;
}

interface _IAddImage {
  file_id: string;
  filename: string;
  mimetype: string;
}

interface _Image {
  _id: string;
  file_id: string;
  filename: string;
  mimetype: string;
}

interface _IDbUserImage extends _IDbImage {
  user: string;
}

interface _IUserImage extends _Image {
  user: string;
}

interface _IAddUserImage extends _IAddImage {
  user: string;
}

interface _ICloudRes {
  file_id: string;
  filename: string;
  mimetype: string;
  publicUrl: string;
}

export { _IUserImage, _IDbUserImage, _IAddUserImage, _ICloudRes };
