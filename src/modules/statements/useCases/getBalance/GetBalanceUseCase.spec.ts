import { GetBalanceError } from './GetBalanceError';
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from './GetBalanceUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance', () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);

  });

  it('should be able to get user balance', async () => {

    const user = await inMemoryUsersRepository.create({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });


    const balance = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(balance).toHaveProperty('balance');
    expect(balance).toHaveProperty('statement');
    expect(balance.balance).toEqual(0);
    expect(balance.statement.length).toBe(0);

  });

  it('should not be able to get an non-existent user balance', async () => {

    await expect(getBalanceUseCase.execute({
      user_id: 'non-existing-user'
    })).rejects.toBeInstanceOf(GetBalanceError);

  });

});
