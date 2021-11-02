import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import path = require('path');
import mime = require('mime');
import fs = require('fs');
import { Utils } from '../utils/utils';
import { ResourceHandler } from '../resource-handler/resource-handler';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  constructor(private readonly utils: Utils, private readonly resourceHandler: ResourceHandler) { }

  async completeFileDestinationHandler(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination?: string) => void) {
    const filename = req.body.filename || file.originalname;
    const md5 = req.body.md5;
    if (!md5) return cb(new BadRequestException('缺少 md5 值参数'));
    // filename + MD5 重新计算 md5 , 得到唯一 fileId
    const encodeStr = this.getEncodeStr({ md5, filename });
    const fileId = this.utils.md5_str(encodeStr);
    req.body.fileId = fileId; // 后续处理需要用到
    cb(null, await this.resourceHandler.getFileDir(fileId, true));
  }

  completeFileNameHandler(req: Request, file: Express.Multer.File, cb: (error: Error | null, destination?: string) => void) {
    cb(null, `${req.body.filename || file.originalname}`);
  }

  async checkFileMd5IsMatch(filepath: string, md5: string): Promise<boolean> {
    const fileMd5 = await this.utils.md5_file(filepath);
    if (fileMd5 !== md5) {
      this.logger.error(`完整文件 ${filepath} - 客户端MD5=${md5} 服务端MD5=${fileMd5} 校验失败, 删除文件`);
      await this.resourceHandler.removeFileOrDir(path.dirname(filepath));
      return false;
    }
    return true;
  }

  async downloadFile(fileId: string, response: Response) {
    const filePath = await this.resourceHandler.getFileByFileId(fileId);
    // 下载文件 (内部使用流)
    response.download(filePath, `${path.basename(filePath)}`, async (err) => {
      if (err) {
        this.logger.log(`下载文件 ${filePath} 失败, ${err}`);
      }
    });
  }

  async reviewFile(fileId: string, response: Response) {
    const filePath = await this.resourceHandler.getFileByFileId(fileId);
    const contentType = mime.lookup(filePath);
    response.set('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(response).on('error', err => {
      this.logger.log(`预览文件 ${filePath} 失败, ${err}`);
    })
  }

  async removeFile(fileId: string) {
    const dirPath = await this.resourceHandler.getFileDir(fileId);
    await this.resourceHandler.removeFileOrDir(dirPath);
  }

  getEncodeStr({ filename, md5 }): string {
    return `${md5}_${filename}`;
  }
}
