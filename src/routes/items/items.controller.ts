import { ItemsService } from './items.service';
import { CreateItemDto } from 'src/shared/dtos/items/create-item.dto';
import { UpdateItemDto } from 'src/shared/dtos/items/update-item.dto';
import { JwtAuthGuard } from 'src/shared/guards/Jwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { UploadService } from 'src/shared/services/uploads.service';
import { InternalServerErrorResponse } from 'src/shared/res/responses/internal-server-error.response';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import {
  Delete,
  Get,
  Patch,
  Post
} from '@nestjs/common/decorators/http/request-mapping.decorator';
import {
  Body,
  Param,
  Query,
  UploadedFiles
} from '@nestjs/common/decorators/http/route-params.decorator';
import { ParseFilePipe } from '@nestjs/common/pipes/file/parse-file.pipe';
import { MaxFileSizeValidator } from '@nestjs/common/pipes/file/max-file-size.validator';
import { ParseIntPipe } from '@nestjs/common/pipes/parse-int.pipe';

@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly uploadService: UploadService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createItem(
    @Body() createItemDto: CreateItemDto,
    @User() user: _ISafeUser,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2000 * 1024 })],
        fileIsRequired: false
      })
    )
    files?: Express.Multer.File[]
  ) {
    try {
      const fileIds: string[] = [];
      console.log(files);

      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const { filename } = await this.uploadService.uploadFileToDrive(file);
          return filename; // Assuming the filename is the file ID
        });

        const uploadedFileIds = await Promise.all(uploadPromises);
        fileIds.push(...uploadedFileIds); // Spread operator to merge file IDs
      }

      return await this.itemsService.create({
        ...createItemDto,
        addedById: user._id,
        addedByName: user.name,
        itemImage: fileIds.length > 0 ? fileIds : null
      });
    } catch (error) {
      return new InternalServerErrorResponse(
        'Something bad occurred while creating the item'
      );
    }
  }

  @Get()
  async findAllItems(
    @Query('q') query: string,
    @Query('currentPage', new ParseIntPipe()) currentPage: number,
    @Query('size', new ParseIntPipe()) size: number
  ) {
    return await this.itemsService.findAll(query, currentPage, size);
  }

  @Get(':id')
  async findOneItem(@Param('id') id: string) {
    return await this.itemsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2000 * 1024 })],
        fileIsRequired: false // File is optional
      })
    )
    files?: Express.Multer.File[]
  ) {
    try {
      const fileIds: string[] = [];

      // Process the files in parallel using Promise.all
      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const { filename } = await this.uploadService.uploadFileToDrive(file);
          return filename; // Assuming the filename is the file ID
        });

        const uploadedFileIds = await Promise.all(uploadPromises);
        fileIds.push(...uploadedFileIds); // Spread operator to merge file IDs
      }
      return await this.itemsService.update(id, {
        ...updateItemDto,
        itemImage: fileIds.length > 0 ? fileIds : undefined
      });
    } catch (error) {
      return new InternalServerErrorResponse(
        'Something bad occurred while updating the item'
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.itemsService.remove(id);
  }
}
