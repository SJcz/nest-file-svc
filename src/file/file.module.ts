import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ResourceHandlerModule } from '../resource-handler/resource-handler.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [FileModule],
      useFactory: async (fileService: FileService) => {
        return ({
          storage: multer.diskStorage({
            destination: fileService.completeFileDestinationHandler.bind(fileService),
            filename: fileService.completeFileNameHandler.bind(fileService)
          })
        })
      },
      inject: [FileService],
    }),
    ResourceHandlerModule,
    UtilsModule
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService]
})
export class FileModule { }
