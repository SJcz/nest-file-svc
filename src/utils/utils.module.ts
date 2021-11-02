import { Module } from '@nestjs/common';
import { Utils } from './utils';

@Module({
    providers: [Utils],
    exports: [Utils]
})
export class UtilsModule { }
