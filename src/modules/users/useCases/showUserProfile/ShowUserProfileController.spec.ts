import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { app } from '../../../../app';
import { AppError } from '../../../../shared/errors/AppError';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';

let db: Connection;

const userData: ICreateUserDTO = {
    name: 'Test Integração',
    email: 'testIntegracao@test.com.br',
    password: 'test123'
}

describe('Show User Profile Controller', () => {
    beforeAll(async () => {
        db = await createConnection();
        await db.runMigrations();
    });

    afterAll(async () => {
        await db.dropDatabase();
        await db.close();
    });

    it('should be able to get information user by id', async () => {
        await request(app).post("/api/v1/users").send(userData);

        const authenticateUser = await request(app).post('/api/v1/sessions').send({
            email: userData.email,
            password: userData.password
        });

        const token = authenticateUser.body.token;

        const listUser = await request(app).get('/api/v1/profile').set({
            Authorization: `Bearer ${token}`
        });

        expect(listUser.body).toHaveProperty('id');
        expect(listUser.body.name).toEqual(userData.name);
    });

    it('should no be able to get information user if it id is invalid', async () => {
        const response = await request(app).get('/api/v1/profile').send({
            Authorization: `Bearer invalid-token`
        });

        expect(response.status).toBe(401);
    });
});