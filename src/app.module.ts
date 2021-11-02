import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { ResourceHandlerModule } from './resource-handler/resource-handler.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    FileModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV || 'local'}.env`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('local', 'development', 'test', 'stage', 'production').default('local'),
        port: Joi.number().default(3000),
        mongo_uri: Joi.string().required().regex(/^mongodb/),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ResourceHandlerModule,
    UtilsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
