import { app } from '../../../../app';
import request from 'supertest';
import { Connection } from 'typeorm';
import createConnection from '../../../../database';

let connection: Connection;

describe('Show User Profile', () => {

  beforeAll( async ()=> {

    connection =  await createConnection();
    await connection.runMigrations();

  });

  afterAll( async ()=> {

    await connection.dropDatabase();
    await connection.close();

  });

  it('should be able to show a user profile', async () => {

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'test@example.com',
      password: 'test'
    });

    const { token, user  } = responseToken.body;


    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`
    });


    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toEqual(user.id);
  });

  it('should be able to show an non-existent user profile, user deleted', async () => {

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@example.com',
      password: 'test'
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'test@example.com',
      password: 'test'
    });

    const { token, user  } = responseToken.body;

    await connection.query(`DELETE FROM users WHERE id = '${user.id}'`);

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`
    });


    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
  });

});
