import { test, expect } from '@playwright/test';

test('home loads', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('AI-Profile-Business-Tool')).toBeVisible();
});