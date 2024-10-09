import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

/**
 * Configures the MongoDB connection based on environment settings.
 * This module dynamically selects the appropriate MongoDB URI depending on whether the application is in a production or development environment.
 */
const RootMongooseModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    /**
     * Retrieve the MongoDB URI from the environment configuration.
     *
     * The actual url to your MongoDB instance in either production or development
     */
    const uri = configService.get<string>(
      process.env.NODE_ENV === 'production'
        ? 'MONGODB_URI_PROD' // Use production URI if in production mode.
        : 'MONGODB_URI_DEV' // Use development URI if in development mode.
    );

    try {
      // Establish a connection to MongoDB using the URI.
      await mongoose.connect(uri);

      console.log('MongoDB connected successfully:', uri);

      return {
        uri // Return the URI as part of the connection configuration.
      };
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; // Rethrow to indicate that the connection attempt failed.
    }
  },
  /**
   * Injects the ConfigService into the MongoDB module to allow access to environment configurations.
   */
  inject: [ConfigService]
});

/**
 * Exports the configured Mongoose module for use in other parts of the application.
 */
export { RootMongooseModule };
