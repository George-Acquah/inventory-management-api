import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { UploadService } from 'src/shared/services/uploads.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadService
  ) {}
}
