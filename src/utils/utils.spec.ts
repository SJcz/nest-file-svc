import { Utils } from "./utils";
import fs = require('fs-extra');
import crypto = require('crypto');

describe('Utils', () => {
    let utils: Utils;
    beforeEach(() => {
        utils = new Utils();
    })
    it('md5_str', () => {
        const md5Str = crypto.createHash('md5').update('测试字符串', 'utf8').digest('hex');
        expect(utils.md5_str('测试字符串')).toBe(md5Str);
    })

    it('md5_file', async () => {
        const filePath = '/data/tmp/a.txt';
        await fs.ensureFile(filePath);
        fs.writeFileSync(filePath, '一些测试数据, 用于测试文件md5', {
            flag: 'w'
        });
        const fileMD5 = crypto.createHash('md5').update(fs.readFileSync(filePath, 'utf8'), 'utf8').digest('hex');
        expect(await utils.md5_file(filePath)).toBe(fileMD5);
        await fs.remove(filePath)
    })
});