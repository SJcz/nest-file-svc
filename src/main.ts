import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './filter/all-exception.filter';
import { RoleGuard } from './guards/role.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransfromResponseInterceptor } from './interceptors/transfrom-response.interceptor';
import { AssignRequestMiddleware } from './middlewares/assign-user.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransfromResponseInterceptor())
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalGuards(new RoleGuard(new Reflector()))
  app.use(new AssignRequestMiddleware().use);
  const configService = app.get(ConfigService);
  await app.listen(configService.get('port'));
}
bootstrap();
