import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import {
  CallHandler,
  NestInterceptor
} from '@nestjs/common/interfaces/features/nest-interceptor.interface';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> {
    const response = context.switchToHttp().getResponse() as Response;

    return next.handle().pipe(
      map((data) => {
        if (data?.statusCode) {
          response.status(data.statusCode);
        }

        return data;
      })
    );
  }
}
