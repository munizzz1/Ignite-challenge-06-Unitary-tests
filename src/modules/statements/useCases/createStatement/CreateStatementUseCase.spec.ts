import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
};

interface ICreateStatementDTO {
    user_id: string;
    amount: number;
    description: string;
    type: OperationType
};

const statementData: ICreateStatementDTO = {
    user_id: "",
    amount: 0,
    description: "Statement Test",
    type: OperationType.WITHDRAW
};

const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
};
  
describe('Create Statement Use Case', () => {
    beforeEach(() => {
        userRepositoryInMemory = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
        statementRepositoryInMemory = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(userRepositoryInMemory, statementRepositoryInMemory);
    });

    it('should be able to create a new statement', async () => {
        const user = await createUserUseCase.execute(userData);

        const statement = await createStatementUseCase.execute({
            ...statementData,
            user_id: `${user.id}`
        });

        expect(statement).toHaveProperty('id');
        expect(statement.user_id).toEqual(user.id)
    });

    it("should no be able to create a new statement it if user not exists", async () => {
        await expect(async () => await createStatementUseCase.execute(statementData))
          .rejects.toBeInstanceOf(AppError)
    });
    
    it("should no be able to create a new statement it if insufficient funds", async () => {
        const user = await createUserUseCase.execute(userData)

        await expect(async () => await createStatementUseCase.execute({
            ...statementData,
            amount: 1000,
            user_id: `${user.id}`
        })).rejects.toBeInstanceOf(AppError);
    });
});