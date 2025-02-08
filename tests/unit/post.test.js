const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with 201 response fragment and location header to the GET URL of the fragment
  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain')
      .send('This is a fragment')
      .expect(201); // Set the expected HTTP status code
    // Match the location header pattern host/v1/fragments/:id
    expect(res.header.location).toMatch(/\/v1\/fragments\/([\w-]+)$/);
  });

  // Unsupported type throws 415 error as expected
  test('unsupported fragment type throws 415 Error', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/xml')
      .send('This is a fragment')
      .expect(415);

    // Assert the response message
    expect(res.body.error.message).toBe(
      'The Content-Type of the fragment being sent with the request is not supported'
    );
  });
});