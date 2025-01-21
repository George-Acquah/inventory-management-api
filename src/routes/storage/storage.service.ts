import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { gcpConfigKey } from 'src/shared/constants/storage.constants';
import { _IGcp } from 'src/shared/interfaces/storage.interface';
import { getDesktopPath } from 'src/shared/helpers/global.helpers';

@Injectable()
export class StorageService {
  private readonly uploadPath: string;
  constructor(private readonly configService: ConfigService) {
    const { uploadPath }: _IGcp = this.configService.get(gcpConfigKey);

    this.uploadPath = path.join(getDesktopPath(), uploadPath);

    this.ensureDirectoryExists(this.uploadPath);
  }

  // Ensure the directory exists or create it
  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true }); // Create the directory and its parents if they don't exist
    }
  }

  async uploadFile(
    filename: string,
    buffer: Buffer
  ): Promise<{ filename: string }> {
    try {
      const filePath = path.join(this.uploadPath, filename);

      // Check if a file with the same name already exists
      if (fs.existsSync(filePath)) {
        throw new Error('A file with the same name already exists.');
      }

      // Write the file to the file system
      fs.writeFileSync(filePath, buffer);

      return { filename }; // Return file path or metadata as needed
    } catch (error) {
      console.error('Error saving file locally:', error);
      throw new BadRequestException('File upload failed. Please try again.');
    }
  }

  async getFile(fileName: string, response: Response): Promise<void> {
    const filePath = path.join(this.uploadPath, fileName);
    console.log(filePath);

    try {
      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('File not found.');
      }

      // Stream the file to the response
      response.sendFile(filePath);
    } catch (error) {
      console.error('Error fetching file:', error);
      throw new BadRequestException(
        error.message || 'Error retrieving file. Please try again.'
      );
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadPath, fileName);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file
      } else {
        throw new BadRequestException('File not found.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new BadRequestException(
        error.message || 'Error deleting file. Please try again.'
      );
    }
  }
}
