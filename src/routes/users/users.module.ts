import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GCPStorageConfig } from 'src/configs/storage.config';
import { User, UserSchema } from 'src/shared/schemas/user.schema';
import { UploadService } from 'src/shared/services/uploads.service';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ]),
    ConfigModule.forFeature(GCPStorageConfig)
  ],
  controllers: [UsersController],
  providers: [UsersService, AggregationService, UploadService, StorageService],
  exports: [UsersService]
})
export class UsersModule {}
