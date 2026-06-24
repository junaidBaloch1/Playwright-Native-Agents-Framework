# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: saucedemo-checkout.spec.ts >> Saucedemo Purchase Flow >> Complete checkout from login through order confirmation
- Location: tests/ui/saucedemo-checkout.spec.ts:6:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button:has-text("wrong")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - button "Open Menu" [ref=e8] [cursor=pointer]
          - img "Open Menu" [ref=e9]
        - generic [ref=e11]: Swag Labs
        - generic [ref=e14]: "1"
      - generic [ref=e16]: Your Cart
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: QTY
        - generic [ref=e21]: Description
        - generic [ref=e22]:
          - generic [ref=e23]: "1"
          - generic [ref=e24]:
            - link "Sauce Labs Backpack" [ref=e25] [cursor=pointer]:
              - /url: "#"
              - generic [ref=e26]: Sauce Labs Backpack
            - generic [ref=e27]: carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.
            - generic [ref=e28]:
              - generic [ref=e29]: $29.99
              - button "Remove" [ref=e30] [cursor=pointer]
      - generic [ref=e31]:
        - button "Go back Continue Shopping" [ref=e32] [cursor=pointer]:
          - img "Go back" [ref=e33]
          - text: Continue Shopping
        - button "Checkout" [ref=e34] [cursor=pointer]
  - contentinfo [ref=e35]:
    - list [ref=e36]:
      - listitem [ref=e37]:
        - link "Twitter" [ref=e38] [cursor=pointer]:
          - /url: https://twitter.com/saucelabs
      - listitem [ref=e39]:
        - link "Facebook" [ref=e40] [cursor=pointer]:
          - /url: https://www.facebook.com/saucelabs
      - listitem [ref=e41]:
        - link "LinkedIn" [ref=e42] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/sauce-labs/
    - generic [ref=e43]: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  1  | // spec: specs/saucedemo-checkout.plan.md
  2  | // seed: tests/seed.spec.ts
  3  | import { test, expect } from '@playwright/test';
  4  | 
  5  | test.describe('Saucedemo Purchase Flow', () => {
  6  |   test('Complete checkout from login through order confirmation', async ({ page }) => {
  7  |     // 1. Navigate to https://www.saucedemo.com/
  8  |     await page.goto('https://www.saucedemo.com/');
  9  |     await expect(page).toHaveTitle(/Swag Labs/);
  10 |     const usernameInput = page.locator('input[name="user-name"]');
  11 |     const passwordInput = page.locator('input[name="password"]');
  12 |     await expect(usernameInput).toBeVisible();
  13 |     await expect(passwordInput).toBeVisible();
  14 | 
  15 |     // 2. Enter username standard_user and password secret_sauce
  16 |     await usernameInput.fill('standard_user');
  17 |     await passwordInput.fill('secret_sauce');
  18 |     await expect(usernameInput).toHaveValue('standard_user');
  19 |     await expect(passwordInput).toHaveValue('secret_sauce');
  20 | 
  21 |     // 3. Click the login button
  22 |     await page.locator('input[name="login-button"]').click();
  23 |     await expect(page).toHaveURL(/\/inventory\.html/);
  24 |     await expect(page.getByText('Products')).toBeVisible();
  25 |     await expect(page.locator('.inventory_list')).toBeVisible();
  26 | 
  27 |     // 4. Click the product "Sauce Labs Backpack" to open its detail page
  28 |     await page.locator('text=Sauce Labs Backpack').click();
  29 |     await expect(page).toHaveURL(/\/inventory-item\.html/);
  30 |     await expect(page.locator('.inventory_details_name')).toContainText('Sauce Labs Backpack');
  31 |     await expect(page.locator('.inventory_details_desc')).toBeVisible();
  32 |     await expect(page.locator('.inventory_details_price')).toBeVisible();
  33 | 
  34 |     // 5. Click Add to cart
  35 |     await page.locator('button:has-text("Add to cart")').click();
  36 |     const cartBadge = page.locator('.shopping_cart_badge');
  37 |     await expect(cartBadge).toHaveText('1');
  38 | 
  39 |     // 6. Open the shopping cart
  40 |     await page.locator('a.shopping_cart_link').click();
  41 |     await expect(page).toHaveURL(/\/cart\.html/);
  42 |     await expect(page.getByText('Your Cart')).toBeVisible();
  43 |     await expect(page.locator('.cart_item')).toContainText('Sauce Labs Backpack');
  44 | 
  45 |     // 7. Click Checkout
> 46 |     await page.locator('button:has-text("wrong")').click();
     |                                                    ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  47 |     await expect(page).toHaveURL(/\/checkout-step-one\.html/);
  48 |     await expect(page.getByText('Checkout: Your Information')).toBeVisible();
  49 | 
  50 |     // 8. Enter first name John, last name Doe, and postal code 12345
  51 |     const firstNameInput = page.locator('input#first-name');
  52 |     const lastNameInput = page.locator('input#last-name');
  53 |     const postalCodeInput = page.locator('input#postal-code');
  54 |     await firstNameInput.fill('John');
  55 |     await lastNameInput.fill('Doe');
  56 |     await postalCodeInput.fill('12345');
  57 |     await expect(firstNameInput).toHaveValue('John');
  58 |     await expect(lastNameInput).toHaveValue('Doe');
  59 |     await expect(postalCodeInput).toHaveValue('12345');
  60 | 
  61 |     // 9. Click Continue
  62 |     await page.locator('input#continue').click();
  63 |     await expect(page).toHaveURL(/\/checkout-step-two\.html/);
  64 |     await expect(page.getByText('Payment Information:')).toBeVisible();
  65 |     await expect(page.getByText('Shipping Information:')).toBeVisible();
  66 |     await expect(page.getByText(/Item total:/)).toBeVisible();
  67 |     await expect(page.getByText(/Total:/)).toBeVisible();
  68 | 
  69 |     // 10. Click Finish
  70 |     await page.locator('button#finish').click();
  71 |     await expect(page).toHaveURL(/\/checkout-complete\.html/);
  72 |     await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  73 |     await expect(page.getByText('Your order has been dispatched, and will arrive just as fast as the pony can get there!')).toBeVisible();
  74 |   });
  75 | });
  76 | 
```