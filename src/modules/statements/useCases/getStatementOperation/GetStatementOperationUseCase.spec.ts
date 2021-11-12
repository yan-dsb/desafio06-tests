import { OperationType } from "../../../../utils/operationType";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement Operation', () => {

  beforeEach(() => {

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

  });

  it('should be able to get a statement operation', async () => {
    const user  = await inMemoryUsersRepository.create({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Test deposit'
    });


    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    });

    expect(statementOperation).toHaveProperty('id');
    expect(statementOperation.type).toBe(statement.type);
    expect(statementOperation.amount).toBe(statement.amount);

  });

  it('should not be able to get statement operation from non-existent user', async () => {


    const statement = await inMemoryStatementsRepository.create({
      user_id: 'non-existing-user',
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Test deposit'
    });


    await expect(getStatementOperationUseCase.execute({
      user_id: 'non-existing-user',
      statement_id: statement.id as string
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);

  });

  it('should not be able to get an non-existent statement operation', async () => {

    const user  = await inMemoryUsersRepository.create({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });


    await expect(getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: 'non-existing-statement',
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);

  });

});
