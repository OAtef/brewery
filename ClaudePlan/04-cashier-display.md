# Phase 4: Cashier Display Development

**Estimated Time**: 2-3 days
**Priority**: High (Production Critical)

---

## 4.1 Create Cashier Page Structure

### Create Main Cashier Page
- [ ] Create `/pages/cashier.js`
- [ ] Add role-based protection (ADMIN, MANAGER, CASHIER)
- [ ] Import ProtectedRoute wrapper
- [ ] Set up page layout with Material-UI Grid
- [ ] Add page title and header
- [ ] Define main sections: POS area, Queue status, Customer info

### Page Layout Structure
```
┌─────────────────────────────────────────┐
│  Cashier POS - [Current User] [Logout] │
├────────────────────┬────────────────────┤
│                    │                    │
│   Product Grid     │   Shopping Cart    │
│   (Left Panel)     │   (Right Panel)    │
│                    │                    │
├────────────────────┴────────────────────┤
│        Order Queue Status (Bottom)      │
└─────────────────────────────────────────┘
```

---

## 4.2 Create POS Product Grid Component

### Create ProductGrid Component
- [ ] Create `/components/pos/ProductGrid.js`
- [ ] Fetch active products using `useRecipes()` hook
- [ ] Display products in responsive grid (3-4 columns)
- [ ] Create large, touch-friendly product cards
- [ ] Show product image placeholder
- [ ] Show product name
- [ ] Show base price
- [ ] Show category badge
- [ ] Add click handler to select product
- [ ] Add category filter tabs (All, Espresso, Coffee, Specialty)

### Styling Requirements
- [ ] Large buttons (min 100px height)
- [ ] Clear typography (18px+ font size)
- [ ] Color-coded by category
- [ ] Hover/active states
- [ ] Responsive grid (mobile: 2 cols, tablet: 3 cols, desktop: 4 cols)

---

## 4.3 Create Variant Selector Component

### Create VariantSelector Component (POS Version)
- [ ] Create `/components/pos/VariantSelector.js`
- [ ] Show variant options as large chips/buttons
- [ ] Display price modifier for each variant (+$0.50, etc.)
- [ ] Support "No variant" option for base product
- [ ] Highlight selected variant
- [ ] Touch-friendly sizing

---

## 4.4 Create Packaging Selector Component

### Create PackagingSelector Component
- [ ] Create `/components/pos/PackagingSelector.js`
- [ ] Fetch packaging types using packagingService
- [ ] Display as large button group
- [ ] Show packaging type (Small Cup, Medium Cup, Large Cup)
- [ ] Show additional cost
- [ ] Highlight selected option
- [ ] Default to first available option

---

## 4.5 Create Quantity Selector Component

### Create QuantitySelector Component
- [ ] Create `/components/pos/QuantitySelector.js`
- [ ] Large minus button (-)
- [ ] Large quantity display (center)
- [ ] Large plus button (+)
- [ ] Min quantity: 1
- [ ] Max quantity: 99 (or configurable)
- [ ] Touch-optimized button size (60px+)

---

## 4.6 Create Shopping Cart Component

### Create POSCart Component
- [ ] Create `/components/pos/POSCart.js`
- [ ] Display selected items in a list
- [ ] Show for each item:
  - Product name + variant
  - Packaging type
  - Quantity
  - Unit price
  - Subtotal (quantity × unit price)
- [ ] Add edit button (modify quantity/variant)
- [ ] Add remove button (delete item)
- [ ] Show running total at bottom
- [ ] Calculate and display:
  - Subtotal
  - Tax (if applicable)
  - **Total Amount**
- [ ] Large "Proceed to Payment" button

### Cart Behavior
- [ ] Support multiple items
- [ ] Real-time price updates
- [ ] Prevent duplicate items (same product + variant + packaging)
- [ ] Increment quantity if duplicate added
- [ ] Clear cart after order completion

---

## 4.7 Create Customer Lookup Component

### Create CustomerLookup Component
- [ ] Create `/components/pos/CustomerLookup.js`
- [ ] Search input field (phone or name)
- [ ] Autocomplete dropdown with search results
- [ ] Display customer details when selected:
  - Name
  - Phone number
  - Address
- [ ] "Add New Customer" button
- [ ] Quick customer creation inline form

### Add New Customer Dialog
- [ ] Create `/components/pos/AddCustomerDialog.js`
- [ ] Form fields:
  - Name (required)
  - Phone number (required, unique)
  - Address (optional)
- [ ] Validation (phone format, required fields)
- [ ] Save button - call customerService.createCustomer()
- [ ] Auto-select after creation

---

## 4.8 Create Payment Component

### Create PaymentDialog Component
- [ ] Create `/components/pos/PaymentDialog.js`
- [ ] Display order total prominently
- [ ] Payment method selection:
  - Cash button
  - Card button
  - Mobile Pay button
- [ ] For Cash payment:
  - Amount tendered input (large numeric keypad)
  - Auto-calculate change
  - Display change amount clearly
- [ ] For Card/Mobile:
  - Simple confirmation (no integration yet)
- [ ] "Complete Order" button
- [ ] Print/Email receipt option

### Numeric Keypad
- [ ] Create `/components/pos/NumericKeypad.js`
- [ ] Large number buttons (0-9)
- [ ] Decimal point button
- [ ] Clear/Backspace button
- [ ] Quick amount buttons ($5, $10, $20, $50, $100)
- [ ] Touch-optimized (50px+ buttons)

---

