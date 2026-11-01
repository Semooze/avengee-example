import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { hotels, priceFor, type Booking, type BookingInput } from '@avengee/domain';
import { Database } from './database';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
function peakOccupancy(
  reservations: { check_in: unknown; check_out: unknown }[],
  checkIn: string,
  checkOut: string,
) {
  let peak = 0;
  for (let time = Date.parse(checkIn); time < Date.parse(checkOut); time += 86400000) {
    const day = new Date(time).toISOString().slice(0, 10);
    peak = Math.max(
      peak,
      reservations.filter((row) => String(row.check_in) <= day && String(row.check_out) > day)
        .length,
    );
  }
  return peak;
}
@Injectable()
export class Bookings {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(@Inject(Database) private readonly database: Database) {}
  private async serialized<T>(action: () => Promise<T>): Promise<T> {
    const next = this.queue.then(action, action);
    this.queue = next.catch(() => undefined);
    return next;
  }
  async availability(hotelId: string, stay: { checkIn: string; checkOut: string; guests: number }) {
    const hotel = hotels.find((h) => h.id === hotelId);
    if (!hotel) throw new NotFoundException('Stay not found.');
    const db = await this.database.connection();
    const occupied = await db.execute({
      sql: "SELECT room_id, check_in, check_out FROM bookings WHERE hotel_id = ? AND status = 'confirmed' AND check_in < ? AND check_out > ?",
      args: [hotelId, stay.checkOut, stay.checkIn],
    });
    return hotel.rooms.map((room) => ({
      ...room,
      available:
        room.capacity < stay.guests
          ? 0
          : Math.max(
              0,
              room.stock -
                peakOccupancy(
                  occupied.rows
                    .filter((row) => row.room_id === room.id)
                    .map((row) => ({ check_in: row.check_in, check_out: row.check_out })),
                  stay.checkIn,
                  stay.checkOut,
                ),
            ),
      ...priceFor(room, stay.checkIn, stay.checkOut),
    }));
  }
  async create(input: BookingInput) {
    const hotel = hotels.find((h) => h.id === input.hotelId);
    const room = hotel?.rooms.find((r) => r.id === input.roomId);
    if (!hotel || !room || room.capacity < input.guests)
      throw new BadRequestException('Choose a room that fits your guests.');
    const { idempotencyKey, ...details } = input;
    const requestKey = hash(idempotencyKey);
    const requestHash = hash(JSON.stringify(details));
    return this.serialized(async () => {
      const db = await this.database.connection();
      const tx = await db.transaction('write');
      try {
        const existing = await tx.execute({
          sql: 'SELECT * FROM bookings WHERE request_key = ?',
          args: [requestKey],
        });
        if (existing.rows[0]) {
          if (existing.rows[0].request_hash !== requestHash)
            throw new ConflictException(
              'This request has already been used. Refresh and try again.',
            );
          const booking = JSON.parse(String(existing.rows[0].payload)) as Booking;
          await tx.commit();
          return {
            ...booking,
            status: existing.rows[0].status,
            token: hash(idempotencyKey + booking.id),
          };
        }
        const occupied = await tx.execute({
          sql: "SELECT check_in, check_out FROM bookings WHERE room_id = ? AND status = 'confirmed' AND check_in < ? AND check_out > ?",
          args: [room.id, input.checkOut, input.checkIn],
        });
        if (
          peakOccupancy(
            occupied.rows.map((row) => ({ check_in: row.check_in, check_out: row.check_out })),
            input.checkIn,
            input.checkOut,
          ) >= room.stock
        )
          throw new ConflictException(
            'This room is no longer available for your dates. Please choose another room or different dates.',
          );
        const id = `SRN-${randomUUID()}`;
        const token = hash(idempotencyKey + id);
        const booking = {
          ...details,
          id,
          hotelName: hotel.name,
          roomName: room.name,
          ...priceFor(room, input.checkIn, input.checkOut),
          status: 'confirmed' as const,
          createdAt: new Date().toISOString(),
        };
        await tx.execute({
          sql: 'INSERT INTO bookings (id, token_hash, request_key, request_hash, hotel_id, room_id, check_in, check_out, status, payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            id,
            hash(token),
            requestKey,
            requestHash,
            hotel.id,
            room.id,
            input.checkIn,
            input.checkOut,
            'confirmed',
            JSON.stringify(booking),
          ],
        });
        await tx.commit();
        return { ...booking, token };
      } catch (error) {
        if (!tx.closed) await tx.rollback();
        throw error;
      } finally {
        tx.close();
      }
    });
  }
  async find(id: string, token: string) {
    const db = await this.database.connection();
    const result = await db.execute({
      sql: 'SELECT payload, status FROM bookings WHERE id = ? AND token_hash = ?',
      args: [id, hash(token)],
    });
    if (!result.rows[0])
      throw new NotFoundException('Booking not found. Check your reference and access code.');
    return {
      ...JSON.parse(String(result.rows[0].payload)),
      status: result.rows[0].status,
    } as Booking;
  }
  async cancel(id: string, token: string) {
    const booking = await this.find(id, token);
    const db = await this.database.connection();
    await db.execute({
      sql: "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND token_hash = ?",
      args: [id, hash(token)],
    });
    return { ...booking, status: 'cancelled' as const };
  }
}
