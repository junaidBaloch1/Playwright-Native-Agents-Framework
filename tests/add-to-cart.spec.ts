// spec: specs/add-to-cart.plan.md
import { test, expect } from '@playwright/test';

const collectionLink = (page) => page.getByRole('link', { name: 'View test products' }).first();
const firstProductTile = (page) => page.locator('a.grid-product__image-link').first();
const addToCartButton = (page) => page.getByRole('button', { name: /Add to Cart/i }).first();
const cartDrawerTitle = (page) => page.locator('.drawer__title').first();
const cartLink = (page) => page.getByRole('link', { name: /Cart/i }).first();
const cartProductName = (page) => page.locator('a.ajaxcart__product-name').first();
const cartProductMeta = (page) => page.locator('.ajaxcart__product-meta').first();
const cartFooter = (page) => page.locator('.ajaxcart__footer').first();
const quantityInput = (page) => page.locator('input.ajaxcart__qty-num').first();
const quantityIncrease = (page) => page.locator('button.ajaxcart__qty-adjust.ajaxcart__qty--plus').first();
const quantityDecrease = (page) => page.locator('button.ajaxcart__qty-adjust.ajaxcart__qty--minus').first();
const checkoutButton = (page) => page.getByRole('button', { name: /Check Out/i }).first();

async function openProductCollection(page) {
  await page.goto('/products/black-white-watch', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await expect(addToCartButton(page)).toBeVisible({ timeout: 120000 });
  await expect(page).toHaveURL(/\/products\/black-white-watch/);
  return page;
}

async function openFirstProduct(page) {
  const productLink = page.locator('a.grid-product__image-link:not(.grid-product__image-link--loading)').first();
  await expect(productLink).toBeVisible();
  await productLink.click({ force: true });
  await expect(page.locator('h1')).toBeVisible();
}

async function openCartDrawer(page) {
  if (!(await cartDrawerTitle(page).isVisible())) {
    await cartLink(page).click();
  }
  await expect(cartDrawerTitle(page)).toBeVisible({ timeout: 15000 });
}

async function addFirstProductToCart(page) {
  const activePage = await openProductCollection(page);
  await expect(activePage.locator('h1')).toHaveText(/.+/);
  await expect(addToCartButton(activePage)).toBeVisible();
  await addToCartButton(activePage).click();
  await openCartDrawer(activePage);
  return activePage;
}

test.describe('Add Product to Cart', () => {
  test.setTimeout(120000);

  test('Add a product to the cart from the product page', async ({ page }) => {
    // 1. Navigate to the storefront and validate the homepage.
    const activePage = await openProductCollection(page);

    // 2. Confirm the product page loaded successfully.
    await expect(activePage.locator('h1')).toBeVisible();
    await expect(activePage.locator('h1')).not.toBeEmpty();

    // 3. Verify that product variant options are present and a default variant is selected.
    await expect(activePage.locator('input[type="radio"][name="colour"]')).toHaveCount(2);
    await expect(activePage.locator('input[type="radio"][name="colour"]:checked')).toHaveCount(1);

    // 4. Click the Add to Cart button and verify the cart drawer opens.
    await expect(addToCartButton(activePage)).toBeVisible();
    await addToCartButton(activePage).click();
    await openCartDrawer(activePage);

    // 5. Verify the selected product appears in the cart with correct variant and subtotal.
    await expect(cartProductName(activePage)).toBeVisible();
    await expect(cartProductName(activePage)).toContainText('Black / White watch');
    await expect(cartProductMeta(activePage)).toContainText('Black');
    await expect(cartFooter(activePage)).toContainText('€25,00');
    await expect(checkoutButton(activePage)).toBeVisible();
  });

  test('Add a different product variant to the cart', async ({ page }) => {
    // 1. Navigate to the product page directly.
    const activePage = await openProductCollection(page);

    // 2. Select the White variant if available.
    const whiteVariantLabel = activePage.locator('label[for="ProductSelect-option-colour-White"]');
    await expect(whiteVariantLabel).toBeVisible();
    await whiteVariantLabel.click();
    const whiteVariant = activePage.locator('input[type="radio"][value="White"]');
    await expect(whiteVariant).toBeChecked();

    // 3. Click Add to Cart.
    await expect(addToCartButton(activePage)).toBeVisible();
    await addToCartButton(activePage).click();
    await openCartDrawer(activePage);

    // 4. Verify the cart line item contains the White variant.
    await expect(cartProductName(activePage)).toBeVisible();
    await expect(cartProductName(activePage)).toContainText('Black / White watch');
    await expect(cartProductMeta(activePage)).toContainText('White');
    await expect(cartFooter(activePage)).toContainText('€25,00');
  });

  test('Verify cart drawer contents after adding a product', async ({ page }) => {
    // 1. Add the first product to the cart from the product page.
    const activePage = await addFirstProductToCart(page);

    // 2. Open the cart drawer if it is not already visible.
    await openCartDrawer(activePage);

    // 3. Inspect the cart line item details.
    await expect(cartProductName(activePage)).toBeVisible();
    await expect(cartProductName(activePage)).toContainText('Black / White watch');
    await expect(cartProductMeta(activePage)).toContainText('Black');
    await expect(quantityInput(activePage)).toBeVisible();
    await expect(quantityInput(activePage)).toHaveValue('1');
    await expect(cartFooter(activePage)).toContainText('€25,00');

    // 4. Close the cart drawer and verify it is hidden.
    await activePage.getByRole('button', { name: /Close Cart/i }).click();
    await expect(cartDrawerTitle(activePage)).not.toBeVisible();
  });

  test('Validate add-to-cart flow for default variant selection', async ({ page }) => {
    // 1. Open the first product page from the product page helper.
    const activePage = await openProductCollection(page);

    // 2. Verify a default variant is selected.
    const defaultVariant = activePage.locator('input[type="radio"][name="colour"]:checked');
    await expect(defaultVariant).toHaveCount(1);

    // 3. Click Add to Cart without changing the variant.
    await expect(addToCartButton(activePage)).toBeVisible();
    await addToCartButton(activePage).click();
    await openCartDrawer(activePage);

    // 4. Verify the cart contains the default variant and no validation error appears.
    await expect(cartProductName(activePage)).toBeVisible();
    await expect(cartProductName(activePage)).toContainText('Black / White watch');
    await expect(cartProductMeta(activePage)).toContainText('Black');
  });

  test('Add multiple quantities through cart quantity controls', async ({ page }) => {
    // 1. Add the first product to the cart.
    const activePage = await addFirstProductToCart(page);

    // 2. Open the cart drawer and increase the quantity.
    await openCartDrawer(activePage);
    await expect(quantityInput(activePage)).toHaveValue('1');
    await quantityIncrease(activePage).click();
    await expect(quantityInput(activePage)).toHaveValue('2', { timeout: 10000 });
    await expect(cartFooter(activePage)).toContainText('€50,00');

    // 3. Decrease the quantity and verify the update.
    await quantityDecrease(activePage).click();
    await expect(quantityInput(activePage)).toHaveValue('1', { timeout: 10000 });
    await expect(cartFooter(activePage)).toContainText('€25,00');
    await expect(cartProductName(activePage)).toBeVisible();
  });
});
