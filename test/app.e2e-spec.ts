import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

/**
 * E2E smoke test. NO se corre en el pipeline de CI (ver
 * .github/workflows/ci.yml): AppModule arranca DatabaseModule y por lo
 * tanto necesita una conexión real a Postgres, algo que el CI de PRs no
 * levanta a propósito (mantenerlo rápido, solo `npm test` con las
 * pruebas unitarias). Este archivo sirve para correr manualmente en
 * local con `npm run test:e2e` contra una base de datos real (ej. la de
 * docker-compose) para verificar que el servidor arranca de punta a
 * punta.
 */
describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) responde con el estado de la API y la base de datos', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
