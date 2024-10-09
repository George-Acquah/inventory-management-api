import {
  Controller,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseGuards
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/shared/decorators/user.decorator';
import { JwtAuthGuard } from 'src/shared/guards/Jwt.guard';
import { ApiResponse } from 'src/shared/res/api.response';
import { UploadService } from 'src/shared/services/uploads.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadService
  ) {}
  @Post('set-image')
  @UseGuards(JwtAuthGuard)
  async create(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // ... Set of file validator instances here
          new MaxFileSizeValidator({ maxSize: 2000 * 1024 })
        ]
      })
    )
    files: Express.Multer.File[],
    @User() userObj: _ISafeUser
  ) {
    try {
      const images = await this.uploadsService.uploadFilesToDrive(files);

      if (images.length > 0) {
        const firstImage = images[0];

        const savedUserImage = await this.usersService.addUserImage(
          firstImage,
          userObj._id
        );

        const { user, ...resp } = savedUserImage;
        console.log(user);

        return new ApiResponse(200, 'image Set Successfully', resp);
      } else {
        throw new ApiResponse(400, 'No images were uploaded.', {});
      }
    } catch (error) {
      console.error('Error uploading program files:', error);
      throw new ApiResponse(HttpStatus.BAD_REQUEST, error.message, {});
    }
  }
}