## 4.9 Create Order Queue Status Component

### Create QueueStatus Component (Cashier View)
- [ ] Create `/components/pos/QueueStatus.js`
- [ ] Display compact view of current orders
- [ ] Show for each order:
  - Order number
  - Customer name
  - Status (Pending, Preparing, Ready)
  - Status color indicator
  - Time since order created
- [ ] Auto-refresh every 15 seconds
- [ ] Filter to show: PENDING, PREPARING, READY only
- [ ] Click to view full order details (modal)
- [ ] Limit to last 10 orders
- [ ] Horizontal scrollable list or compact grid

---

## 4.10 Main Cashier Page Integration

### Integrate All Components
- [ ] Import all POS components into `/pages/cashier.js`
- [ ] Set up state management:
  - selectedProduct
  - selectedVariant
  - selectedPackaging
  - quantity
  - cart (array of items)
  - selectedCustomer
- [ ] Implement "Add to Cart" flow:
  1. Select product → show variant selector
  2. Select variant → show packaging selector
  3. Select packaging → show quantity selector
  4. Click "Add to Cart" → add to cart, reset selections
- [ ] Implement "Proceed to Payment" flow:
  1. Validate customer is selected (required)
  2. Validate cart is not empty
  3. Open PaymentDialog
  4. Complete payment
  5. Submit order to API
  6. Show success message
  7. Clear cart and customer
  8. Print/show receipt

### Order Submission Logic
- [ ] Collect order data:
  ```javascript
  {
    client: { id, name, address, client_number },
    userId: currentUser.id,
    application: "web-pos",
    total: calculatedTotal,
    status: "PENDING",
    paymentMethod: "Cash",
    amountPaid: 20.00,
    changeGiven: 4.50,
    receiptNumber: generateReceiptNumber(),
    products: cartItems.map(item => ({
      productId: item.product.id,
      recipeId: item.variant?.id,
      packagingId: item.packaging.id,
      quantity: item.quantity,
      unitPrice: calculateUnitPrice(item)
    }))
  }
  ```
- [ ] Call orderService.createOrder()
- [ ] Handle success/error responses
- [ ] Show notification to user

---

## 4.11 Receipt Generation

### Create Receipt Component
- [ ] Create `/components/pos/Receipt.js`
- [ ] Design receipt layout:
  - Shop name/logo
  - Receipt number
  - Date & time
  - Cashier name
  - Customer name
  - Itemized list (product, qty, price)
  - Subtotal
  - Tax (if applicable)
  - Total
  - Payment method
  - Amount paid
  - Change given
  - Footer message ("Thank you!")
- [ ] Print functionality (window.print())
- [ ] Email option (future - just UI for now)

---

## 4.12 Keyboard Shortcuts (Optional but Recommended)

### Add Keyboard Support
- [ ] F1: Focus product search
- [ ] F2: Focus customer search
- [ ] F3: Open payment dialog
- [ ] Esc: Close dialogs, clear selections
- [ ] Enter: Add to cart / Complete payment
- [ ] +/- : Adjust quantity

---

## 4.13 Testing Cashier Display

### Functional Testing
- [ ] Test product selection flow
- [ ] Test variant selection
- [ ] Test packaging selection
- [ ] Test quantity adjustment
- [ ] Test add to cart (single item)
- [ ] Test add to cart (multiple items)
- [ ] Test edit cart item
- [ ] Test remove cart item
- [ ] Test customer lookup
- [ ] Test customer creation
- [ ] Test payment (Cash)
- [ ] Test payment (Card)
- [ ] Test change calculation
- [ ] Test order submission
- [ ] Test receipt display
- [ ] Test receipt printing
- [ ] Test cart clearing after order
- [ ] Test order queue status updates

### Edge Cases
- [ ] Test empty cart submission (should block)
- [ ] Test no customer selected (should block)
- [ ] Test invalid payment amount (should validate)
- [ ] Test network error handling
- [ ] Test duplicate customer phone numbers

### Tablet Testing
- [ ] Test on iPad/Android tablet
- [ ] Verify touch targets are large enough
- [ ] Test in portrait orientation
- [ ] Test in landscape orientation
- [ ] Verify text is readable
- [ ] Test auto-refresh doesn't cause performance issues

---

## 4.14 Styling & UX Polish

### Visual Design
- [ ] Consistent color scheme (match existing theme)
- [ ] Large, readable fonts (18px+ for main content)
- [ ] Clear visual hierarchy
- [ ] Color-coded status indicators
- [ ] Loading states for async operations
- [ ] Success/error notifications
- [ ] Smooth transitions between states

### Accessibility
- [ ] Keyboard navigation support
- [ ] Focus indicators
- [ ] ARIA labels for screen readers
- [ ] High contrast text
- [ ] Touch target minimum 44px×44px

---

## 4.15 Documentation

- [ ] Update `/docs/USER-GUIDE.md` with Cashier Display section
- [ ] Document order creation workflow
- [ ] Document payment process
- [ ] Document customer management
- [ ] Add screenshots (optional)
- [ ] Document keyboard shortcuts

---

## 4.16 Commit Changes

- [ ] Test thoroughly on desktop and tablet
- [ ] Commit with message: "feat: Add cashier POS display with order creation and payment tracking"

---

## Benefits
✅ Touch-optimized POS interface
✅ Fast order entry
✅ Customer management
✅ Payment tracking with change calculation
✅ Real-time order queue visibility
✅ Receipt generation
✅ Professional cashier experience
✅ Ready for production use
