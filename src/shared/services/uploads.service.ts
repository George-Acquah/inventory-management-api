import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/routes/storage/storage.service';
import { _ICloudRes } from 'src/shared/interfaces/images.interface';
import { getUniqueFilename } from '../utils/uploads.utils';

@Injectable()
export class UploadService {
  constructor(private readonly googleStorageService: StorageService) {}
  async uploadFilesToDrive(
    files: { originalname: string; mimetype: string; buffer: Buffer }[]
  ): Promise<Array<_ICloudRes>> {
    const uploadedFiles: Array<_ICloudRes> = [];

    for (const file of files) {
      const filename = getUniqueFilename(file.originalname);
      console.log(file.mimetype);

      if (file.mimetype === 'application/pdf') {
        uploadedFiles.push(
          //TODO Some implementation to upload PDF else remove IF ELSE statement
          await this.googleStorageService.uploadFile(
            file.originalname,
            file.mimetype,
            file.buffer,
            filename
          )
        );
      } else {
        uploadedFiles.push(
          await this.googleStorageService.uploadFile(
            file.originalname,
            file.mimetype,
            file.buffer,
            filename
          )
        );
      }
    }

    return uploadedFiles;
  }

  async uploadFileToDrive(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
  }): Promise<_ICloudRes> {
    const filename = getUniqueFilename(file.originalname);

    if (file.mimetype === 'application/pdf') {
      //TODO Some implementation to upload PDF else remove IF ELSE statement
      return await this.googleStorageService.uploadFile(
        file.originalname,
        file.mimetype,
        file.buffer,
        filename
      );
    } else {
      return await this.googleStorageService.uploadFile(
        file.originalname,
        file.mimetype,
        file.buffer,
        filename
      );
    }
  }
}
