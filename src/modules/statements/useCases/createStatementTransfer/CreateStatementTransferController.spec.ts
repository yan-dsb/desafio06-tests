import { app } from '../../../../app';
import request from 'supertest';
import { Connection } from 'typeorm';
import createConnection from '../../../../database';
import { v4 as uuid } from 'uuid';

let connection: Connection;

describe('Create Statement Transfer', () => {

  beforeAll( async ()=> {

    connection =  await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test_transfer_sender@example.com',
      password: 'test'
    });

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test_transfer_receiver@example.com',
      password: 'test'
    });

  });

  afterAll( async ()=> {

    await connection.dropDatabase();
    await connection.close();

  });

  it('should be able to create a statement transfer', async ()=> {

    const responseReceiver = await request(app).post('/api/v1/sessions').send({
      email: 'test_transfer_receiver@example.com',
      password: 'test'
    });

    const { id: receiver_id } = responseReceiver.body.user;

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'test_transfer_sender@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).post(`/api/v1/statements/transfers/${receiver_id}`).send({
      amount: 70,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.amount).toEqual(70);

  });

  it('should not be able to create a statement transfer to non-existent receiver', async ()=> {

    const receiver_id = uuid();

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'test_transfer_sender@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).post(`/api/v1/statements/transfers/${receiver_id}`).send({
      amount: 70,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');

  });

  it('should not be able to create a statement transfer with insufficient funds', async ()=> {

    const responseReceiver = await request(app).post('/api/v1/sessions').send({
      email: 'test_transfer_receiver@example.com',
      password: 'test'
    });

    const { id: receiver_id } = responseReceiver.body.user;

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'test_transfer_sender@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    const response = await request(app).post(`/api/v1/statements/transfers/${receiver_id}`).send({
      amount: 150,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');

  });

});
