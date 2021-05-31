import request from 'supertest';
import { Connection, createConnection } from "typeorm";
import jwt from "jsonwebtoken"
import { v4 as uuid } from "uuid"

import authConfig from '../../../../config/auth'
import { app } from '../../../../app';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';

let db: Connection;

const userData: ICreateUserDTO = {
    email: 'teste@teste.com.br',
    name: 'Teste Integração',
    password: 'Teste123'
};

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
};

describe('Create Statement Controller', () => {
    beforeAll(async () => {
        db = await createConnection();
        await db.runMigrations();
    });

    afterAll(async () => {
        await db.dropDatabase();
        await db.close();
    });

    it('should be able to create a new statement deposit', async () => {
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
            Authorization: `Bearer ${token}`,
        });

        expect(statement.status).toBe(201);
    });

    it("should no be able to create a new statement it if user not exists", async() => {
        const { secret, expiresIn } = authConfig.jwt;

        const token = jwt.sign({ user: userData }, secret, {
          subject: uuid(),
          expiresIn
        });

        const response = await request(app).post("/api/v1/statements/deposit")
        .send({
          amount: 0,
          description: 'Statement test'
        })
        .set({
          Authorization: `Bearer ${token}`,
        });
 
        expect(response.status).toBe(404);
    });
    
    it("should be able to create a new statement", async () => {
        const authenticateUser = await request(app).post('/api/v1/sessions').send({
            email: userData.email,
            password: userData.password
        });

        const token = authenticateUser.body.token;
    
        const response = await request(app).post("/api/v1/statements/withdraw")
        .send({
          amount: 10,
          description: 'Statement test'
        })
        .set({
          Authorization: `Bearer ${token}`,
        });
    
        expect(response.body).toHaveProperty("id");
        expect(response.body.user_id).toEqual(authenticateUser.body.user.id);
    });
    
    it("should no be able to create a new statement it if insufficient funds", async() => {
        const authenticateUser = await request(app).post('/api/v1/sessions').send({
            email: userData.email,
            password: userData.password
        });

        const token = authenticateUser.body.token;
        
        const response = await request(app).post("/api/v1/statements/withdwaw")
        .send({
          amount: 1000,
          description: 'Statement test',
          type: OperationType.WITHDRAW
        })
        .set({
          Authorization: `Bearer ${token}`,
        })
        
        expect(response.status).toBe(404);
    });
});