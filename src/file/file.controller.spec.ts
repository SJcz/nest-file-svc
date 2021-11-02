import { Test, TestingModule } from '@nestjs/testing';
import { ResourceHandler } from '../resource-handler/resource-handler';
import { FileController } from './file.controller';
import { FileService } from './file.service';

describe('FileController', () => {
  let controller: FileController;
  let service: FileService;

  const mockService = <FileService>Object.getOwnPropertyNames(FileService.prototype).filter(name => name !== 'constructor').reduce((obj, func) => {
    obj[func] = () => void 0;
    return obj
  }, {});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [{
        provide: FileService,
        useValue: mockService,
      }, {
        provide: ResourceHandler,
        useValue: {}
      }],
    }).compile();

    controller = module.get<FileController>(FileController);
    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uploadFile md5 error', () => {
    expect.assertions(1);
    jest.spyOn(service, 'checkFileMd5IsMatch').mockImplementation(async () => false);
    return expect(controller.uploadFile({} as any, {} as any)).rejects.toThrow('文件MD5校验错误');
  })

  it('delete file', async () => {
    jest.spyOn(service, 'removeFile').mockImplementation(() => void 0);
    const result = await controller.remove('fileId');
    expect(result).toBe('ok');
  })

  it('review file', async () => {
    jest.spyOn(service, 'reviewFile').mockImplementation(() => void 0);
    const result = await controller.review('fileId', {} as any);
    expect(result).toBe(undefined);
  })

  it('download file', async () => {
    jest.spyOn(service, 'downloadFile').mockImplementation(() => void 0);
    const result = await controller.download('fileId', {} as any);
    expect(result).toBe(undefined);
  })

});
