import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('handle a signup request', async () => {
        return await request(app.getHttpServer())
            .post('/users/auth/signup')
            .send({ email: 'wde2da1@may.com', password: '123456' })
            .expect(201)
            .then((res) => {
                const { id, email } = res.body;
                expect(id).toBeDefined();
                expect(email).toBe('wde2da1@may.com');
            });
    });


    it('signup as a new user and then get the current user', async () => {
        const email = 'newemail@mail.com';

        const res = await request(app.getHttpServer())
            .post('/users/auth/signup')
            .send({ email, password: '123afas' })
            .expect(201);

        const cookie = res.get('Set-Cookie');

        // Validamos que la cookie esté definida antes de continuar
        expect(cookie).toBeDefined();

        const { body } = await request(app.getHttpServer())
            .get('/users/whoAmI')
            .set('Cookie', cookie!)
            .expect(200);

        expect(body.email).toBe(email);
    });


    it('should return 403 Forbidden if no cookie is provided', async () => {
        // Simulamos una solicitud GET sin enviar cookies
        const response = await request(app.getHttpServer())
            .get('/users/whoAmI')
            .expect(403); // Validamos que el código HTTP sea 403

        // Verificamos que el cuerpo de la respuesta coincida con el formato esperado
        expect(response.body).toEqual({
            message: 'Forbidden resource',
            error: 'Forbidden',
            statusCode: 403,
        });
    });

});
