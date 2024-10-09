import { registerAs } from '@nestjs/config';
import { gcpConfigKey } from 'src/shared/constants/storage.constants';
import { _IGcp } from 'src/shared/interfaces/storage.interface';

const StorageConfig: _IGcp = {
  path: process.env.TOKEN_PATH,
  mediaBucket: process.env.IMAGES_BUCKET,
  url: process.env.GCP_URL
};

export const GCPStorageConfig = registerAs(gcpConfigKey, () => StorageConfig);

class StorageFile {
  buffer: Buffer;
  metadata: Map<string, string>;
  contentType: string;
}

export { StorageFile };
