import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalnceUseCase: GetBalanceUseCase;

const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
};

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
    type: OperationType.DEPOSIT
};

describe('Get Balance Use Case', () => {
    beforeEach(() => {
        userRepositoryInMemory = new InMemoryUsersRepository();
        statementRepositoryInMemory = new InMemoryStatementsRepository();
        createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
        createStatementUseCase = new CreateStatementUseCase(userRepositoryInMemory, statementRepositoryInMemory);
        getBalnceUseCase = new GetBalanceUseCase(statementRepositoryInMemory, userRepositoryInMemory);
    });

    it("must be able to get balance per existing user using the user ID", async() => {
        const user = await createUserUseCase.execute(userData);

        await createStatementUseCase.execute({
            ...statementData,
            user_id: `${user.id}`
        });

        const balance = await getBalnceUseCase.execute({ user_id: `${user.id}` });

        expect(balance).toHaveProperty('balance');
    });

    it("should no be able to get balance if it user not exists", async () => {
        await expect(async () =>
          await getBalnceUseCase.execute({user_id: "not exists"})
        ).rejects.toBeInstanceOf(AppError)
    })
});