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
