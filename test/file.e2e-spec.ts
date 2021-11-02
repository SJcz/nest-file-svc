import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import fs = require('fs-extra');
import path = require('path');
import { AllExceptionFilter } from '../src/filter/all-exception.filter';
import { RoleGuard } from '../src/guards/role.guard';
import { AssignRequestMiddleware } from '../src/middlewares/assign-user.middleware';
import { Reflector } from '@nestjs/core';
import { LoggingInterceptor } from '../src/interceptors/logging.interceptor';
import { TransfromResponseInterceptor } from '../src/interceptors/transfrom-response.interceptor';
import { AppModule } from '../src/app.module';

describe('FileController (e2e)', () => {
	let app: INestApplication;
	let fileId: string;
	const sourceFilePath = path.join(process.cwd(), 'testfile.txt');

	afterAll(async () => {
		await app.close();
	});

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				AppModule
			]
		})
			.compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalFilters(new AllExceptionFilter());
		app.useGlobalGuards(new RoleGuard(new Reflector()))
		app.useGlobalInterceptors(new LoggingInterceptor(), new TransfromResponseInterceptor())
		app.use(new AssignRequestMiddleware().use);
		await app.init();

		await fs.ensureFile(sourceFilePath);
		await fs.writeFileSync(sourceFilePath, '测试文件内容');
	});

	it('/file/upload (POST) 403', () => {
		return request(app.getHttpServer())
			.post('/file/upload')
			.expect(403)
			.expect((res) => {
				expect(res.body).toHaveProperty('statusCode', 403);
				expect(res.body).toHaveProperty('message', 'Forbidden resource');
				expect(res.body).toHaveProperty('timestamp');
				expect(res.body).toHaveProperty('path');
			});
	});

	it('/file/upload (POST) 缺少MD5 参数', () => {
		return request(app.getHttpServer())
			.post('/file/upload')
			.set('Authorization', '123')
			.field('filename', 'a.txt')
			.attach('file', sourceFilePath)
			.expect(400)
			.expect((res) => {
				expect(res.body).toHaveProperty('statusCode', 400);
				expect(res.body).toHaveProperty('message', '缺少 md5 值参数');
				expect(res.body).toHaveProperty('timestamp');
				expect(res.body).toHaveProperty('path');
			})
	});

	it('/file/upload (POST)', () => {
		return request(app.getHttpServer())
			.post('/file/upload')
			.field('md5', '826a5da32162650a8b5d59554aa3f3d2')
			.field('filename', 'a.txt')
			.attach('file', sourceFilePath)
			.set('Authorization', '123')
			.expect((res) => {
				console.log(res.body)
				expect(res.body).toHaveProperty('statusCode', 200);
				expect(res.body.data).toHaveProperty('fileId');
				expect(res.body.data).toHaveProperty('filename', 'a.txt');
				expect(res.body.data).toHaveProperty('mimetype', 'text/plain');
				expect(res.body.data).toHaveProperty('size');
				fileId = res.body.data.fileId;
			});
	});

	it('/file/download/:fileId (GET)', () => {
		return request(app.getHttpServer())
			.get(`/file/download/${fileId}`)
			.expect(200)
			.expect('Content-Type', /text/)

	});

	it('/file/review/:fileId (GET) success', () => {
		return request(app.getHttpServer())
			.get(`/file/review/${fileId}`)
			.expect(200)
			.expect('Content-Type', /text/)
	});

	it('/file/:fileId (DELETE) success', () => {
		return request(app.getHttpServer())
			.delete(`/file/${fileId}`)
			.set('Authorization', '123')
			.expect(200)
			.expect({
				statusCode: 200,
				data: 'ok'
			});
	});
});
