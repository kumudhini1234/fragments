const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

jest.mock('../../src/model/fragment');

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/123').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments/123').auth('invalid@email.com', 'wrongpassword').expect(401));

  test('returns 404 if the fragment is not found', async () => {
    Fragment.byId.mockRejectedValue(new Error('Fragment not found'));

    const res = await request(app).get('/v1/fragments/123').auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('Fragment with ID 123 not found');
  });

  test('returns raw data when requested extension matches original type', async () => {
    const rawContent = 'This is plain text content.';
    const rawBuffer = Buffer.from(rawContent);

    Fragment.byId.mockResolvedValue({
      id: '456',
      mimeType: 'text/plain',
      getData: jest.fn().mockResolvedValue(rawBuffer),
    });

    const res = await request(app)
      .get('/v1/fragments/456.txt')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain');
    expect(res.text).toBe(rawContent);
  });

  test('returns 415 for unsupported extensions', async () => {
    Fragment.byId.mockResolvedValue({
      id: '123',
      mimeType: 'text/plain',
      getData: jest.fn().mockResolvedValue(Buffer.from('Some data')),
    });

    const res = await request(app)
      .get('/v1/fragments/123.unsupported')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toContain('Unsupported extension');
  });

  test('returns 415 if conversion is not supported', async () => {
    Fragment.byId.mockResolvedValue({
      id: '123',
      mimeType: 'text/plain',
      getData: jest.fn().mockResolvedValue(Buffer.from('Some data')),
    });

    const res = await request(app)
      .get('/v1/fragments/123.json')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toContain('Conversion to json is not supported');
  });

  test('returns HTML content if Markdown fragment is requested as HTML', async () => {
    Fragment.byId.mockResolvedValue({
      id: '123',
      mimeType: 'text/markdown',
      getData: jest.fn().mockResolvedValue(Buffer.from('# Markdown Content')),
    });

    const res = await request(app)
      .get('/v1/fragments/123.html')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<h1>Markdown Content</h1>');
  });

  test('returns converted CSV to JSON', async () => {
    Fragment.byId.mockResolvedValue({
      id: '123',
      mimeType: 'text/csv',
      getData: jest.fn().mockResolvedValue(Buffer.from('name,age\nJohn,30\nDoe,25')),
    });

    const res = await request(app)
      .get('/v1/fragments/123.json')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(JSON.parse(res.text)).toEqual([
      { name: 'John', age: '30' },
      { name: 'Doe', age: '25' },
    ]);
  });
});
