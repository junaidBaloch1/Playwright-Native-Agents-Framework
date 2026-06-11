<!-- specs/shopify-add-to-cart.prd.md -->
# PRD — Shopify PLP → PDP → Add to Cart

## Business Flow
A shopper browses the Product Listing Page (PLP), selects a product,
lands on the Product Detail Page (PDP), selects variants, and adds
the item to the cart.

## Pages Involved
- **PLP**: /collections/all — grid of product cards with title, price, image
- **PDP**: /products/<handle> — product images, title, price, variant selectors, Add to Cart button
- **Cart**: /cart — line items, quantities, subtotal, checkout button

## Scenarios to Cover
1. Navigate from PLP to PDP by clicking a product card
2. Select a product variant (size/color) on PDP if available
3. Add product to cart and verify cart count increments
4. View cart and confirm correct product, variant, and quantity appear

## Shopify-Specific Notes
- Product cards on PLP typically use role=link with the product title as accessible name
- Add to Cart button has accessible name "Add to cart" (Shopify default theme)
- Cart item count is usually in the header as aria-label containing "Cart" with a number
- Variant selectors are either radio buttons or a select dropdown depending on theme