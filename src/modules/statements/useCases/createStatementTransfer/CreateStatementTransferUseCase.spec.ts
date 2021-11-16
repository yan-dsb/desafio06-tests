import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateStatementTransferUseCase } from './CreateStatementTransferUseCase';
import { OperationType } from '../../../../utils/operationType';
import { CreateStatementTransferError } from './CreateStatementTransferError';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createTransferStatementUseCase: CreateStatementTransferUseCase;

describe('Create Statement Transfer', () => {

  beforeEach(() => {

    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new  InMemoryStatementsRepository();
    createTransferStatementUseCase = new  CreateStatementTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );

  });

  it('should be able to create a statement transfer', async () => {

    const userSender = await inMemoryUsersRepository.create({
      email: 'test@example.com',
      name: 'test',
      password: '123456'
    });


    const userReceiver= await inMemoryUsersRepository.create({
      email: 'test-r@example.com',
      name: 'test',
      password: '123456'
    });

    await inMemoryStatementsRepository.create({
      amount: 150,
      description: 'Deposit test',
      type: OperationType.DEPOSIT,
      user_id: userSender.id as string
    });

    const statement = await createTransferStatementUseCase.execute({
      sender_id: userSender.id as string,
      receiver_id: userReceiver.id as string,
      amount: 100,
      description: 'Transfer test'
    });

    expect(statement).toHaveProperty('id');
    expect(statement.type).toEqual(OperationType.TRANSFER);
  });

  it('should not be able to create a statement transfer to non-existent user receiver', async () => {

    const userSender = await inMemoryUsersRepository.create({
      email: 'test@example.com',
      name: 'test',
      password: '123456'
    });

    await inMemoryStatementsRepository.create({
      amount: 150,
      description: 'Deposit test',
      type: OperationType.DEPOSIT,
      user_id: userSender.id as string
    });

    await expect(createTransferStatementUseCase.execute({
      sender_id: userSender.id as string,
      receiver_id: 'non-existent-user-receiver',
      amount: 100,
      description: 'Transfer test'
    })).rejects.toBeInstanceOf(CreateStatementTransferError.UserNotFound);

  });

  it('should not be able to create a statement transfer with insufficient funds', async () => {

    const userSender = await inMemoryUsersRepository.create({
      email: 'test@example.com',
      name: 'test',
      password: '123456'
    });

    const userReceiver= await inMemoryUsersRepository.create({
      email: 'test-r@example.com',
      name: 'test',
      password: '123456'
    });

    await expect(createTransferStatementUseCase.execute({
      sender_id: userSender.id as string,
      receiver_id: userReceiver.id as string,
      amount: 100,
      description: 'Transfer test'
    })).rejects.toBeInstanceOf(CreateStatementTransferError.InsufficientFunds);

  });

});
