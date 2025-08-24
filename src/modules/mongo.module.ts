import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import mongoose from 'mongoose';

const RootMongooseModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const uri = configService.get<string>('MONGODB_URI');
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected successfully:', uri);
      return {
        uri
      };
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  },
  inject: [ConfigService]
});

export { RootMongooseModule };
