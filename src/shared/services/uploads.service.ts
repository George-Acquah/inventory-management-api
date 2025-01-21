import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageService } from 'src/routes/storage/storage.service';
import { getUniqueFilename } from '../utils/uploads.utils';

@Injectable()
export class UploadService {
  constructor(private readonly storageService: StorageService) {}

  async uploadFileToDrive(file: { originalname: string; buffer: Buffer }) {
    try {
      if (!file.buffer) {
        throw new BadRequestException('File buffer is missing.');
      }

      // Generate unique filename and upload
      const filename = getUniqueFilename(file.originalname);
      return await this.storageService.uploadFile(filename, file.buffer);
    } catch (error) {
      console.error('Error uploading file to drive:', error);
      throw new BadRequestException('File upload failed.');
    }
  }
}
