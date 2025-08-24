import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core/nest-factory';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ConsoleLogger } from '@nestjs/common/services/console-logger.service';
import { ApiResponseInterceptor } from './shared/interceptors/api-response.interceptor';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger('Bootstrap', {
      logLevels: isProduction ? ['error'] : ['log', 'error', 'warn'],
      timestamp: true
    })
  });

  //Get the ConfigService
  const configService = app.get(ConfigService);

  //get the port
  //Alternatively, you can change the value of PORT in your env
  const port = parseInt(configService.get('PORT'));

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  //Get the client port
  // const clientPort = parseInt(configService.get('CLIENT_PORT'));
  // logger.log(`Server is running on port ${clientPort}`);

  //Use Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  //Enable CORS
  app.enableCors({
    origin: isProduction
      ? ['https://invo-tracker.vercel.app']
      : [`http://localhost:${port}`, `http://localhost:3000`],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept'
    ]
  });

  //Finally, listen to the app on your specified port
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Listening at http://0.0.0.0:${port}`);
  });
}
bootstrap();
