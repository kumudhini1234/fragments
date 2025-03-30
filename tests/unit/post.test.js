const { Fragment } = require('../../src/model/fragment');
const request = require('supertest');
const app = require('../../src/app');
const hashEmail = require('../../src/hash');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Authenticated users can create a plain text fragment
  test('authenticated users can create a plain text fragment and response includes expected fragment properties', async () => {
    const data = 'This is a plain text fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(data)
      .set('Content-Type', 'text/plain');

    // Check status code
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');

    const fragment = res.body.fragment;
    const expectEmail = hashEmail('user1@email.com');

    // Check responses include all necessary properties
    expect(fragment).toHaveProperty('id');
    expect(fragment).toHaveProperty('created');
    expect(fragment).toHaveProperty('updated');
    expect(fragment).toHaveProperty('ownerId');
    expect(fragment).toHaveProperty('type');
    expect(fragment).toHaveProperty('size');

    // Make sure the created and updated values are in ISO string format
    expect(fragment.created).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    expect(fragment.updated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);

    // Check if the values match expectation
    expect(fragment.ownerId).toBe(expectEmail);
    expect(fragment.type).toBe('text/plain');
    expect(fragment.size).toBe(data.length);
    expect(res.headers.location).toContain(`/v1/fragments/${fragment.id}`);
  });

  // Request with unsupported content type will be rejected with 415 status code
  test('unsupported Content-Type is rejected with 415 error', async () => {
    const xmlData = '<note><to>User</to><from>Admin</from><message>Hello</message></note>';

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(xmlData)
      .set('Content-Type', 'application/xml');

    // Check status code and error message
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Unsupported Content-Type');
  });

  // Authenticated users can create a JSON fragment
  test('authenticated users can create a JSON fragment', async () => {
    const jsonData = { key: 'value' };
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send(jsonData)
      .set('Content-Type', 'application/json');

    // Check status code and location header
    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(/\/v1\/fragments\/([\w-]+)$/);
  });

  // Request without a body returns 400 error
  test('request without a body returns 400 error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send();

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe('Invalid request body');
  });

  test('returns 500 if fragment creation fails', async () => {
    // Mock fragment.save() to throw an error
    jest.spyOn(Fragment.prototype, 'save').mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    // Restore original behavior
    jest.restoreAllMocks();

    // Expect a 500 error
    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Internal Server Error'); // Adjust if needed
  });
});

// const request = require('supertest');
// const app = require('../../src/app');

// describe('POST /v1/fragments', () => {
//   // If the request is missing the Authorization header, it should be forbidden
//   test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

//   // If the wrong username/password pair are used (no such user), it should be forbidden
//   test('incorrect credentials are denied', () =>
//     request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

//   // Authenticated users can create a plain text fragment
//   test('authenticated users can create a plain text fragment', async () => {
//     const res = await request(app)
//       .post('/v1/fragments')
//       .auth('user1@email.com', 'password1')
//       .set('content-type', 'text/plain')
//       .send('This is a fragment')
//       .expect(201); // Set the expected HTTP status code
//     // and Match the location header pattern host/v1/fragments/:id
//     expect(res.header.location).toMatch(/\/v1\/fragments\/([\w-]+)$/);
//   });

//   // Unsupported type throws 415 error as expected
//   test('unsupported fragment type throws 415 Error', async () => {
//     const res = await request(app)
//       .post('/v1/fragments')
//       .auth('user1@email.com', 'password1')
//       .set('content-type', 'application/xml')
//       .send('This is a fragment')
//       .expect(415);

//     //  response message
//     expect(res.body.error.message).toBe(
//       'The Content-Type of the fragment being sent with the request is not supported'
//     );
//   });
// });
