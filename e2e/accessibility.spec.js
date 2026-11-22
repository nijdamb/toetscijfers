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
  await expect(page.getByRole('cell', { name: '5,5', exact: true })).toHaveCSS(
    'color',
    'rgb(0, 0, 0)',
  );
  await expect(page.getByRole('cell', { name: '5,4', exact: true })).toHaveCSS(
    'color',
    'rgb(179, 34, 53)',
  );
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
