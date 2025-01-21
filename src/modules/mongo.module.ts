import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

const RootMongooseModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const uri = configService.get<string>('MONGODB_URI_DEV');
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
