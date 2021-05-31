import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
}

describe('Show Profile Use Case', () => {

    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    });

    it('should be able to get information user by id', async () => {
        const user = await createUserUseCase.execute(userData);
        const showProfileUser = await showUserProfileUseCase.execute(user.id ?? '');

        expect(showProfileUser).toHaveProperty('id');
        expect(showProfileUser).toHaveProperty('name');
    });

    it('should no be able to get information user if it id is invalid', () => {
        expect(async () => {
            await showUserProfileUseCase.execute('user_id_test');
        }).rejects.toBeInstanceOf(AppError);
    });
});