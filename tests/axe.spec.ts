import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// reading for more information on accessibility testing
// https://playwright.dev/docs/accessibility-testing
// https://www.aditus.io/aria/aria-label/
// https://www.lambdatest.com/blog/screen-reader-accessibility-testing/

const host = 'http://localhost';
const port = ':8080';

test.describe('home page', () => {
	const url = ''.concat(host, port, '/');
	test('axe-test', async ({ page }) => {
		await page.goto(url);
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect(accessibilityScanResults.violations).toEqual([]);
	});
});

test.describe('home page no gl', () => {
	const url = ''.concat(host, port, '/?nogl=true');
	test('axe-test', async ({ page }) => {
		await page.goto(url);
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect(accessibilityScanResults.violations).toEqual([]);
	});
});

test.describe('contact page', () => {
	const url = ''.concat(host, port, '/contact');
	test('axe-test', async ({ page }) => {
		await page.goto(url);
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect(accessibilityScanResults.violations).toEqual([]);
	});
});

const url = ''.concat(host, port, '/studies/');
for (const study of ['gavink', 'gridt', 'rpst']) {
	const studylink = url.concat(study);

	test.describe('insight page '.concat(study), () => {
		test('axe-test', async ({ page }) => {
			await page.goto(studylink);
			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
			expect(accessibilityScanResults.violations).toEqual([]);
		});
	});
}

test.describe('404 page', () => {
	const url = ''.concat(host, port, '/404');
	test('axe-test', async ({ page }) => {
		await page.goto(url);
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		expect(accessibilityScanResults.violations).toEqual([]);
	});
});
