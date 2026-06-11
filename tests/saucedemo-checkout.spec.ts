// spec: specs/saucedemo-checkout.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Saucedemo Purchase Flow', () => {
  test('Complete checkout from login through order confirmation', async ({ page }) => {
    // 1. Navigate to https://www.saucedemo.com/
    await page.goto('https://www.saucedemo.com/');
    await expect(page).toHaveTitle(/Swag Labs/);
    const usernameInput = page.locator('input[name="user-name"]');
    const passwordInput = page.locator('input[name="password"]');
    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // 2. Enter username standard_user and password secret_sauce
    await usernameInput.fill('standard_user');
    await passwordInput.fill('secret_sauce');
    await expect(usernameInput).toHaveValue('standard_user');
    await expect(passwordInput).toHaveValue('secret_sauce');

    // 3. Click the login button
    await page.locator('input[name="login-button"]').click();
    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page.locator('.inventory_list')).toBeVisible();

    // 4. Click the product "Sauce Labs Backpack" to open its detail page
    await page.locator('text=Sauce Labs Backpack').click();
    await expect(page).toHaveURL(/\/inventory-item\.html/);
    await expect(page.locator('.inventory_details_name')).toContainText('Sauce Labs Backpack');
    await expect(page.locator('.inventory_details_desc')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toBeVisible();

    // 5. Click Add to cart
    await page.locator('button:has-text("Add to cart")').click();
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');

    // 6. Open the shopping cart
    await page.locator('a.shopping_cart_link').click();
    await expect(page).toHaveURL(/\/cart\.html/);
    await expect(page.getByText('Your Cart')).toBeVisible();
    await expect(page.locator('.cart_item')).toContainText('Sauce Labs Backpack');

    // 7. Click Checkout
    await page.locator('button:has-text("Checkout")').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html/);
    await expect(page.getByText('Checkout: Your Information')).toBeVisible();

    // 8. Enter first name John, last name Doe, and postal code 12345
    const firstNameInput = page.locator('input#first-name');
    const lastNameInput = page.locator('input#last-name');
    const postalCodeInput = page.locator('input#postal-code');
    await firstNameInput.fill('John');
    await lastNameInput.fill('Doe');
    await postalCodeInput.fill('12345');
    await expect(firstNameInput).toHaveValue('John');
    await expect(lastNameInput).toHaveValue('Doe');
    await expect(postalCodeInput).toHaveValue('12345');

    // 9. Click Continue
    await page.locator('input#continue').click();
    await expect(page).toHaveURL(/\/checkout-step-two\.html/);
    await expect(page.getByText('Payment Information:')).toBeVisible();
    await expect(page.getByText('Shipping Information:')).toBeVisible();
    await expect(page.getByText(/Item total:/)).toBeVisible();
    await expect(page.getByText(/Total:/)).toBeVisible();

    // 10. Click Finish
    await page.locator('button#finish').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html/);
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(page.getByText('Your order has been dispatched, and will arrive just as fast as the pony can get there!')).toBeVisible();
  });
});
