import request from 'supertest';
import { Connection, createConnection } from 'typeorm';
import jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid"

import { app } from '../../../../app';
import authConfig from '../../../../config/auth'
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';

let db: Connection;

const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
};

describe('Get Balance Controller', () => {
    beforeAll(async () => {
        db = await createConnection();
        await db.runMigrations();
    });

    afterAll(async () => {
        await db.dropDatabase();
        await db.close();
    });

    it("must be able to get balance per existing user using the user ID", async () => {
        await request(app).post('/api/v1/users').send(userData);

        const authenticateUser = await request(app).post('/api/v1/sessions').send({
            email: userData.email,
            password: userData.password
        });

        const token = authenticateUser.body.token;

        const statement = await request(app).post('/api/v1/statements/deposit').send({
            amount: 45.00,
            description: 'Statement test'
        })
        .set({
            Authorization: `Bearer ${token}`
        });

        const balance = await request(app).get('/api/v1/statements/balance').set({
            Authorization: `Bearer ${token}`
        });

        expect(balance.status).toBe(200);
    });

    it("should no be able to get balance if it user not exists", async() => {
        const { secret, expiresIn } = authConfig.jwt;
    
        const token = jwt.sign({ user: userData }, secret, {
          subject: uuid(),
          expiresIn
        });
        
        const response = await request(app).get("/api/v1/statements/balance")
          .set({
            Authorization: `Bearer ${token}`,
        });
        
        expect(response.status).toBe(404);
    });

});