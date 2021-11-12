import { app } from '../../../../app';
import request from 'supertest';
import { Connection } from 'typeorm';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create Statement', () => {

  beforeAll( async ()=> {

    connection =  await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'teststatementcreate@example.com',
      password: 'test'
    });

  });

  afterAll( async ()=> {

    await connection.dropDatabase();
    await connection.close();

  });

  it('should be able to create a new statement of type deposit', async ()=> {


    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'teststatementcreate@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });


    expect(response.status).toBe(201);
    expect(response.body.amount).toEqual(100);

  });

  it('should be able to create a new statement of type withdraw', async ()=> {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'teststatementcreate@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 50,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });


    expect(response.status).toBe(201);
    expect(response.body.amount).toEqual(50);

  });

  it('should not be able to create a new statement of type withdraw, user has insufficient funds', async ()=> {


    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'teststatementcreate@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    const response = await request(app).post('/api/v1/statements/withdraw').send({
      amount: 150,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });


    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');

  });

  it('should not be able to create a new statement to non-existent user', async ()=> {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'teststatementcreate@example.com',
      password: 'test'
    });

    const { token, user } = responseToken.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);


    const response = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });


    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');

  });

});
