# Saucedemo checkout flow

## Application Overview

Automate the Saucedemo store flow: login with standard_user, browse inventory, open product details, add item to cart, complete checkout with dummy address data, and verify order confirmation.

## Test Scenarios

### 1. Saucedemo Purchase Flow

**Seed:** `tests/seed.spec.ts`

#### 1.1. Complete checkout from login through order confirmation

**File:** `tests/saucedemo-checkout.plan.md`

**Steps:**
  1. Navigate to https://www.saucedemo.com/
    - expect: The login page loads successfully
    - expect: The page title contains "Swag Labs"
    - expect: Username and Password fields are visible
  2. Enter username standard_user and password secret_sauce
    - expect: Username input contains standard_user
    - expect: Password input contains secret_sauce
  3. Click the login button
    - expect: The page navigates to /inventory.html
    - expect: The inventory page title or header contains "Products"
    - expect: Product list is visible
  4. Click the product "Sauce Labs Backpack" to open its detail page
    - expect: The page navigates to /inventory-item.html
    - expect: The product detail includes "Sauce Labs Backpack"
    - expect: The price and description are visible
  5. Click Add to cart
    - expect: The Add to cart button changes state or is present as added
    - expect: The cart count badge updates to 1
  6. Open the shopping cart
    - expect: The page navigates to /cart.html
    - expect: The cart page header contains "Your Cart"
    - expect: The selected product is listed in the cart
  7. Click Checkout
    - expect: The page navigates to /checkout-step-one.html
    - expect: The Checkout: Your Information form is visible
  8. Enter first name John, last name Doe, and postal code 12345
    - expect: All checkout information fields contain the entered values
  9. Click Continue
    - expect: The page navigates to /checkout-step-two.html
    - expect: The overview page displays payment and shipping information
    - expect: Item total and total are visible
  10. Click Finish
    - expect: The page navigates to /checkout-complete.html
    - expect: The confirmation page displays "Thank you for your order!"
    - expect: Order completion text is visible
