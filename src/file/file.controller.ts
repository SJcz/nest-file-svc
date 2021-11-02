import { Controller, Get, Post, Body, Param, Delete, UploadedFile, UseInterceptors, UsePipes, ValidationPipe, Logger, BadRequestException, Res } from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/upload-file.dto';
import { Response } from 'express';
import { Roles } from '../directors/roles.director';
import { FileExistInterceptor } from '../interceptors/file-exist.interceptor';

@Controller('file')
export class FileController {
  private readonly logger = new Logger(FileController.name);
  constructor(private readonly fileService: FileService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(ValidationPipe)
  @Roles('admin')
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: UploadFileDto) {
    const { md5, fileId } = body;
    const md5IsMatch = await this.fileService.checkFileMd5IsMatch(file.path, md5);
    if (!md5IsMatch) {
      await this.fileService.removeFile(fileId);
      throw new BadRequestException('文件MD5校验错误');
    }
    return { fileId, filename: file.filename, mimetype: file.mimetype, size: file.size }
  }

  @Get('download/:fileId')
  @UseInterceptors(FileExistInterceptor)
  download(@Param('fileId') fileId: string, @Res() response: Response) {
    this.fileService.downloadFile(fileId, response);
  }

  @Get('review/:fileId')
  @UseInterceptors(FileExistInterceptor)
  review(@Param('fileId') fileId: string, @Res() response: Response) {
    this.fileService.reviewFile(fileId, response);
  }

  @Delete(':fileId')
  @UseInterceptors(FileExistInterceptor)
  @Roles('admin')
  async remove(@Param('fileId') fileId: string) {
    await this.fileService.removeFile(fileId);
    return 'ok';
  }
}
