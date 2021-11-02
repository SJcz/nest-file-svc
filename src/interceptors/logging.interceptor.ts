import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest() as Request;
    const response = context.switchToHttp().getResponse() as Response;
    const now = Date.now();
    return next.handle().pipe(tap(() => {
      this.logger.log(`${request.method} ${request.url} ${request.httpVersion} - ${response.statusCode} - ${request.ip} - ${Date.now() - now}ms`)
    }), catchError((err: Error) => {
      this.logger.error(`${request.method} ${request.url} ${request.httpVersion} - ${request.ip} - ${Date.now() - now}ms`);
      return throwError(() => err);
    }));
  }
}
