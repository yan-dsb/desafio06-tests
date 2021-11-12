import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {

  beforeEach(() => {

    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);

  });

  it('should be able to show a user profile', async () => {

    const userCreated = await inMemoryUsersRepository.create({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    const user = await showUserProfileUseCase.execute(userCreated.id as string);


    expect(user).toHaveProperty('id');

  });

  it('should not be able to show an non-existent user profile', async () => {

    await expect(showUserProfileUseCase.execute('non-existing-user')).rejects.toBeInstanceOf(ShowUserProfileError);

  });

});
