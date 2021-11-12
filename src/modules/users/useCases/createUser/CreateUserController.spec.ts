import { app } from '../../../../app';
import request from 'supertest';
import { Connection } from 'typeorm';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create User', ()=> {

  beforeAll( async ()=> {

    connection =  await createConnection();
    await connection.runMigrations();

  });

  afterAll( async ()=> {

    await connection.dropDatabase();
    await connection.close();

  });

  it('should be able to create a new user', async () => {

    const response = await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    expect(response.status).toBe(201);

  });

  it('should not be able to create a new user, a user already exists with this email', async () => {

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    const response = await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

});
