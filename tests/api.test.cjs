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

test('health endpoint reports demo mode', async () => {
  const result = await request('/api/health');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { status: 'ok', mode: 'demo' });
});

test('stay length must be 1–30 nights and check-in within the next year', async () => {
  const cases = [
    [{ checkIn: date(100), checkOut: date(131) }, 400, '31 nights'],
    [{ checkIn: date(100), checkOut: date(100) }, 400, '0 nights'],
    [{ checkIn: date(100), checkOut: date(99) }, 400, 'check-out before check-in'],
    [{ checkIn: date(367), checkOut: date(368) }, 400, 'more than a year ahead'],
    [{ checkIn: '2027/01/01' }, 400, 'wrong date format'],
    [{ checkIn: 'tomorrow' }, 400, 'not a date'],
  ];
  for (const [stay, status, label] of cases) {
    const result = await request('/api/bookings', 'POST', input(stay));
    assert.equal(result.status, status, label);
    assert.equal(typeof result.body.message, 'string', label);
  }
  const thirty = await request(
    '/api/bookings',
    'POST',
    input({ roomId: 'tide-family', checkIn: date(100), checkOut: date(130) }),
  );
  assert.equal(thirty.status, 201);
  assert.equal(thirty.body.nights, 30);
  assert.equal(thirty.body.subtotal, 30 * 9200);
  assert.equal(thirty.body.tax, Math.round(30 * 9200 * 0.1));
  assert.equal(thirty.body.total, thirty.body.subtotal + thirty.body.tax);
});

test('rejects unknown hotels, malformed keys, and rooms too small for the party', async () => {
  for (const [bad, label] of [
    [{ hotelId: 'missing' }, 'unknown hotel'],
    [{ hotelId: 'river-lane' }, 'room belongs to another hotel'],
    [{ idempotencyKey: 'not-a-uuid' }, 'idempotency key must be a uuid'],
    [{ guests: 0 }, 'no guests'],
    [{ guests: 3 }, 'room capacity is 2'],
    [{ lastName: '' }, 'missing last name'],
    [{ firstName: 'x'.repeat(81) }, 'name too long'],
  ]) {
    assert.equal((await request('/api/bookings', 'POST', input(bad))).status, 400, label);
  }
  const family = await request(
    '/api/bookings',
    'POST',
    input({ roomId: 'tide-family', guests: 4, checkIn: date(140), checkOut: date(141) }),
  );
  assert.equal(family.status, 201);
});

test('normalises email and never returns the raw access token on lookup', async () => {
  const created = await request(
    '/api/bookings',
    'POST',
    input({ email: 'Alex@Example.COM', checkIn: date(150), checkOut: date(151) }),
  );
  assert.equal(created.status, 201);
  assert.equal(created.body.email, 'alex@example.com');
  assert.match(created.body.id, /^SRN-/);
  assert.match(created.body.token, /^[0-9a-f]{64}$/);
  const found = await request(
    `/api/bookings/${created.body.id}`,
    'GET',
    undefined,
    created.body.token,
  );
  assert.equal(found.status, 200);
  assert.equal(found.body.token, undefined);
  assert.equal(found.body.status, 'confirmed');
});

test('availability validates its query and reports capacity and sold-out rooms', async () => {
  assert.equal(
    (
      await request(
        '/api/hotels/missing/availability?checkIn=' +
          date(160) +
          '&checkOut=' +
          date(161) +
          '&guests=2',
      )
    ).status,
    404,
  );
  for (const query of [
    `checkIn=${date(160)}&checkOut=${date(160)}&guests=2`,
    `checkIn=${date(-2)}&checkOut=${date(1)}&guests=2`,
    `checkIn=${date(160)}&checkOut=${date(161)}&guests=5`,
    `checkIn=${date(160)}&checkOut=${date(161)}&guests=0`,
    `checkOut=${date(161)}&guests=2`,
  ]) {
    assert.equal((await request(`/api/hotels/the-tide/availability?${query}`)).status, 400, query);
  }
  const forFour = await request(
    `/api/hotels/the-tide/availability?checkIn=${date(160)}&checkOut=${date(162)}&guests=4`,
  );
  assert.equal(forFour.status, 200);
  const byId = Object.fromEntries(forFour.body.map((room) => [room.id, room]));
  assert.equal(byId['tide-garden'].available, 0, 'two-person room cannot host four');
  assert.equal(byId['tide-family'].available, 2);
  assert.equal(byId['tide-family'].nights, 2);
  assert.equal(byId['tide-family'].total, 2 * 9200 + Math.round(2 * 9200 * 0.1));
});

test('selling every unit of a room returns 409 until a booking is cancelled', async () => {
  const stay = { roomId: 'tide-garden', checkIn: date(170), checkOut: date(172) };
  const created = [];
  for (let unit = 0; unit < 4; unit += 1) {
    const result = await request('/api/bookings', 'POST', input(stay));
    assert.equal(result.status, 201, `unit ${unit + 1}`);
    created.push(result.body);
  }
  const soldOut = await request('/api/bookings', 'POST', input(stay));
  assert.equal(soldOut.status, 409);
  assert.match(soldOut.body.message, /no longer available/);
  const availability = await request(
    `/api/hotels/the-tide/availability?checkIn=${date(171)}&checkOut=${date(173)}&guests=2`,
  );
  assert.equal(availability.body.find((room) => room.id === 'tide-garden').available, 0);
  await request(`/api/bookings/${created[0].id}`, 'DELETE', undefined, created[0].token);
  assert.equal((await request('/api/bookings', 'POST', input(stay))).status, 201);
});

test('cancellation needs the matching token and is safe to repeat', async () => {
  const one = await request(
    '/api/bookings',
    'POST',
    input({ checkIn: date(180), checkOut: date(181) }),
  );
  const two = await request(
    '/api/bookings',
    'POST',
    input({ checkIn: date(182), checkOut: date(183) }),
  );
  const path = `/api/bookings/${one.body.id}`;
  assert.equal((await request(path, 'DELETE')).status, 404, 'no token');
  assert.equal(
    (await request(path, 'DELETE', undefined, two.body.token)).status,
    404,
    'other token',
  );
  assert.equal((await request(path, 'GET', undefined, one.body.token)).body.status, 'confirmed');
  const first = await request(path, 'DELETE', undefined, one.body.token);
  const second = await request(path, 'DELETE', undefined, one.body.token);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(second.body.status, 'cancelled');
  assert.equal((await request(path, 'GET', undefined, one.body.token)).body.status, 'cancelled');
  assert.equal(
    (await request('/api/bookings/SRN-unknown', 'GET', undefined, one.body.token)).status,
    404,
  );
});

test('only Bearer authorization headers are accepted', async () => {
  const created = await request(
    '/api/bookings',
    'POST',
    input({ checkIn: date(190), checkOut: date(191) }),
  );
  const response = await inject(app.getHttpAdapter().getInstance(), {
    url: `/api/bookings/${created.body.id}`,
    method: 'GET',
    headers: { Authorization: `Token ${created.body.token}` },
  });
  assert.equal(response.statusCode, 404);
});

test('idempotent retry of a cancelled booking reports its current status', async () => {
  const payload = input({ checkIn: date(200), checkOut: date(201) });
  const created = await request('/api/bookings', 'POST', payload);
  await request(`/api/bookings/${created.body.id}`, 'DELETE', undefined, created.body.token);
  const retried = await request('/api/bookings', 'POST', payload);
  assert.equal(retried.status, 201);
  assert.equal(retried.body.id, created.body.id);
  assert.equal(retried.body.status, 'cancelled');
});
