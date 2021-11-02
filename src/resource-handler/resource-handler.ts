import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs = require('fs-extra');
import path = require('path');

@Injectable()
export class ResourceHandler {
  private readonly logger = new Logger(ResourceHandler.name);
  private chunkRootPath: string;
  private fileRootPath: string;

  constructor(private readonly configService: ConfigService) {
    this.chunkRootPath = path.join(configService.get('chunkRootPath') ? configService.get('chunkRootPath') : '/data/upload/trunks')
    this.fileRootPath = path.join(configService.get('fileRootPath') ? configService.get('fileRootPath') : '/data/upload/files')
    this.logger.log(`分片存储根路径: ${this.chunkRootPath}, 文件存储根路径: ${this.fileRootPath}`);
  }

  /**
   * 获取某文件的分片存储目录
   * @param {string} fileId 
   * @param {boolean} mk 不存在文件夹时创建
   */
  async getTrunkDir(fileId: string, mk = false): Promise<string> {
    const dir = path.join(this.chunkRootPath, fileId);
    if (mk) await fs.ensureDir(dir);
    return dir;
  }

  /**
   * 获取某文件的文件存储目录
   * @param {string} fileId 
   * @param {boolean} mk 不存在文件夹时创建
   */
  async getFileDir(fileId, mk = false) {
    const dir = path.join(this.fileRootPath, fileId);
    if (mk) await fs.ensureDir(dir);
    return dir;
  }

  async getFileByFileId(fileId: string): Promise<string> {
    const dirPath = await this.getFileDir(fileId);
    if (!(await fs.pathExists(dirPath))) {
      return '';
    }
    const files = await fs.readdir(dirPath);
    if (files.length > 0) {
      return path.join(dirPath, files[0]);
    }
    return '';
  }

  /**
   * 删除某文件或某目录
   * @param {string} path 
   */
  async removeFileOrDir(path) {
    await fs.remove(path);
  }

  /**
   * 获取某个文件夹下指定的所有文件
   * @param {*} dirpath 
   * @param {*} ext 指定的文件拓展名
   * @param {*} arr 
   * @returns 
   */
  async _getAllFilesFromFolder(dirPath, ext, arr) {
    if (!(await fs.stat(dirPath)).isDirectory()) return;
    const files = await fs.readdir(dirPath);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i]);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await this._getAllFilesFromFolder(filePath, ext, arr);
      }
      if (!ext || path.extname(files[i]) === ext) {
        arr.push(filePath);
      }
    }
  }

}