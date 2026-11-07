import { test, expect } from '@playwright/test';
test('gallery to hotel booking, reload, cancellation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore hotel demo' }).click();
  await expect(page.getByRole('heading', { name: 'Somewhere you’d rather be.' })).toBeVisible();
  await page.getByRole('button', { name: 'Find my stay' }).click();
  await page.getByRole('link', { name: 'Discover The Tide House' }).click();
  await page.getByRole('button', { name: 'Reserve Garden terrace' }).click();
  await page.getByLabel('First name').fill('Taylor');
  await page.getByLabel('Last name').fill('Guest');
  await page.getByLabel('Email address').fill('taylor@example.com');
  await page.getByLabel('I understand this is a demo booking').check();
  await page.getByRole('button', { name: 'Confirm demo booking' }).click();
  await expect(page.getByRole('heading', { name: 'Your slower days are booked.' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Taylor Guest')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel reservation' }).click();
  await page.getByRole('button', { name: 'Yes, cancel booking' }).click();
  await expect(page.getByText('Booking cancelled', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Booking cancelled', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your slower days are booked.' })).toHaveCount(0);
});
test('search filters and mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/stays');
  await page.getByLabel('Destination').selectOption('Bangkok');
  await page.getByRole('button', { name: 'Find my stay' }).click();
  await expect(page.getByRole('link', { name: 'Discover River Lane' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Discover The Tide House' })).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});
test('reset keeps search inputs consistent with results', async ({ page }) => {
  await page.goto('/stays');
  await page.getByLabel('Destination').selectOption('Phuket');
  await page.getByLabel('Guests', { exact: true }).selectOption('4');
  await page.getByRole('button', { name: 'Find my stay' }).click();
  await page.getByRole('button', { name: 'Nature retreat', exact: true }).click();
  await page.getByRole('button', { name: 'Show all stays' }).click();
  await expect(page.getByLabel('Destination')).toHaveValue('');
  await expect(page.getByLabel('Guests', { exact: true })).toHaveValue('2');
});

test('ticket demo selects an event, updates quantity, and issues a ticket', async ({ page }) => {
  await page.goto('/tickets');
  await page.getByRole('button', { name: /Coastline Sounds/ }).click();
  await page.getByLabel('Tickets').selectOption('2');
  await expect(page.getByText('฿2,500')).toBeVisible();
  await page.getByRole('button', { name: /Pay & get tickets/ }).click();
  await expect(page.getByRole('heading', { name: 'Your night starts here.' })).toBeVisible();
  await expect(page.getByText('2 tickets · ฿2,500')).toBeVisible();
});

test('massage demo books the selected treatment and appointment', async ({ page }) => {
  await page.goto('/massage');
  await page.getByRole('button', { name: 'Choose' }).nth(1).click();
  await page.getByLabel('Available times').selectOption('4:00 PM');
  await page.getByRole('button', { name: /Reserve my time/ }).click();
  await expect(page.getByRole('heading', { name: 'We saved you a little space.' })).toBeVisible();
  await expect(page.getByText('Deep Ease · Today, 2 Nov at 4:00 PM')).toBeVisible();
});

test('delivery demo requires an address and confirms the basket', async ({ page }) => {
  await page.goto('/delivery');
  await page.getByRole('button', { name: 'Add Crispy pork rice bowl' }).click();
  await expect(page.getByRole('button', { name: /Place demo order/ })).toBeDisabled();
  await page.getByPlaceholder('Street, building, room').fill('12 Sukhumvit Road');
  await page.getByRole('button', { name: /Place demo order/ }).click();
  await expect(page.getByRole('heading', { name: 'Good things are on the way.' })).toBeVisible();
  await expect(page.getByText(/headed to 12 Sukhumvit Road/)).toBeVisible();
  await expect(page.getByText('฿185 · Demo only')).toBeVisible();
});

test('shop demo updates cart quantity and completes checkout', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('button', { name: 'Add Everyday stoneware' }).click();
  await page.getByRole('button', { name: 'Add Everyday stoneware' }).click();
  await expect(page.getByText('฿1,780')).toBeVisible();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByRole('heading', { name: 'A lovely choice.' })).toBeVisible();
  await expect(page.getByText('฿1,780 · Demo only')).toBeVisible();
});

test('ERP demo searches orders and marks an order complete', async ({ page }) => {
  await page.goto('/erp');
  await page.getByPlaceholder('Search orders').fill('Mali House');
  await expect(page.getByText('AV-2048')).toBeVisible();
  await expect(page.getByText('AV-2047')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mark AV-2048 complete' }).click();
  await expect(page.getByText('AV-2048 marked complete.')).toBeVisible();
  await expect(page.locator('.erp-status.complete')).toHaveText('Complete');
});

/* ------------------------------------------------------------------ */
/* Shared helpers                                                       */
/* ------------------------------------------------------------------ */

const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

async function createBooking(
  request: import('@playwright/test').APIRequestContext,
  extra: Record<string, unknown> = {},
) {
  const response = await request.post('/api/bookings', {
    data: {
      hotelId: 'river-lane',
      roomId: 'river-studio',
      checkIn: day(200),
      checkOut: day(202),
      guests: 2,
      firstName: 'Robin',
      lastName: 'Lookup',
      email: 'robin@example.com',
      idempotencyKey: crypto.randomUUID(),
      ...extra,
    },
  });
  expect(response.status()).toBe(201);
  return (await response.json()) as { id: string; token: string; total: number };
}

async function cancelBooking(
  request: import('@playwright/test').APIRequestContext,
  booking: { id: string; token: string },
) {
  await request.delete(`/api/bookings/${booking.id}`, {
    headers: { Authorization: `Bearer ${booking.token}` },
  });
}

const activeSlide = (page: import('@playwright/test').Page) =>
  page.locator('.showcase-thumb[aria-current="true"]');

/* ------------------------------------------------------------------ */
/* Landing page                                                         */
/* ------------------------------------------------------------------ */

test.describe('landing page', () => {
  test('nav and hero anchors scroll to their sections', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /Projects/ })
      .click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator('#projects')).toBeInViewport();
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /Contact/ })
      .click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact')).toBeInViewport();
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: /Approach/ })
      .click();
    await expect(page.locator('#about')).toBeInViewport();
    await page
      .getByRole('link', { name: /See our work/ })
      .first()
      .click();
    await expect(page).toHaveURL(/#projects$/);
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'ลองใช้งานเดโม' })
      .click();
    await expect(page).toHaveURL(/\/stays$/);
  });

  test('the hotel demo CTA is the only link named "Explore hotel demo"', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'Explore hotel demo' });
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute('href', '/stays');
  });

  test('carousel exposes six labelled slides and moves with prev/next', async ({ page }) => {
    await page.goto('/');
    const carousel = page.getByRole('region', { name: /Live demos/ });
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    const slides = carousel.locator('[aria-roledescription="slide"]');
    await expect(slides).toHaveCount(6);
    const names = [
      'Serein',
      'Goodtime',
      'Still House',
      'Good Neighbor',
      'Sunday Goods',
      'Sunday Goods ERP',
    ];
    for (const [index, name] of names.entries())
      await expect(slides.nth(index)).toHaveAttribute('aria-label', `${index + 1} of 6: ${name}`);
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 1 of 6: Serein');
    await page.getByRole('button', { name: 'Next project' }).click();
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 2 of 6: Goodtime');
    await expect
      .poll(() =>
        page
          .locator('.showcase-track')
          .evaluate((track) => Math.round(track.scrollLeft / track.clientWidth)),
      )
      .toBe(1);
    await page.getByRole('button', { name: 'Previous project' }).click();
    await page.getByRole('button', { name: 'Previous project' }).click();
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 6 of 6: Sunday Goods ERP');
    await page.getByRole('button', { name: 'Next project' }).click();
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 1 of 6: Serein');
  });

  test('carousel thumbnails and keyboard select slides; hidden slides are inert', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Show slide 4 of 6: Good Neighbor' }).click();
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 4 of 6: Good Neighbor');
    await expect(page.getByRole('group', { name: '1 of 6: Serein' })).toHaveAttribute('inert', '');
    await page.keyboard.press('ArrowRight');
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 5 of 6: Sunday Goods');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 3 of 6: Still House');
    await page.keyboard.press('End');
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 6 of 6: Sunday Goods ERP');
    await page.keyboard.press('Home');
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 1 of 6: Serein');
  });

  test('carousel autoplays, pauses on hover and from the pause button', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await page.mouse.move(0, 0);
    await expect(page.getByRole('button', { name: 'Pause autoplay' })).toBeVisible();
    await page.clock.runFor(6500);
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 2 of 6: Goodtime');
    await page.getByRole('group', { name: '2 of 6: Goodtime' }).hover();
    await page.clock.runFor(13000);
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 2 of 6: Goodtime');
    await page.getByRole('button', { name: 'Pause autoplay' }).click();
    await page.mouse.move(0, 0);
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.clock.runFor(13000);
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 2 of 6: Goodtime');
    await expect(page.getByRole('button', { name: 'Start autoplay' })).toBeVisible();
  });

  test('carousel does not autoplay when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Start autoplay' })).toBeVisible();
    await page.clock.runFor(13000);
    await expect(activeSlide(page)).toHaveAccessibleName('Show slide 1 of 6: Serein');
  });

  for (const [index, cta, path] of [
    [1, /Explore hotel demo/, '/stays'],
    [2, /Explore events/, '/tickets'],
    [3, /Book a treatment/, '/massage'],
    [4, /Browse local food/, '/delivery'],
    [5, /Explore the shop/, '/shop'],
    [6, /Open workspace/, '/erp'],
  ] as const) {
    test(`slide ${index} CTA opens ${path}`, async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: new RegExp(`^Show slide ${index} of 6`) }).click();
      await page.getByRole('link', { name: cta }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('region', { name: 'Avengee demo' })).toBeVisible();
    });
  }

  test('Fastwork contact links open the hire page in a new tab', async ({ page }) => {
    await page.goto('/');
    const fastwork = 'https://fastwork.co/user/avengee.team/web-development-12722725';
    for (const link of [
      page.getByRole('link', { name: /Hire us on Fastwork/ }),
      page.getByRole('navigation', { name: 'Studio' }).getByRole('link', { name: 'Fastwork' }),
    ]) {
      await expect(link).toHaveAttribute('href', fastwork);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('footer lists every demo', async ({ page }) => {
    await page.goto('/');
    const work = page.getByRole('navigation', { name: 'Work' }).getByRole('link');
    await expect(work).toHaveCount(6);
    const hrefs = await work.evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual(['/stays', '/tickets', '/massage', '/delivery', '/shop', '/erp']);
  });
});

test('demo bar chains through all six demos and links back to the gallery', async ({ page }) => {
  await page.goto('/stays');
  for (const [name, path] of [
    ['Goodtime', '/tickets'],
    ['Still House', '/massage'],
    ['Good Neighbor', '/delivery'],
    ['Sunday Goods', '/shop'],
    ['Sunday Goods ERP', '/erp'],
    ['Serein', '/stays'],
  ]) {
    await page.getByRole('link', { name: `Next demo: ${name}` }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  await page
    .getByRole('region', { name: 'Avengee demo' })
    .getByRole('link', { name: /ดูผลงานทั้งหมด/ })
    .click();
  await expect(page).toHaveURL(/\/#projects$/);
  await page.goto('/erp');
  await page.getByRole('link', { name: 'Avengee home' }).first().click();
  await expect(page).toHaveURL(/\/$/);
});

/* ------------------------------------------------------------------ */
/* Serein: hotel booking                                                */
/* ------------------------------------------------------------------ */

test.describe('Serein', () => {
  const count = (page: import('@playwright/test').Page) => page.locator('.results-meta strong');

  test('category tabs filter the collection', async ({ page }) => {
    await page.goto('/stays');
    await expect(count(page)).toHaveText('6 considered stays');
    await page.getByRole('button', { name: 'Beachfront', exact: true }).click();
    await expect(count(page)).toHaveText('2 considered stays');
    await expect(page.getByRole('link', { name: 'Discover The Tide House' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Discover Limestone Cove' })).toBeVisible();
    await page.getByRole('button', { name: 'City hideaway', exact: true }).click();
    await expect(count(page)).toHaveText('1 considered stays');
    await page.getByRole('button', { name: 'All stays', exact: true }).click();
    await expect(count(page)).toHaveText('6 considered stays');
  });

  test('pool and price filters narrow results, empty state resets everything', async ({ page }) => {
    await page.goto('/stays');
    const filters = page.getByRole('button', { name: 'Filters', exact: true });
    await filters.click();
    await expect(filters).toHaveAttribute('aria-expanded', 'true');
    await page.getByLabel('Swimming pool').check();
    await expect(count(page)).toHaveText('4 considered stays');
    await expect(page.getByRole('link', { name: 'Discover The Slow House' })).toHaveCount(0);
    await page.getByRole('button', { name: /Reset filters/ }).click();
    await expect(count(page)).toHaveText('6 considered stays');
    await page.getByLabel('Maximum price per night').fill('2400');
    await expect(count(page)).toHaveText('1 considered stays');
    await expect(page.getByRole('link', { name: 'Discover The Slow House' })).toBeVisible();
    await page.getByLabel('Swimming pool').check();
    await expect(page.getByRole('heading', { name: 'A different kind of escape?' })).toBeVisible();
    await page.getByRole('button', { name: 'Show all stays' }).click();
    await expect(count(page)).toHaveText('6 considered stays');
  });

  test('sorting by price and rating reorders the cards', async ({ page }) => {
    await page.goto('/stays');
    await page.getByLabel('Sort stays').selectOption('price');
    const names = page.locator('.hotel-card h3');
    await expect(names.first()).toHaveText('The Slow House');
    await expect(names).toHaveText([
      'The Slow House',
      'River Lane',
      'Banyan Retreat',
      'The Tide House',
      'Limestone Cove',
      'Baan Samui',
    ]);
    await page.getByLabel('Sort stays').selectOption('rating');
    const ratings = (await page.locator('.hotel-card .rating').allTextContents()).map(Number);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  test('search rejects stays longer than 30 nights', async ({ page }) => {
    await page.goto('/stays');
    await page.getByLabel('Check-in').fill(day(10));
    await page.getByLabel('Check-out').fill(day(41));
    await page.getByRole('button', { name: 'Find my stay' }).click();
    await expect(page.locator('.form-error')).toHaveText('Choose a stay between 1 and 30 nights.');
  });

  test('hotel detail shows live availability and respects party size', async ({ page }) => {
    await page.goto(`/stays/the-tide?checkIn=${day(250)}&checkOut=${day(253)}&guests=2`);
    await expect(page.getByRole('heading', { level: 1, name: 'The Tide House' })).toBeVisible();
    await expect(page.locator('.room-card:not(.is-skeleton)')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Reserve Garden terrace' })).toBeEnabled();
    await expect(page.getByText('THB 13,860 for 3 nights').first()).toBeVisible();
    await page.getByLabel('Guests', { exact: true }).selectOption('4');
    await page.getByRole('button', { name: 'Update search' }).click();
    await expect(page).toHaveURL(/guests=4/);
    await expect(page.getByRole('button', { name: 'Reserve Garden terrace' })).toHaveCount(0);
    await expect(page.getByText('Choose a room for more guests').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reserve Family sea-view suite' })).toBeEnabled();
    await page.getByRole('link', { name: 'All stays' }).click();
    await expect(page).toHaveURL(/\/stays\?/);
  });

  test('sold-out rooms cannot be reserved', async ({ page, request }) => {
    const stay = {
      hotelId: 'the-tide',
      roomId: 'tide-pool',
      checkIn: day(260),
      checkOut: day(262),
    };
    const booking = await createBooking(request, stay);
    try {
      await page.goto(`/stays/the-tide?checkIn=${stay.checkIn}&checkOut=${stay.checkOut}&guests=2`);
      await expect(page.getByRole('button', { name: 'Reserve Garden terrace' })).toBeEnabled();
      await expect(page.getByRole('button', { name: 'Reserve Private pool suite' })).toHaveCount(0);
      await expect(page.getByText('Try different dates')).toBeVisible();
    } finally {
      await cancelBooking(request, booking);
    }
  });

  test('unknown stays and incomplete checkout links are handled', async ({ page }) => {
    const response = await page.goto('/stays/not-a-hotel');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'We couldn’t find that page.' })).toBeVisible();
    await page.goto('/stays/checkout?hotelId=the-tide&roomId=tide-garden');
    await expect(page.getByRole('heading', { name: 'Let’s find your room first.' })).toBeVisible();
    await page.goto(
      `/stays/checkout?hotelId=the-tide&roomId=tide-garden&checkIn=${day(10)}&checkOut=${day(12)}&guests=3`,
    );
    await expect(page.getByRole('heading', { name: 'Let’s find your room first.' })).toBeVisible();
  });

  test('checkout validates required details before booking', async ({ page }) => {
    await page.goto(
      `/stays/checkout?hotelId=the-tide&roomId=tide-garden&checkIn=${day(270)}&checkOut=${day(273)}&guests=2`,
    );
    await expect(page.locator('.price-breakdown .total')).toContainText('THB 13,860');
    const confirm = page.getByRole('button', { name: 'Confirm demo booking' });
    await confirm.click();
    await expect(page).toHaveURL(/\/stays\/checkout/);
    const valid = (label: string) =>
      page.getByLabel(label).evaluate((input: HTMLInputElement) => input.validity.valid);
    expect(await valid('First name')).toBe(false);
    await page.getByLabel('First name').fill('Sam');
    await page.getByLabel('Last name').fill('Check');
    await page.getByLabel('Email address').fill('not-an-email');
    await confirm.click();
    expect(await valid('Email address')).toBe(false);
    await page.getByLabel('Email address').fill('sam@example.com');
    await confirm.click();
    expect(await valid('I understand this is a demo booking')).toBe(false);
    await expect(page).toHaveURL(/\/stays\/checkout/);
  });

  test('checkout shows the server error for an invalid stay', async ({ page }) => {
    await page.goto(
      `/stays/checkout?hotelId=the-tide&roomId=tide-garden&checkIn=${day(280)}&checkOut=${day(311)}&guests=2`,
    );
    await page.getByLabel('First name').fill('Sam');
    await page.getByLabel('Last name').fill('Long');
    await page.getByLabel('Email address').fill('sam@example.com');
    await page.getByLabel('I understand this is a demo booking').check();
    await page.getByRole('button', { name: 'Confirm demo booking' }).click();
    await expect(page.locator('.form-error')).toHaveText('Choose a stay between 1 and 30 nights.');
  });

  test('bookings page starts empty and finds a booking by reference and code', async ({
    page,
    request,
  }) => {
    const booking = await createBooking(request);
    try {
      await page.goto('/stays/bookings');
      await expect(
        page.getByRole('heading', { name: 'Your next escape is waiting.' }),
      ).toBeVisible();
      await page.getByText('Find a booking with your reference and access code').click();
      await page.getByLabel('Booking reference').fill(booking.id);
      await page.getByLabel('Private access code').fill('wrong-code');
      await page.getByRole('button', { name: 'Find booking' }).click();
      await expect(page.locator('.error-panel')).toContainText('Booking not found');
      await page.getByLabel('Private access code').fill(booking.token);
      await page.getByRole('button', { name: 'Find booking' }).click();
      await expect(page.getByText('Robin Lookup')).toBeVisible();
      await page.reload();
      await expect(page.getByText('Robin Lookup')).toBeVisible();
    } finally {
      await cancelBooking(request, booking);
    }
  });

  test('a private link opens the booking; cancelling can be backed out of', async ({
    page,
    request,
  }) => {
    const booking = await createBooking(request, { firstName: 'Kai', lastName: 'Linkholder' });
    await page.goto(`/stays/bookings?id=${booking.id}#token=${booking.token}`);
    await expect(page.getByText('Kai Linkholder')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Good things to look forward to.' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();
    await page.getByRole('button', { name: 'Keep my stay' }).click();
    await expect(page.getByRole('group', { name: 'Confirm cancellation' })).toHaveCount(0);
    await expect(page.getByText('Confirmed', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel reservation' }).click();
    await page.getByRole('button', { name: 'Yes, cancel booking' }).click();
    await expect(page.getByText('Booking cancelled', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel reservation' })).toHaveCount(0);
  });
});

/* ------------------------------------------------------------------ */
/* Goodtime: ticketing                                                  */
/* ------------------------------------------------------------------ */

test.describe('Goodtime tickets', () => {
  test('quantity runs from 1 to 4 and resets when the event changes', async ({ page }) => {
    await page.goto('/tickets');
    const quantity = page.getByLabel('Tickets');
    await expect(quantity.locator('option')).toHaveText([
      '1 ticket',
      '2 tickets',
      '3 tickets',
      '4 tickets',
    ]);
    await expect(page.getByRole('button', { name: /Afterglow Night Market/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await quantity.selectOption('4');
    await expect(page.locator('.ticket-total strong')).toHaveText('฿3,560');
    await page.getByRole('button', { name: /Slow Sunday Sessions/ }).click();
    await expect(page.getByRole('button', { name: /Slow Sunday Sessions/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(quantity).toHaveValue('1');
    await expect(page.locator('.ticket-total strong')).toHaveText('฿490');
    await expect(
      page.getByRole('heading', { level: 2, name: 'Slow Sunday Sessions' }),
    ).toBeVisible();
  });

  test('issued ticket can be printed and the flow restarted', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { printed: number }).printed = 0;
      window.print = () => {
        (window as unknown as { printed: number }).printed += 1;
      };
    });
    await page.goto('/tickets');
    await page.getByLabel('Tickets').selectOption('3');
    await page.getByRole('button', { name: /Pay & get tickets/ }).click();
    await expect(page.getByText('3 tickets · ฿2,670')).toBeVisible();
    await expect(page.getByText('DEMO-NIGHT-MARKET-2026')).toBeVisible();
    await page.getByRole('button', { name: /Print your ticket/ }).click();
    expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);
    await page.getByRole('button', { name: 'Back to events' }).click();
    await expect(page.getByRole('heading', { name: 'Good things happening' })).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/* Still House: massage booking                                         */
/* ------------------------------------------------------------------ */

test.describe('Still House', () => {
  test('nothing is preselected and reserving needs a treatment', async ({ page }) => {
    await page.goto('/massage');
    await expect(page.getByRole('button', { name: 'Choose' })).toHaveCount(3);
    await expect(page.getByRole('button', { name: /Reserve my time/ })).toBeDisabled();
    await expect(page.getByText('Pick a treatment above')).toBeVisible();
    await page.getByRole('button', { name: 'Choose' }).first().click();
    const selected = page.getByRole('button', { name: 'Selected' });
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.booking-total')).toContainText('The Unwind · 1 guest');
    await expect(page.locator('.booking-total strong')).toHaveText('฿1,200');
    await page.getByLabel('Date').selectOption('Tomorrow, 3 Nov');
    await page.getByRole('button', { name: /Reserve my time/ }).click();
    await expect(page.getByText('The Unwind · Tomorrow, 3 Nov at 2:30 PM')).toBeVisible();
    await expect(page.getByText('฿1,200 · Demo only')).toBeVisible();
    await page.getByRole('button', { name: 'Back to treatments' }).click();
    await expect(page.getByRole('heading', { name: 'Treatments' })).toBeVisible();
  });

  test('search filters treatments and offers a way out of no results', async ({ page }) => {
    await page.goto('/massage');
    const search = page.getByLabel('Search treatments');
    await search.fill('herbal');
    await expect(page.locator('.other-item h3')).toHaveText(['Herbal Compress']);
    await search.fill('zzz');
    await expect(page.getByText('Nothing matches “zzz”')).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(search).toHaveValue('');
    await expect(page.locator('.other-item')).toHaveCount(3);
  });
});

/* ------------------------------------------------------------------ */
/* Good Neighbor: delivery                                              */
/* ------------------------------------------------------------------ */

test.describe('Good Neighbor', () => {
  test('search, empty state and clear', async ({ page }) => {
    await page.goto('/delivery');
    const search = page.getByLabel('Search dishes or places');
    await search.fill('daybreak');
    await expect(page.locator('.other-item h3')).toHaveText([
      'Miso mushroom toast',
      'Iced pandan latte',
    ]);
    await search.fill('pizza');
    await expect(page.getByText('Nothing matches “pizza”')).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(page.locator('.other-item')).toHaveCount(4);
  });

  test('basket adds and removes items and the address is required', async ({ page }) => {
    await page.goto('/delivery');
    const total = page.locator('.delivery-checkout > strong');
    const order = page.getByRole('button', { name: /Place demo order/ });
    await expect(total).toHaveText('฿0');
    await page.getByRole('button', { name: 'Remove Mango sticky rice' }).click();
    await expect(
      page
        .locator('.other-item', { hasText: 'Mango sticky rice' })
        .locator('.quantity-control span'),
    ).toHaveText('0');
    await page.getByRole('button', { name: 'Add Crispy pork rice bowl' }).click();
    await page.getByRole('button', { name: 'Add Crispy pork rice bowl' }).click();
    await page.getByRole('button', { name: 'Add Iced pandan latte' }).click();
    await expect(total).toHaveText('฿480');
    await page.getByRole('button', { name: 'Remove Crispy pork rice bowl' }).click();
    await expect(total).toHaveText('฿295');
    await page.getByPlaceholder('Street, building, room').fill('   ');
    await expect(order).toBeDisabled();
    await page.getByPlaceholder('Street, building, room').fill('88 Soi Ari');
    await expect(order).toBeEnabled();
    await order.click();
    await expect(page.getByText(/headed to 88 Soi Ari/)).toBeVisible();
    await expect(page.getByText('฿295 · Demo only')).toBeVisible();
    await page.getByRole('button', { name: 'Back to shopping' }).click();
    await expect(page.getByRole('heading', { name: 'Made nearby' })).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/* Sunday Goods: shop                                                   */
/* ------------------------------------------------------------------ */

test('shop bag counts items, totals the cart and gates checkout', async ({ page }) => {
  await page.goto('/shop');
  const checkout = page.getByRole('button', { name: /Checkout/ });
  await expect(checkout).toBeDisabled();
  await expect(page.getByText('Bag · 0')).toBeVisible();
  await page.getByRole('button', { name: 'Add Everyday stoneware' }).click();
  await page.getByRole('button', { name: 'Add Everyday stoneware' }).click();
  await page.getByRole('button', { name: 'Add Sunday market tote' }).click();
  await expect(page.getByText('Bag · 3')).toBeVisible();
  await expect(page.getByText('3 items in your bag')).toBeVisible();
  await expect(page.getByText('฿2,430')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Sunday market tote' }).click();
  await expect(page.getByText('2 items in your bag')).toBeVisible();
  await page.getByLabel('Search products').fill('linen');
  await expect(page.getByRole('img', { name: 'Linen table runner' })).toBeVisible();
  await expect(page.locator('.other-item')).toHaveCount(1);
  await page.getByLabel('Search products').fill('');
  await checkout.click();
  await expect(page.getByRole('heading', { name: 'A lovely choice.' })).toBeVisible();
  await expect(page.getByText('฿1,780 · Demo only')).toBeVisible();
});

/* ------------------------------------------------------------------ */
/* Sunday Goods ERP                                                     */
/* ------------------------------------------------------------------ */

test.describe('Sunday Goods ERP', () => {
  test('search by item, empty state and clear', async ({ page }) => {
    await page.goto('/erp');
    const search = page.getByPlaceholder('Search orders');
    await search.fill('tote');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByText('AV-2046')).toBeVisible();
    await search.fill('nothing here');
    await expect(page.getByText('No orders match your search.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(search).toHaveValue('');
    await expect(page.locator('tbody tr')).toHaveCount(4);
  });

  test('notices can be dismissed and sections switch', async ({ page }) => {
    await page.goto('/erp');
    await page.getByRole('button', { name: 'Mark AV-2047 complete' }).click();
    const notice = page.getByRole('status').filter({ hasText: 'AV-2047 marked complete.' });
    await expect(notice).toBeVisible();
    await expect(
      page.locator('tbody tr', { hasText: 'AV-2047' }).locator('.erp-status'),
    ).toHaveText('Complete');
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(notice).toHaveCount(0);
    await page.getByRole('button', { name: /Export report/ }).click();
    await expect(page.getByText('Your report is ready to export.')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Workspace sections' });
    await nav.getByRole('button', { name: /Orders/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible();
    await expect(nav.getByRole('button', { name: /Orders/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page
      .getByRole('button', { name: /Inventory/ })
      .last()
      .click();
    await expect(page.getByRole('heading', { level: 1, name: 'Inventory' })).toBeVisible();
  });
});

/* ------------------------------------------------------------------ */
/* 404 and mobile layout                                                */
/* ------------------------------------------------------------------ */

test('unknown routes show the bilingual 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'We couldn’t find that page.' })).toBeVisible();
  await expect(page.getByText('ไม่พบหน้าที่คุณกำลังหา')).toBeVisible();
  await page.getByRole('link', { name: 'Back to the gallery' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test.describe('390px layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  for (const path of [
    '/',
    '/stays',
    '/stays/the-tide',
    '/stays/checkout?hotelId=the-tide&roomId=tide-garden&checkIn=' +
      day(300) +
      '&checkOut=' +
      day(302) +
      '&guests=2',
    '/stays/bookings',
    '/tickets',
    '/massage',
    '/delivery',
    '/shop',
    '/erp',
    '/missing-page',
  ]) {
    test(`no horizontal scroll on ${path.split('?')[0]}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);
    });
  }
});
