import { Module } from '@nestjs/common';
import { ResourceHandler } from './resource-handler';

@Module({
    providers: [ResourceHandler],
    exports: [ResourceHandler]
})
export class ResourceHandlerModule { }
