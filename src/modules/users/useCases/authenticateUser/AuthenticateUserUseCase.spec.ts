import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
  }

describe('Authenticate User Use Case', () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
        authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
    });

    it('should be able to init a new session', async () => {
        await createUserUseCase.execute(userData);

        const authenticate = await authenticateUserUseCase.execute({
            email: userData.email,
            password: userData.password
        });

        expect(authenticate).toHaveProperty('token');
    });

    it('should not be able to init a new session if it user not exists', () => {
        expect(async () => {
            await authenticateUserUseCase.execute({
                email: 'teste@teste',
                password: userData.password
            });
        }).rejects.toBeInstanceOf(AppError);
    });

    it('should not be able to init a new session if it password is incorrect', async () => {
        await createUserUseCase.execute(userData)

        await authenticateUserUseCase.execute({
          email: userData.email,
          password: userData.password
        })
    
        await expect( async () => await authenticateUserUseCase.execute({
          email: userData.email,
          password: userData.password + "-incorrect"
        })).rejects.toBeInstanceOf(AppError)
    });
});