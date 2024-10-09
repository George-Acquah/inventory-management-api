import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  //Creates a logger instance from the Logger class
  const logger = new Logger();

  //Initialize the app
  const app = await NestFactory.create(AppModule);

  //Get the ConfigService
  const configService = app.get(ConfigService);

  //get the port
  //Alternatively, you can change the value of PORT in your env
  const port = parseInt(configService.get('PORT'));

  //Get the client port
  const clientPort = parseInt(configService.get('CLIENT_PORT'));
  logger.log(`Server is running on port ${clientPort}`);

  //Use Pipes
  app.useGlobalPipes(new ValidationPipe());

  //Enable CORS
  app.enableCors({
    // origin: [
    //   `http://192.168.43.198:${clientPort}`,
    //   new RegExp(`^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$`)
    // ]
    origin: `*`
  });

  //Finally, listen to the app on your specified port
  await app.listen(port, () => {
    logger.log(`Server is running on port ${port}`);
  });
}
bootstrap();
