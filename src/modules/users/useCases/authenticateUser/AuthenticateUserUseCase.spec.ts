import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;


describe('Authenticate User', () => {
  beforeEach(()=> {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate a user', async() => {
    await createUserUseCase.execute({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    const authResponse = await authenticateUserUseCase.execute({
      email: 'test@example.com',
      password: 'test'
    });


    expect(authResponse).toHaveProperty('token');
    expect(authResponse).toHaveProperty('user');
  });

  it('should not be able to authenticate an non-existent user', async() => {

    await expect(authenticateUserUseCase.execute({
      email: 'test@example.com',
      password: 'test'
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  });

  it('should not be able to authenticate a user with incorrect password', async() => {
    await createUserUseCase.execute({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    await expect(authenticateUserUseCase.execute({
      email: 'test@example.com',
      password: 'test123'
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

  });
});
