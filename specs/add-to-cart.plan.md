# Add Product to Cart Test Plan

## Application Overview

Test plan for add-to-cart functionality on the CODE Demo Shopify store (https://code-demo.myshopify.com/). Covers product selection, variant selection, cart drawer behavior, and verification of cart contents.

## Test Scenarios

### 1. Add Product to Cart

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add a product to the cart from the product page

**File:** `specs/add-to-cart.plan.md`

**Steps:**
  1. -
    - expect: Start at the store homepage.
  2. Navigate to https://code-demo.myshopify.com/
    - expect: The page title is CODE Demo.
    - expect: The homepage loads successfully.
  3. Click the View test products button or Products collection link.
    - expect: The /collections/all page opens.
    - expect: A list of products is visible.
  4. Select the first product tile from the collection and open its product detail page.
    - expect: The product page loads.
    - expect: The product title and price are displayed.
  5. On the product page, verify that a variant option is present and a default variant is selected.
    - expect: Product variant options are visible.
    - expect: At least one variant is selected by default.
  6. Click the Add to Cart button.
    - expect: The cart drawer opens or the cart page updates.
    - expect: The selected product appears in the cart.
    - expect: The correct variant and price display in the cart.
    - expect: A subtotal or checkout button is visible.

#### 1.2. Add a different product variant to the cart

**File:** `specs/add-to-cart.plan.md`

**Steps:**
  1. -
    - expect: Start from the home page.
  2. Navigate to the product collection and open the Black / White watch product page.
    - expect: The Black / White watch product page loads.
    - expect: Variant options (Black, White) are visible.
  3. Select the White variant.
    - expect: The White variant is selected.
    - expect: The page shows the selected White option.
  4. Click Add to Cart.
    - expect: The cart updates with the White variant.
    - expect: The cart line item shows Black / White watch with White selected.
    - expect: The price remains correct.

#### 1.3. Verify cart drawer contents after adding a product

**File:** `specs/add-to-cart.plan.md`

**Steps:**
  1. -
    - expect: Start from the product detail page after adding an item.
  2. Open the cart drawer from the header cart icon if it is not already visible.
    - expect: The cart drawer or cart overlay is displayed.
    - expect: The cart contains the added product line.
  3. Inspect the cart line item details.
    - expect: Product name appears in cart.
    - expect: Selected variant is displayed.
    - expect: Quantity controls are present.
    - expect: Subtotal matches the added product price.
  4. Close the cart drawer using the Close Cart button.
    - expect: The cart drawer closes.
    - expect: The page returns to the product detail context.

#### 1.4. Validate add-to-cart flow for default variant selection

**File:** `specs/add-to-cart.plan.md`

**Steps:**
  1. -
    - expect: Start from the product page.
  2. Reload the product page or navigate back from the collection and open the same product again.
    - expect: The product page loads fresh.
    - expect: A default variant is selected automatically.
  3. Click Add to Cart without changing the variant.
    - expect: The cart updates successfully.
    - expect: The default variant is added to cart.
    - expect: No validation error appears.

#### 1.5. Add multiple quantities through cart quantity controls

**File:** `specs/add-to-cart.plan.md`

**Steps:**
  1. -
    - expect: A product is already in the cart drawer.
  2. Open the cart drawer and click the quantity increase (+) control for the product.
    - expect: The product quantity increases by one.
    - expect: The cart subtotal updates accordingly.
  3. Click the quantity decrease (−) control and verify the quantity updates.
    - expect: The product quantity decreases by one.
    - expect: The cart subtotal updates accordingly.
    - expect: The cart does not remove the item unexpectedly unless quantity reaches zero.
