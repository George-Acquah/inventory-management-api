import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFiles
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from 'src/shared/dtos/items/create-item.dto';
import { UpdateItemDto } from 'src/shared/dtos/items/update-item.dto';
import { ApiResponse } from 'src/shared/res/api.response';
import { JwtAuthGuard } from 'src/shared/guards/Jwt.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { UploadService } from 'src/shared/services/uploads.service';

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

      const data = await this.itemsService.create({
        ...createItemDto,
        addedById: user._id,
        addedByName: user.name,
        itemImage: fileIds.length > 0 ? fileIds : null
      });

      return new ApiResponse(
        200,
        `You have successfully created your item.`,
        data
      );
    } catch (error) {
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error?.message ?? 'Something bad occurred while creating the item',
        {}
      );
    }
  }

  @Get()
  async findAllItems(
    @Query('q') query: string,
    @Query('currentPage', new ParseIntPipe()) currentPage: number,
    @Query('size', new ParseIntPipe()) size: number
  ) {
    try {
      const data = await this.itemsService.findAll(query, currentPage, size);
      return new ApiResponse(200, 'Fetched vehicles Successfully', data);
    } catch (error) {
      console.log(error);
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
  }

  @Get(':id')
  async findOneItem(@Param('id') id: string) {
    try {
      const data = await this.itemsService.findOne(id);
      console.log(data);
      return new ApiResponse(200, 'Fetched vehicles Successfully', data);
    } catch (error) {
      console.log(error);
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
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
      const data = await this.itemsService.update(id, {
        ...updateItemDto,
        itemImage: fileIds.length > 0 ? fileIds : undefined
      });
      return new ApiResponse(200, 'Item updated successfully', data);
    } catch (error) {
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.itemsService.remove(id);
      return new ApiResponse(200, result, {});
    } catch (error) {
      console.log(error);
      return new ApiResponse(
        error?.response?.statusCode ?? 400,
        error.message,
        {}
      );
    }
  }
}
