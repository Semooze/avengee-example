import 'reflect-metadata';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Module,
  Param,
  Post,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';
import { hotels } from '@avengee/domain';
import { Database } from './database';
import { Bookings } from './bookings';
import { bookingSchema, parse, staySchema } from './validation';
@Controller('api')
class ApiController {
  constructor(@Inject(Bookings) private readonly bookings: Bookings) {}
  @Get('health') health() {
    return { status: 'ok', mode: 'demo' };
  }
  @Get('hotels') hotels() {
    return hotels;
  }
  @Get('hotels/:id/availability') availability(@Param('id') id: string, @Query() query: unknown) {
    return this.bookings.availability(id, parse(staySchema, query));
  }
  @Post('bookings') create(@Body() body: unknown) {
    return this.bookings.create(parse(bookingSchema, body));
  }
  @Get('bookings/:id') find(@Param('id') id: string, @Headers('authorization') auth = '') {
    return this.bookings.find(id, auth.startsWith('Bearer ') ? auth.slice(7) : '');
  }
  @Delete('bookings/:id') cancel(@Param('id') id: string, @Headers('authorization') auth = '') {
    return this.bookings.cancel(id, auth.startsWith('Bearer ') ? auth.slice(7) : '');
  }
}
@Module({ controllers: [ApiController], providers: [Database, Bookings] })
class ApiModule {}
export async function createApplication() {
  const server = express();
  server.disable('x-powered-by');
  server.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  const app = await NestFactory.create(ApiModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });
  await app.init();
  return app;
}
let application: ReturnType<typeof createApplication> | undefined;
export async function handleRequest(req: Request, res: Response): Promise<void> {
  application ??= createApplication().catch((error) => {
    application = undefined;
    throw error;
  });
  try {
    const app = await application;
    await new Promise<void>((resolve, reject) => {
      res.once('finish', resolve);
      res.once('close', resolve);
      app.getHttpAdapter().getInstance()(req, res, reject);
    });
  } catch (error) {
    console.error(
      'API initialization failed',
      error instanceof Error ? error.message : 'Unknown error',
    );
    if (!res.headersSent)
      res.status(503).json({ message: new ServiceUnavailableException().message });
  }
}
