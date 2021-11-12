import { app } from '../../../../app';
import request from 'supertest';
import { Connection } from 'typeorm';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Balance', () => {

  beforeAll( async ()=> {

    connection =  await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

  });

  afterAll( async ()=> {

    await connection.dropDatabase();
    await connection.close();

  });


  it('should be able to get user balance', async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'test@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statement');
    expect(response.body).toHaveProperty('balance');
    expect(response.body.balance).toBe(0);

  });

  it('should not be able to get an non-existent user balance', async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'test@example.com',
      password: 'test'
    });

    const { token, user } = responseToken.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');

  });

});
