import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * TransformDateInterceptor Class
 *
 * This interceptor converts the `start_time` field in the request body from a string to a Date object.
 * If the date string is invalid, it throws a BadRequestException.
 *
 * @class
 * Example Usage:
 *
 * To use this interceptor in your application, follow these steps:
 *
 * 1. Apply it to a specific route using the `@UseInterceptors` decorator in your controller.
 *
 * Example:
 *
 * import { Controller, Post, Body, UseInterceptors, BadRequestException } from '@nestjs/common';
 *
 * import { TransformDateInterceptor } from 'src/interceptors/transform-date.interceptor';
 *
 * @Controller('events')
 * export class EventsController {
 *   @Post('create')
 *   @UseInterceptors(TransformDateInterceptor)
 *   createEvent(@Body() body: any) {
 *     // The 'start_time' field in 'body' will now be a valid Date object.
 *     // If 'start_time' is invalid, a BadRequestException would have been thrown.
 *     return body;
 *   }
 * }
 *
 * 2. Alternatively, you can apply it globally to all routes by adding it to your main application module.
 *
 * Example:
 *
 * import { NestFactory } from '@nestjs/core';
 * import { AppModule } from 'src/app.module';
 * import { TransformDateInterceptor } from 'src/interceptors/transform-date.interceptor';
 *
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   app.useGlobalInterceptors(new TransformDateInterceptor());
 *   await app.listen(3000);
 * }
 * bootstrap();
 *
 * In this example, the interceptor will transform the `start_time` field for all incoming requests globally.
 */
@Injectable()
export class TransformDateInterceptor implements NestInterceptor {
  /**
   * Intercept method to handle the transformation of the request body.
   *
   * @param {ExecutionContext} context - Provides access to the details of the current request.
   * @param {CallHandler} next - Allows the next handler in the request pipeline to process the request.
   * @returns {Observable<any>} - Returns an observable that will continue the request lifecycle.
   * @throws {BadRequestException} - Throws if the `start_time` field is not a valid date string.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Extract the request object from the execution context.
    const request = context.switchToHttp().getRequest();

    // Check if the request body contains a 'start_time' field as a string.
    if (request.body && typeof request.body.start_time === 'string') {
      // Attempt to convert the 'start_time' field to a Date object.
      const parsedDate = new Date(request.body.start_time);

      // Check if the resulting Date object is valid.
      if (isNaN(parsedDate.getTime())) {
        // If the date is invalid, throw a BadRequestException with a descriptive message.
        throw new BadRequestException(
          `Invalid date string provided for 'start_time': ${request.body.start_time}`
        );
      }

      // If valid, assign the Date object back to the 'start_time' field.
      request.body.start_time = parsedDate;
    }

    // Continue processing the request and return the response as is.
    return next.handle().pipe(
      map((data) => {
        return data;
      })
    );
  }
}
