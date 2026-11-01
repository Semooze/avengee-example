import { createClient, type Client } from '@libsql/client';
import { Injectable, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
@Injectable()
export class Database implements OnModuleDestroy {
  private client?: Client;
  private ready?: Promise<void>;
  async connection() {
    if (process.env.VERCEL && !/^libsql:\/\//.test(process.env.TURSO_DATABASE_URL ?? '')) {
      throw new ServiceUnavailableException(
        'Reservations are temporarily unavailable. The demo database has not been connected yet.',
      );
    }
    if (!this.client)
      this.client = createClient({
        url: process.env.exeam_TURSO_DATABASE_URL || 'file:./serein.db',
        authToken: process.env.exeam_TURSO_AUTH_TOKEN || undefined,
      });
    if (!this.ready)
      this.ready = this.client
        .execute(
          `CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, request_key TEXT UNIQUE NOT NULL, request_hash TEXT NOT NULL,
      hotel_id TEXT NOT NULL, room_id TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL,
      status TEXT NOT NULL, payload TEXT NOT NULL
    )`,
        )
        .then(async () => {
          await this.client!.execute(
            'CREATE INDEX IF NOT EXISTS bookings_inventory ON bookings(room_id, status, check_in, check_out)',
          );
        })
        .catch((error) => {
          this.ready = undefined;
          throw error;
        });
    await this.ready;
    return this.client;
  }
  onModuleDestroy() {
    this.client?.close();
  }
}
