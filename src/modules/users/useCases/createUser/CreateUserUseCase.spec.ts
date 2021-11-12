import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {

  beforeEach(()=> {

    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

  });

  it('should be able to create a new user', async () => {

    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    expect(user).toHaveProperty('id');

  });

  it('should not be able to create a new user, a user already exists with this email', async () => {
    await createUserUseCase.execute({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    await expect(createUserUseCase.execute({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    })).rejects.toBeInstanceOf(CreateUserError);

  });

});
