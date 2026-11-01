const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApplication } = require('../packages/api');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const inject = require('light-my-request');
let app, base, directory;
const date = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const input = (extra = {}) => ({
  hotelId: 'the-tide',
  roomId: 'tide-garden',
  checkIn: date(7),
  checkOut: date(10),
  guests: 2,
  firstName: 'Alex',
  lastName: 'River',
  email: 'alex@example.com',
  idempotencyKey: crypto.randomUUID(),
  ...extra,
});
async function request(path, method = 'GET', body, token) {
  const response = await inject(app.getHttpAdapter().getInstance(), {
    url: path,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    payload: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.statusCode, body: response.json() };
}
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'serein-test-'));
  process.env.TURSO_DATABASE_URL = `file:${directory}/bookings.db`;
  app = await createApplication();
});
after(async () => {
  await app?.close();
  if (directory) await rm(directory, { recursive: true });
});
test('catalogue exposes fictional properties and room prices', async () => {
  const result = await request('/api/hotels');
  assert.equal(result.status, 200);
  assert.equal(result.body.length, 6);
  assert.equal(result.body[0].rooms[0].price, 4200);
});
test('server prices a reservation and requires its token for access', async () => {
  const created = await request('/api/bookings', 'POST', input());
  assert.equal(created.status, 201);
  assert.equal(created.body.total, 13860);
  assert.equal(created.body.nights, 3);
  assert.equal((await request(`/api/bookings/${created.body.id}`)).status, 404);
  assert.equal(
    (await request(`/api/bookings/${created.body.id}`, 'GET', undefined, 'incorrect')).status,
    404,
  );
  const found = await request(
    `/api/bookings/${created.body.id}`,
    'GET',
    undefined,
    created.body.token,
  );
  assert.equal(found.body.firstName, 'Alex');
  assert.equal(found.body.token, undefined);
  const cancelled = await request(
    `/api/bookings/${created.body.id}`,
    'DELETE',
    undefined,
    created.body.token,
  );
  assert.equal(cancelled.body.status, 'cancelled');
});
test('rejects invalid dates, capacity, unknown rooms, and client price fields', async () => {
  for (const bad of [
    { checkIn: date(-1) },
    { checkOut: date(7) },
    { checkIn: '2027-02-30' },
    { guests: 5 },
    { roomId: 'missing' },
    { total: 1 },
    { email: 'bad' },
    { firstName: ' ' },
  ]) {
    assert.equal(
      (await request('/api/bookings', 'POST', input(bad))).status,
      400,
      JSON.stringify(bad),
    );
  }
});
test('idempotent retries return the same booking; changed payload is rejected', async () => {
  const payload = input({ checkIn: date(20), checkOut: date(21) });
  const one = await request('/api/bookings', 'POST', payload);
  const two = await request('/api/bookings', 'POST', payload);
  assert.equal(one.body.id, two.body.id);
  assert.equal(one.body.token, two.body.token);
  assert.equal(
    (await request('/api/bookings', 'POST', { ...payload, firstName: 'Other' })).status,
    409,
  );
});
test('last-room races cannot oversell and cancellation restores availability', async () => {
  const payload = input({ roomId: 'tide-pool', checkIn: date(30), checkOut: date(32) });
  const results = await Promise.all([
    request('/api/bookings', 'POST', payload),
    request('/api/bookings', 'POST', { ...payload, idempotencyKey: crypto.randomUUID() }),
  ]);
  assert.deepEqual(results.map((x) => x.status).sort(), [201, 409]);
  const winner = results.find((x) => x.status === 201).body;
  let available = await request(
    `/api/hotels/the-tide/availability?checkIn=${date(30)}&checkOut=${date(32)}&guests=2`,
  );
  assert.equal(available.body.find((x) => x.id === 'tide-pool').available, 0);
  await request(`/api/bookings/${winner.id}`, 'DELETE', undefined, winner.token);
  available = await request(
    `/api/hotels/the-tide/availability?checkIn=${date(30)}&checkOut=${date(32)}&guests=2`,
  );
  assert.equal(available.body.find((x) => x.id === 'tide-pool').available, 1);
});
test('adjacent stays can share a room and data survives app restart', async () => {
  const created = await request(
    '/api/bookings',
    'POST',
    input({ roomId: 'tide-pool', checkIn: date(40), checkOut: date(41) }),
  );
  assert.equal(created.status, 201);
  assert.equal(
    (
      await request(
        '/api/bookings',
        'POST',
        input({ roomId: 'tide-pool', checkIn: date(41), checkOut: date(42) }),
      )
    ).status,
    201,
  );
  await app.close();
  app = await createApplication();
  assert.equal(
    (await request(`/api/bookings/${created.body.id}`, 'GET', undefined, created.body.token)).body
      .status,
    'confirmed',
  );
});

test('multi-night inventory uses peak occupancy, not total overlapping reservations', async () => {
  const stay = { roomId: 'tide-family', checkIn: date(60), checkOut: date(61) };
  assert.equal((await request('/api/bookings', 'POST', input(stay))).status, 201);
  assert.equal(
    (
      await request(
        '/api/bookings',
        'POST',
        input({ ...stay, checkIn: date(61), checkOut: date(62) }),
      )
    ).status,
    201,
  );
  const availability = await request(
    `/api/hotels/the-tide/availability?checkIn=${date(60)}&checkOut=${date(62)}&guests=2`,
  );
  assert.equal(availability.body.find((room) => room.id === 'tide-family').available, 1);
  assert.equal(
    (await request('/api/bookings', 'POST', input({ ...stay, checkOut: date(62) }))).status,
    201,
  );
  assert.equal(
    (await request('/api/bookings', 'POST', input({ ...stay, checkOut: date(62) }))).status,
    409,
  );
});

test('independent API instances cannot oversell the same last room', async () => {
  const other = await createApplication();
  try {
    const payload = input({ roomId: 'tide-pool', checkIn: date(70), checkOut: date(72) });
    const responses = await Promise.all([
      request('/api/bookings', 'POST', payload),
      inject(other.getHttpAdapter().getInstance(), {
        url: '/api/bookings',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ ...payload, idempotencyKey: crypto.randomUUID() }),
      }).then((r) => ({ status: r.statusCode, body: r.json() })),
    ]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
  } finally {
    await other.close();
  }
});

test('Vercel refuses ephemeral booking storage and still serves the catalogue', async () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = '1';
  try {
    assert.equal((await request('/api/hotels')).status, 200);
    const result = await request(
      '/api/bookings',
      'POST',
      input({ checkIn: date(80), checkOut: date(81) }),
    );
    assert.equal(result.status, 503);
    assert.match(result.body.message, /database/);
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});
