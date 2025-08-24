import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { StorageService } from '../storage/storage.service';
import { Response } from 'express';
import { Get } from '@nestjs/common/decorators/http/request-mapping.decorator';
import {
  Param,
  Res
} from '@nestjs/common/decorators/http/route-params.decorator';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';

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
