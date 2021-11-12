import { app } from '../../../../app';
import request from 'supertest';
import { Connection } from 'typeorm';
import createConnection from '../../../../database';
import { v4 as uuidv4 } from 'uuid';

let connection: Connection;

describe('Get Statement Operation', () => {

  beforeAll( async ()=> {

    connection =  await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'teststatementget@example.com',
      password: 'test'
    });

  });

  afterAll( async ()=> {

    await connection.dropDatabase();
    await connection.close();

  });

  it('should be able to get user statement operation', async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'teststatementget@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    const { id: statement_id } = responseStatement.body;

    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(statement_id);

  });


  it('should not be able to get non-existent user statement operation', async () => {


    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'teststatementget@example.com',
      password: 'test'
    });

    const { token } = responseToken.body;

    const non_existing_statement_uuid = uuidv4();

    const response = await request(app).get(`/api/v1/statements/${non_existing_statement_uuid}`).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');

  });

  it('should not be able to get statement operation, user does not exists', async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'teststatementget@example.com',
      password: 'test'
    });

    const { token, user } = responseToken.body;

    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'test'
    }).set({
      Authorization: `Bearer ${token}`
    });

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    const { id: statement_id } = responseStatement.body;

    const response = await request(app).get(`/api/v1/statements/${statement_id}`).set({
      Authorization: `Bearer ${token}`
    });


    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');

  });

});
