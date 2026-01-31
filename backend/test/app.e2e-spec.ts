import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/products')
      .expect(200);
  });

  it('/api/orders (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/orders')
      .send({ name: 'test' })
      .expect(201);
  });
});