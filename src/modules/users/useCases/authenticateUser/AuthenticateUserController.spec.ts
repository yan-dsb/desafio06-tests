import { app } from '../../../../app';
import request from 'supertest';
import { Connection } from 'typeorm';
import createConnection from '../../../../database';

let connection: Connection;

describe('Authenticate User', ()=> {
  beforeAll( async ()=> {

    connection =  await createConnection();
    await connection.runMigrations();

  });

  afterAll( async ()=> {

    await connection.dropDatabase();
    await connection.close();

  });

  it('should be able to authenticate a user', async () => {

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@example.com',
      password: 'test'
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');

  });

  it('should not be able to authenticate an non-existent user', async () => {

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'non-existing@example.com',
      password: 'test'
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');

  });

  it('should not be able to authenticate a user with incorrect password', async () => {

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@example.com',
      password: 'incorrect-password'
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');

  });

});
