import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('chart shows the full scale and updates with the table', async ({ page }, testInfo) => {
  await page.goto('/');
  const chart = page.getByRole('img', { name: /Cijfer per behaald percentage/ });
  const toggle = page.getByRole('button', { name: 'Toon grafiek' });
  if (testInfo.project.name === 'narrow') {
    await expect(chart).toBeHidden();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Verberg grafiek' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  } else {
    await expect(toggle).toBeHidden();
  }

  await expect(chart).toBeVisible();
  const maximum = page.getByLabel('Maximum aantal punten');
  await maximum.fill('100');
  await page.getByLabel('Percentage voor een 6,0').fill('80');
  await expect(chart).toHaveAccessibleName(/100 punten.*80%/);
  const line = chart.locator('polyline');
  const points = await line.getAttribute('points');
  expect(points.split(' ')).toEqual(
    expect.arrayContaining(['30,158', '167.5,158', '230,88', '280,32']),
  );
  await page.getByRole('button', { name: 'Volgende' }).click();
  await expect(line).toHaveAttribute('points', points);
  await maximum.fill('0');
  await expect(chart).toBeHidden();
  await maximum.fill('0.5');
  await expect(chart).toHaveAccessibleName(/0,5 punten/);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
  if (testInfo.project.name === 'narrow') {
    await page.getByRole('button', { name: 'Verberg grafiek' }).click();
    await expect(chart).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  }
});
