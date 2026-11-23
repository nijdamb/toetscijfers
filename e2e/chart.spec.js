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
  expect(points).toBe('30,273 167.5,273 280,30');
  await expect(chart.locator('#chart-norm text')).toHaveText('80 punten · 80%');
  await expect(chart.locator('#chart-norm circle')).toHaveAttribute('cx', '230');
  const floor = chart.locator('#chart-minimum circle');
  const floorLabel = chart.locator('#chart-minimum text');
  await expect(floor).toHaveAttribute('cx', '167.5');
  await expect(floor).toHaveAttribute('cy', '273');
  await expect(floorLabel).toHaveText('55 punten');
  await expect(chart).toHaveAccessibleName(/Laagste cijfer: 1,0 bij 55 punten/);
  const ticks = chart.locator('.chart-ticks text');
  await expect(ticks).toHaveText('10 9 8 7 6 5 4 3 2 1 0'.split(' '));
  const chartWidth = (await chart.boundingBox()).width;
  const expectedFontSize = 14 * Math.min(1, chartWidth / 300);
  const renderedFontSize = () =>
    ticks
      .first()
      .evaluate((tick) => parseFloat(getComputedStyle(tick).fontSize) * tick.getScreenCTM().a);
  await expect.poll(renderedFontSize).toBeCloseTo(expectedFontSize, 1);
  const boxes = await ticks.evaluateAll((labels) =>
    labels.map((label) => label.getBoundingClientRect().toJSON()),
  );
  for (let i = 1; i < boxes.length; i++) {
    expect(boxes[i].top - boxes[i - 1].bottom).toBeGreaterThan(4);
  }
  await page.getByRole('button', { name: 'Volgende' }).click();
  await expect(line).toHaveAttribute('points', points);
  const norm = page.getByLabel('Percentage voor een 6,0');
  await norm.fill('50');
  await expect(line).toHaveAttribute('points', '30,246 280,30');

  await expect(floor).toHaveAttribute('cx', '30');
  await expect(floor).toHaveAttribute('cy', '246');
  await expect(floorLabel).toHaveText('0 punten');
  await expect(chart).toHaveAccessibleName(/Laagste cijfer: 2,0 bij 0 punten/);

  const panel = page.locator('.chart-panel');
  const panelHeight = await panel.evaluate((el) => el.offsetHeight);
  for (const invalid of ['', '100']) {
    await norm.fill(invalid);
    await expect(panel).toBeVisible();
    await expect(page.locator('#grade-chart')).toHaveCSS('visibility', 'hidden');
    expect(await panel.evaluate((el) => el.offsetHeight)).toBe(panelHeight);
  }
  await norm.fill('80');
  await expect(chart).toBeVisible();
  await maximum.fill('0');
  await expect(chart).toBeHidden();
  await maximum.fill('0.5');
  await expect(chart).toHaveAccessibleName(/0,5 punten/);
  await expect(chart.locator('#chart-norm text')).toHaveText('0,4 punten · 80%');
  await expect(floorLabel).toHaveText('0,275 punten');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
  if (testInfo.project.name === 'narrow') {
    await page.getByRole('button', { name: 'Verberg grafiek' }).click();
    await expect(chart).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    const closedHeight = await panel.evaluate((el) => el.offsetHeight);
    await norm.fill('');
    await expect(toggle).toBeVisible();
    expect(await panel.evaluate((el) => el.offsetHeight)).toBe(closedHeight);
  }
});
