import { OperationType } from "../../../../utils/operationType";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from './CreateStatementUseCase';


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;


describe('Create Statement', () => {

  beforeEach(() => {

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

  });

  it('should be able to create a new statement', async () => {

    const user = await inMemoryUsersRepository.create({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });


    const statementOperation = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Test deposit'
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation.amount).toBe(100);
  });

  it('should not be able to create a new statement, user does not exist', async () => {

    await expect(createStatementUseCase.execute({
      user_id: 'non-existing-user',
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Test deposit'
    })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

  });

  it('should not be able to create a new statement, user has insufficient funds', async () => {

    const user = await inMemoryUsersRepository.create({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    await expect(createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 1,
      description: 'Test deposit'
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

  });

});
