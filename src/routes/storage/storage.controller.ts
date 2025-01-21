import {
  Controller,
  Get,
  Param,
  Res,
  BadRequestException
} from '@nestjs/common';

import { StorageService } from '../storage/storage.service';
import { Response } from 'express';

@Controller('image')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get(':filename')
  async getFile(
    @Param('filename') fileName: string,
    @Res() response: Response
  ): Promise<void> {
    try {
      return await this.storageService.getFile(fileName, response);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error retrieving file. Please try again.'
      );
    }
  }
}
