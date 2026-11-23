import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function checkAccessibility(page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
    .analyze();
  expect(violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test('grades are readable and fields are reachable by keyboard', async ({ page }) => {
  await page.goto('/');
  await checkAccessibility(page);
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Maximum aantal punten')).toBeFocused();
  await page.getByLabel('Maximum aantal punten').fill('100');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Percentage voor een 6,0')).toBeFocused();
  await page.getByLabel('Percentage voor een 6,0').fill('80');
  const passing = page
    .getByRole('row', { name: '77,5 22,5 5,5', exact: true })
    .getByRole('cell', { name: '5,5', exact: true });
  await expect(passing).toHaveCSS('color', 'rgb(0, 0, 0)');
  const failing = page
    .getByRole('row', { name: '77 23 5,4', exact: true })
    .getByRole('cell', { name: '5,4', exact: true });
  await expect(failing).toHaveCSS('color', 'rgb(179, 34, 53)');
  const widths = await page
    .locator('thead th')
    .evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().width));
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(2);
  const aligns = await page
    .locator('thead th')
    .evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).textAlign));
  expect(aligns).toEqual(['center', 'center', 'center']);
  await expect(page.locator('tbody td').first()).toHaveCSS('font-weight', '700');
  await checkAccessibility(page);
});

test('invalid inputs describe the error and recover when corrected', async ({ page }) => {
  await page.goto('/');
  for (const [label, invalid, valid] of [
    ['Maximum aantal punten', '0', '50'],
    ['Percentage voor een 6,0', '100', '70'],
  ]) {
    const input = page.getByLabel(label);
    await input.fill(invalid);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(await page.getByRole('alert').innerText());
    await checkAccessibility(page);
    await input.fill(valid);
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('rowheader', { name: '50', exact: true })).toBeVisible();
  }
});

test('changing the table page moves keyboard focus to the results', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Maximum aantal punten').fill('100');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const chartToggle = page.getByRole('button', { name: 'Toon grafiek' });
  if (await chartToggle.isVisible()) {
    await expect(chartToggle).toBeFocused();
    await page.keyboard.press('Tab');
  }
  const next = page.getByRole('button', { name: 'Volgende' });
  await expect(next).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Punten en cijfers' })).toBeFocused();
  await expect(page.getByRole('rowheader', { name: '0', exact: true })).toBeVisible();
  await checkAccessibility(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Vorige' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('rowheader', { name: '100', exact: true })).toBeVisible();
});

test('mistakes count up in half points and long scores fit their cells', async ({ page }) => {
  await page.goto('/');
  const maximum = page.getByLabel('Maximum aantal punten');
  await maximum.fill('25.5');
  const rows = page.locator('tbody tr');
  await expect(page.getByRole('columnheader')).toHaveText(['Punten', 'Fouten', 'Cijfer']);
  await expect(rows.first().getByRole('cell').first()).toHaveText('0');
  await expect(rows.nth(1).getByRole('cell').first()).toHaveText('0,5');
  await expect(rows.last().getByRole('cell').first()).toHaveText('25,5');

  const table = page.getByRole('table');
  const width = (await table.boundingBox()).width;
  await maximum.fill('9007199254.5');
  const points = rows.first().getByRole('rowheader');
  await expect(points).toHaveText('9.007.199.254,5');
  expect((await table.boundingBox()).width).toBeCloseTo(width, 0);
  const fits = await points.evaluate((cell) => {
    const range = document.createRange();
    range.selectNodeContents(cell);
    const text = range.getBoundingClientRect();
    const bounds = cell.getBoundingClientRect();
    return text.left >= bounds.left && text.right <= bounds.right;
  });
  expect(fits).toBe(true);
});
