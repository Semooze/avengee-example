const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const inject = require('light-my-request');
const express = require('express')();

const directory = mkdtempSync(join(tmpdir(), 'serein-build-test-'));
process.env.TURSO_DATABASE_URL = `file:${directory}/bookings.db`;
after(() => rmSync(directory, { recursive: true }));
const handler = require('../.next/server/pages/api/[[...path]].js').default;
// Tell light-my-request to retain its capture prototypes when Express adapts the response.
handler.request = express.request;
handler.response = express.response;
handler.request.app = handler;

async function request(url, method = 'GET', payload, token) {
  const response = await inject(handler, {
    url,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    payload: payload ? JSON.stringify(payload) : undefined,
  });
  return { status: response.statusCode, body: response.json() };
}

test('compiled Next.js API delegates health and catalogue to NestJS', async () => {
  assert.deepEqual(await request('/api/health'), {
    status: 200,
    body: { status: 'ok', mode: 'demo' },
  });
  const result = await request('/api/hotels');
  assert.equal(result.status, 200);
  assert.equal(result.body.length, 6);
});

test('compiled API can book, retrieve, and cancel with persistent authorization', async () => {
  const date = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  const created = await request('/api/bookings', 'POST', {
    hotelId: 'the-tide',
    roomId: 'tide-garden',
    checkIn: date(7),
    checkOut: date(10),
    guests: 2,
    firstName: 'Build',
    lastName: 'Test',
    email: 'build@example.com',
    idempotencyKey: crypto.randomUUID(),
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.total, 13860);
  const path = `/api/bookings/${created.body.id}`;
  assert.equal((await request(path)).status, 404);
  assert.equal(
    (await request(path, 'GET', undefined, created.body.token)).body.status,
    'confirmed',
  );
  assert.equal(
    (await request(path, 'DELETE', undefined, created.body.token)).body.status,
    'cancelled',
  );
});
