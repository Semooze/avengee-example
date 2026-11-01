import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (value) =>
      Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
    'Choose a valid calendar date.',
  );
const stayFields = { checkIn: date, checkOut: date, guests: z.coerce.number().int().min(1).max(4) };
function validStay<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.superRefine((raw, ctx) => {
    const value = raw as { checkIn: string; checkOut: string };
    const today = new Date().toISOString().slice(0, 10);
    if (value.checkIn < today)
      ctx.addIssue({
        code: 'custom',
        message: 'Check-in cannot be in the past.',
        path: ['checkIn'],
      });
    const nights = (Date.parse(value.checkOut) - Date.parse(value.checkIn)) / 86400000;
    if (!(nights >= 1 && nights <= 30))
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a stay between 1 and 30 nights.',
        path: ['checkOut'],
      });
    if (Date.parse(value.checkIn) > Date.now() + 365 * 86400000)
      ctx.addIssue({
        code: 'custom',
        message: 'Choose a check-in within the next year.',
        path: ['checkIn'],
      });
  });
}
export const staySchema = validStay(z.object(stayFields));
export const bookingSchema = validStay(
  z
    .object({
      ...stayFields,
      hotelId: z.string().max(80),
      roomId: z.string().max(80),
      firstName: z.string().trim().min(1).max(80),
      lastName: z.string().trim().min(1).max(80),
      email: z
        .email()
        .max(254)
        .transform((v) => v.toLowerCase()),
      idempotencyKey: z.uuid(),
    })
    .strict(),
);
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success)
    throw new BadRequestException(result.error.issues[0]?.message ?? 'Check your details.');
  return result.data;
}
