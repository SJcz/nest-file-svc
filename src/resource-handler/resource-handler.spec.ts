import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ResourceHandler } from '../resource-handler/resource-handler';
import fs = require('fs-extra');

describe('ResourceHandler', () => {
    let resourceHandler: ResourceHandler;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourceHandler, {
                    provide: ConfigService,
                    useValue: {
                        get(param) {
                            if (param === 'chunkRootPath') return '/data/upload/trunks';
                            if (param === 'fileRootPath') return '/data/upload/files';
                            return '';
                        }
                    }
                }],
        }).compile();

        resourceHandler = module.get<ResourceHandler>(ResourceHandler);
    });

    it('should be defined', () => {
        expect(resourceHandler).toBeDefined();
    });

    it('get trunk Dir', async () => {
        const ensureDirFunc = jest.spyOn(fs, 'ensureDir').mockImplementationOnce(() => void 0);
        let dirPath = await resourceHandler.getTrunkDir('fileId', false);
        if (process.platform === 'win32') {
            expect(dirPath).toBe('\\data\\upload\\trunks\\fileId');
        } else {
            expect(dirPath).toBe('/data/upload/trunks/fileId');
        }

        expect(ensureDirFunc.mock.calls.length).toBe(0);

        dirPath = await resourceHandler.getTrunkDir('fileId', true);
        if (process.platform === 'win32') {
            expect(dirPath).toBe('\\data\\upload\\trunks\\fileId');
        } else {
            expect(dirPath).toBe('/data/upload/trunks/fileId');
        }
        expect(ensureDirFunc.mock.calls.length).toBe(1);
    })

    it('get file dir', async () => {
        const ensureDirFunc = jest.spyOn(fs, 'ensureDir').mockImplementationOnce(() => void 0);
        ensureDirFunc.mockClear();

        let dirPath = await resourceHandler.getFileDir('fileId', false);
        if (process.platform === 'win32') {
            expect(dirPath).toBe('\\data\\upload\\files\\fileId');
        } else {
            expect(dirPath).toBe('/data/upload/files/fileId');
        }
        expect(ensureDirFunc.mock.calls.length).toBe(0);

        dirPath = await resourceHandler.getFileDir('fileId', true);
        if (process.platform === 'win32') {
            expect(dirPath).toBe('\\data\\upload\\files\\fileId');
        } else {
            expect(dirPath).toBe('/data/upload/files/fileId');
        }
        expect(ensureDirFunc.mock.calls.length).toBe(1);
    })

    it('get file by fileid', async () => {
        let filepath = await resourceHandler.getFileByFileId('fileId');
        expect(filepath).toBe('');

        const pathExistsFunc = jest.spyOn(fs, 'pathExists').mockImplementation(async () => true);
        jest.spyOn(fs, 'readdir').mockImplementationOnce(async () => <any>['a.txt', 'b.js', 'c.ts']).mockImplementationOnce(async () => [])

        filepath = await resourceHandler.getFileByFileId('fileId');
        if (process.platform === 'win32') {
            expect(filepath).toBe('\\data\\upload\\files\\fileId\\a.txt');
        } else {
            expect(filepath).toBe('/data/upload/files/fileId/a.txt');
        }
        expect(pathExistsFunc.mock.calls.length).toBe(1);


        filepath = await resourceHandler.getFileByFileId('fileId');
        expect(filepath).toBe('');
        expect(pathExistsFunc.mock.calls.length).toBe(2);
    })


    it('分片文件相关函数', async () => {
        // TODO
    })

    it('获取某个文件夹下指定的所有文件', async () => {
        await fs.ensureFile('/data/a.txt')
        await fs.ensureFile('/data/tmp/a.txt');
        await fs.ensureFile('/data/tmp/b.js')
        await fs.ensureFile('/data/tmp/c.ts')

        let filenamesArr = [];
        await resourceHandler._getAllFilesFromFolder('/data/a.txt', '.txt', filenamesArr);
        expect(filenamesArr).toStrictEqual([]);

        filenamesArr = [];
        await resourceHandler._getAllFilesFromFolder('/data/tmp', '.js', filenamesArr);
        if (process.platform === 'win32') {
            expect(filenamesArr).toStrictEqual(['\\data\\tmp\\b.js']);
        } else {
            expect(filenamesArr).toStrictEqual(['/data/tmp/b.js']);
        }

        await fs.remove('/data/a.txt')
        await fs.remove('/data/tmp')
    })
});
