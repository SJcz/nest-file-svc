import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
    @IsString()
    md5: string;

    @IsString()
    @IsOptional()
    filename: string;

    /**经过文件上传拦截器自动添加的字段, 客户端不传 */
    @IsString()
    fileId: string;
}
