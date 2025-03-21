import { registerAs } from '@nestjs/config';
import { gcpConfigKey } from 'src/shared/constants/storage.constants';
import { _IGcp } from 'src/shared/interfaces/storage.interface';

const StorageConfig: _IGcp = {
  uploadPath: process.env.FILES_PATH
};

export const GCPStorageConfig = registerAs(gcpConfigKey, () => StorageConfig);
