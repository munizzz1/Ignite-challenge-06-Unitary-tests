import request from 'supertest';
import { Connection, createConnection } from "typeorm";

import { app } from '../../../../app';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';

let db: Connection;

const userData: ICreateUserDTO = {
    name: 'Test Integração',
    email: 'testIntegracao@test.com.br',
    password: 'test123'
};

describe('Authenticate User Controller', () => {
    beforeAll(async () => {
        db = await createConnection();
        await db.runMigrations();
    });

    afterAll(async () => {
        await db.dropDatabase();
        await db.close();
    });

    it('should be able to init a new session', async () => {
        await request(app).post('/api/v1/users').send(userData);
        
        const response = await request(app).post('/api/v1/sessions').send({
            email: userData.email,
            password: userData.password
        });

        expect(response.body).toHaveProperty('token');
    });

    it("should not be able to init a new session if it password is incorrect", async() => {
        const response = await request(app).post("/api/v1/sessions").send({
          email: userData.email,
          password: "-incorrect"
        })
    
        expect(response.status).toBe(401)
    });
});