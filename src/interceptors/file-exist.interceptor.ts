import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { Observable, from, switchMap } from 'rxjs';
import { ResourceHandler } from '../resource-handler/resource-handler';

@Injectable()
export class FileExistInterceptor implements NestInterceptor {
  constructor(private resourceHandler: ResourceHandler) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { params: { fileId } } = context.switchToHttp().getRequest() as Request;

    return from(this.resourceHandler.getFileByFileId(fileId)).pipe(switchMap(filePath => {
      if (!filePath) throw new NotFoundException('file not found!');
      return next.handle()
    }))
  }
}
