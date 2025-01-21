import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Items, ItemsSchema } from 'src/shared/schemas/items.schema';
import { AggregationService } from 'src/shared/services/aggregation.service';
import { UploadService } from 'src/shared/services/uploads.service';
import { StorageService } from '../storage/storage.service';
import { ConfigModule } from '@nestjs/config';
import { UploadMiddleware } from 'src/shared/middlewares/uploads.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: ItemsSchema, name: Items.name }]),
    ConfigModule.forRoot()
  ],
  controllers: [ItemsController],
  providers: [ItemsService, AggregationService, UploadService, StorageService],
  exports: [ItemsService]
})
export class ItemsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UploadMiddleware).forRoutes('items');
  }
}
