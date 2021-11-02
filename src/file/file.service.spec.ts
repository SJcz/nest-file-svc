import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceHandler } from '../resource-handler/resource-handler';
import { Utils } from '../utils/utils';
import { FileService } from './file.service';
import fs = require('fs');

describe('FileService', () => {
  let service: FileService;
  const mockUtils = <Utils>Object.getOwnPropertyNames(Utils.prototype).filter(name => name !== 'constructor').reduce((obj, func) => {
    obj[func] = () => void 0;
    return obj
  }, {});
  const mockResourceHandler = <ResourceHandler>Object.getOwnPropertyNames(ResourceHandler.prototype).filter(name => name !== 'constructor').reduce((obj, func) => {
    obj[func] = () => void 0;
    return obj
  }, {});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: Utils,
          useValue: mockUtils
        },
        {
          provide: ResourceHandler,
          useValue: mockResourceHandler
        }]
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be return DirPath', async () => {
    const md5StrFunc = jest.spyOn(mockUtils, 'md5_str').mockImplementationOnce(() => 'md5');
    const getFileDirFunc = jest.spyOn(mockResourceHandler, 'getFileDir').mockImplementationOnce(async () => '/data/tmp/123');

    await service.completeFileDestinationHandler({ body: { filename: 'a.txt' } } as any, { originalname: '测试文件.txt' } as any, (err, dirPath: string) => {
      expect(err).toBeDefined();
      expect(err).toBeInstanceOf(BadRequestException);
      expect(err.message).toBe('缺少 md5 值参数');
      expect(md5StrFunc.mock.calls.length).toBe(0);
      expect(getFileDirFunc.mock.calls.length).toBe(0);
      expect(dirPath).toBeUndefined();
    })

    await service.completeFileDestinationHandler({ body: { md5: '错误的MD5' } } as any, { originalname: '测试文件.txt' } as any, (err, dirPath: string) => {
      expect(err).toBeNull();
      expect(dirPath).toBe('/data/tmp/123');
      expect(md5StrFunc.mock.calls.length).toBe(1);
      expect(getFileDirFunc.mock.calls.length).toBe(1);
    })
  })

  it('should be return filename', async () => {
    await service.completeFileNameHandler({ body: { filename: 'a.txt' } } as any, { originalname: '测试文件.txt' } as any, (err, filename: string) => {
      expect(err).toBeNull();
      expect(filename).toBe('a.txt');
    })
    await service.completeFileNameHandler({ body: {} } as any, { originalname: '测试文件.txt' } as any, (err, filename: string) => {
      expect(err).toBeNull();
      expect(filename).toBe('测试文件.txt');
    })
  })

  it('check file md5 匹配', async () => {
    const fileMd5Func = jest.spyOn(mockUtils, 'md5_file').mockImplementation(async () => 'file_md5');
    const removeFileOrDirFunc = jest.spyOn(mockResourceHandler, 'removeFileOrDir').mockImplementation(async () => void 0);

    const falseRst = await service.checkFileMd5IsMatch('testpath', '假的文件md5');
    expect(falseRst).toBe(false);
    expect(fileMd5Func.mock.calls.length).toBe(1);
    expect(fileMd5Func.mock.calls[0][0]).toBe('testpath');
    expect(removeFileOrDirFunc.mock.calls.length).toBe(1);

    const trueRst = await service.checkFileMd5IsMatch('testpath', 'file_md5');
    expect(trueRst).toBe(true);
    expect(fileMd5Func.mock.calls.length).toBe(2);
    expect(fileMd5Func.mock.calls[1][0]).toBe('testpath');
    expect(removeFileOrDirFunc.mock.calls.length).toBe(1);
  })

  it('下载文件', async () => {
    const getFileByFileIdFunc = jest.spyOn(mockResourceHandler, 'getFileByFileId').mockImplementation(async () => '/data/tmp/123');
    const downloadFunc = jest.fn(() => void 0);
    await service.downloadFile('fileId', { download: downloadFunc } as any)

    expect(getFileByFileIdFunc.mock.calls.length).toBe(1);
    expect(getFileByFileIdFunc.mock.calls[0][0]).toBe('fileId');
    expect(downloadFunc.mock.calls.length).toBe(1);
  })

  it('预览文件', async () => {
    const getFileByFileIdFunc = jest.spyOn(mockResourceHandler, 'getFileByFileId').mockImplementation(async () => '/data/tmp/123.txt');
    getFileByFileIdFunc.mockClear();
    const mockResponse = fs.createWriteStream('/data/tmp/123.txt');
    (<any>mockResponse).set = () => void 0;
    await service.reviewFile('fileId', mockResponse as any);
    expect(getFileByFileIdFunc.mock.calls.length).toBe(1);
  })

  it('删除文件', async () => {
    const getFileDirFunc = jest.spyOn(mockResourceHandler, 'getFileDir').mockImplementation(async () => '/data/tmp/files');
    getFileDirFunc.mockClear(); // 清楚该 mock 函数在上面测例中的缓存信息
    const removeFileOrDirFunc = jest.spyOn(mockResourceHandler, 'removeFileOrDir').mockImplementation(async () => void 0);
    removeFileOrDirFunc.mockClear(); // 清楚该 mock 函数在上面测例中的缓存信息
    await service.removeFile('fileId');

    expect(getFileDirFunc.mock.calls.length).toBe(1);
    expect(removeFileOrDirFunc.mock.calls.length).toBe(1);
    expect(removeFileOrDirFunc.mock.calls[0][0]).toBe('/data/tmp/files');
  })

  it('getEncodeStr', () => {
    const str = service.getEncodeStr({ filename: 'a.txt', md5: 'md5' });
    expect(str).toBe(`md5_a.txt`);
  })
});
