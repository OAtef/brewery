# Phase 7: Testing & Refinement

**Estimated Time**: 2-3 days
**Priority**: High (Quality Assurance)

---

## 7.1 End-to-End Testing Setup

### Install Testing Tools (if not already)
- [ ] Verify Jest is installed
- [ ] Install React Testing Library (if needed)
- [ ] Consider Cypress or Playwright for E2E tests (optional)

---

## 7.2 Cashier Display Testing

### Functional Testing
- [ ] **Product Selection Flow**
  - Select product from grid
  - Verify variant options appear
  - Select variant
  - Verify packaging options appear
  - Select packaging
  - Verify quantity selector appears
  - Adjust quantity
  - Click "Add to Cart"
  - Verify item appears in cart

- [ ] **Cart Management**
  - Add multiple different products
  - Add same product with different variants (should be separate items)
  - Add same product with same variant (should increment quantity)
  - Edit quantity of cart item
  - Remove item from cart
  - Verify total updates correctly

- [ ] **Customer Management**
  - Search for existing customer by name
  - Search for existing customer by phone
  - Select customer from results
  - Verify customer details populate
  - Create new customer
  - Verify new customer appears in search
  - Handle duplicate phone number error

- [ ] **Payment Flow - Cash**
  - Add items to cart
  - Select customer
  - Click "Proceed to Payment"
  - Select "Cash" payment method
  - Enter amount tendered ($20)
  - Verify change calculated correctly
  - Complete payment
  - Verify order created successfully
  - Verify receipt displays
  - Verify cart clears
  - Verify order appears in queue status

- [ ] **Payment Flow - Card/Mobile**
  - Repeat flow with Card payment
  - Repeat flow with Mobile payment
  - Verify no change calculation for non-cash

- [ ] **Order Queue Status (Cashier View)**
  - Verify new order appears in queue immediately
  - Verify status updates in real-time (when barista updates)
  - Verify auto-refresh works (15s)
  - Click order to view details

### Edge Cases
- [ ] Try to checkout with empty cart (should prevent)
- [ ] Try to checkout without selecting customer (should prevent)
- [ ] Enter invalid cash amount (less than total) - should show error
- [ ] Enter non-numeric value in cash field - should prevent or validate
- [ ] Test with very long customer name (50+ characters)
- [ ] Test with special characters in customer name
- [ ] Test network error during order creation - should show error
- [ ] Test creating customer with existing phone number - should error

### UI/UX Testing
- [ ] Verify all buttons are large enough (min 44px×44px)
- [ ] Test on tablet device (iPad, Android tablet)
- [ ] Test in portrait orientation
- [ ] Test in landscape orientation
- [ ] Verify text is readable from 2 feet away
- [ ] Test touch interactions (no accidental taps)
- [ ] Verify loading states appear during API calls
- [ ] Verify success notifications appear
- [ ] Verify error notifications appear and are clear

### Performance Testing
- [ ] Test with 50+ products in grid - should load quickly
- [ ] Test with 20+ items in cart - should not lag
- [ ] Test auto-refresh with 100+ orders - should not freeze
- [ ] Monitor network requests (should not make excessive calls)

---

## 7.3 Barista Display Testing

### Functional Testing
- [ ] **Queue Display**
  - Verify orders load on page load
  - Verify orders sorted by priority then time
  - Verify urgent orders appear first (red highlight)
  - Verify high priority orders have orange highlight
  - Verify normal orders have green highlight
  - Verify overdue orders (>15 min) have red background
  - Verify order count is accurate
  - Verify metrics display correctly (avg time, totals)

- [ ] **Auto-Refresh**
  - Wait 10 seconds
  - Verify queue refreshes automatically
  - Create new order from cashier
  - Verify new order appears within 10 seconds
  - Verify refresh indicator shows during refresh

- [ ] **Order Details Modal**
  - Click on order card
  - Verify modal opens
  - Verify all order details displayed:
    - Order number
    - Customer name and address
    - Created time
    - Status
    - Priority
  - Verify product list shows:
    - Product name
    - Variant
    - Packaging
    - Quantity (large and bold)
  - Verify recipe details expandable
  - Verify ingredient list shows quantities

- [ ] **Status Updates**
  - For PENDING order:
    - Click "Start Preparing"
    - Verify status changes to PREPARING
    - Verify startedAt timestamp set
    - Verify order moves in queue
  - For PREPARING order:
    - Click "Mark Ready"
    - Verify status changes to READY
    - Verify readyAt timestamp set
    - Verify order color changes to blue
  - For READY order:
    - Click "Mark Completed"
    - Verify status changes to COMPLETED
    - Verify completedAt timestamp set
    - Verify order disappears from queue

- [ ] **Filters**
  - Click "Show Pending Only" - verify only PENDING orders show
  - Click "Show Preparing Only" - verify only PREPARING orders show
  - Click "Show Ready Only" - verify only READY orders show
  - Click "Show All" - verify all active orders show

- [ ] **Sound Notifications**
  - Enable sound toggle
  - Create new order from cashier
  - Verify sound plays when new order appears
  - Disable sound toggle
  - Create another order
  - Verify no sound plays

### Edge Cases
- [ ] Test with 0 orders - verify empty state shows
- [ ] Test with 100+ orders - verify performance acceptable
- [ ] Test rapid status changes (update multiple orders quickly)
- [ ] Test concurrent updates (2 baristas updating different orders)
- [ ] Test network error during status update - should show error
- [ ] Test very old order (24+ hours) - verify timer shows correctly

### UI/UX Testing
- [ ] Verify all buttons are large enough (min 60px×60px)
- [ ] Test on tablet device (iPad, Android tablet in landscape)
- [ ] Verify text readable from 3 feet away
- [ ] Test horizontal scrolling of order cards
- [ ] Test modal is easy to dismiss (close button, backdrop click)
- [ ] Verify color coding is obvious and distinguishable
- [ ] Test touch interactions
- [ ] Verify animations are smooth (status changes, new orders)

### Performance Testing
- [ ] Test auto-refresh with 50+ orders - should not lag
- [ ] Test scrolling through 100+ order cards - should be smooth
- [ ] Monitor memory usage during extended use (4+ hours)
- [ ] Verify no memory leaks from auto-refresh

### Real-Time Sync Testing
- [ ] Open cashier display on one device
- [ ] Open barista display on another device
- [ ] Create order on cashier
- [ ] Verify order appears on barista within 10 seconds
- [ ] Update status on barista
- [ ] Verify status updates on cashier queue status
- [ ] Test with multiple simultaneous updates

---

## 7.4 Integration Testing

### Complete Order Workflow
- [ ] **Cashier Side:**
  - Log in as cashier
  - Search and select customer
  - Add 3 different products to cart
  - Proceed to payment
  - Select Cash, enter $50, verify change
  - Complete order
  - Verify order appears in queue status

- [ ] **Barista Side:**
  - Log in as barista on different device/browser
  - Verify new order appears in queue
  - Click order to view details
  - Verify all 3 products show correctly
  - Click "Start Preparing"
  - Verify status changes

- [ ] **Cashier Side:**
  - Verify order status updated in queue status (PREPARING)

- [ ] **Barista Side:**
  - After preparation, click "Mark Ready"
  - Verify status changes to READY

- [ ] **Cashier Side:**
  - Verify order status updated (READY)
  - Inform customer order is ready

- [ ] **Barista Side:**
  - When customer picks up, click "Mark Completed"
  - Verify order disappears from queue

- [ ] **Both Sides:**
  - Verify order no longer appears in active queues

### Multi-Order Workflow
- [ ] Create 5 orders from cashier in rapid succession
- [ ] Verify all 5 appear on barista display
- [ ] Set 2 orders to urgent priority (via database or future UI)
- [ ] Verify urgent orders appear first in queue
- [ ] Process orders in priority order on barista display
- [ ] Verify queue updates correctly after each status change

---

## 7.5 Role-Based Access Testing

### ADMIN Role
- [ ] Login as ADMIN
- [ ] Verify access to:
  - Dashboard
  - Inventory
  - Recipes
  - Orders
  - Cashier display
  - Barista display
  - 3D Scene

### MANAGER Role
- [ ] Login as MANAGER
- [ ] Verify access to:
  - Inventory
  - Recipes
  - Orders
  - Cashier display
  - Barista display

### BARISTA Role
- [ ] Login as BARISTA
- [ ] Verify access to:
  - Barista display
  - Orders page (read-only)
- [ ] Verify NO access to:
  - Inventory
  - Recipes

### CASHIER Role
- [ ] Login as CASHIER
- [ ] Verify access to:
  - Cashier display
- [ ] Verify NO access to:
  - Inventory
  - Recipes
  - Dashboard (analytics)

---

## 7.6 Mobile/Tablet Device Testing

### Devices to Test
- [ ] iPad (12.9-inch, landscape)
- [ ] iPad (10.2-inch, landscape)
- [ ] Android Tablet (Samsung Tab, landscape)
- [ ] iPhone (for cashier as backup)
- [ ] Android Phone (for cashier as backup)

### Cashier Display on Tablet
- [ ] Test product grid layout (should fit 3-4 columns)
- [ ] Test touch selection (no double-tap issues)
- [ ] Test virtual keyboard input for customer search
- [ ] Test numeric keypad for cash amount
- [ ] Test cart scrolling
- [ ] Test overall responsiveness

### Barista Display on Tablet (Landscape)
- [ ] Test horizontal scrolling of order cards
- [ ] Test order card tap to open details
- [ ] Test status button taps
- [ ] Test modal scrolling (if many products)
- [ ] Verify text readable from 2-3 feet
- [ ] Test auto-refresh performance

---

## 7.7 Browser Compatibility Testing

### Browsers to Test
- [ ] Chrome (latest) - Desktop
- [ ] Safari (latest) - Desktop & iPad
- [ ] Firefox (latest) - Desktop
- [ ] Edge (latest) - Desktop
- [ ] Mobile Safari - iOS
- [ ] Chrome - Android

### Features to Verify
- [ ] Layout renders correctly
- [ ] Touch events work
- [ ] Auto-refresh works
- [ ] Sounds play (Web Audio API support)
- [ ] Modals/dialogs display correctly
- [ ] Notifications appear

---

## 7.8 Network Conditions Testing

### Test Scenarios
- [ ] Fast WiFi (normal operation)
- [ ] Slow WiFi (3G simulation)
  - Verify loading states appear
  - Verify operations still work (just slower)
  - Verify timeouts handled gracefully
- [ ] Network interruption (disconnect WiFi mid-operation)
  - Verify error messages appear
  - Verify auto-refresh pauses or shows error
  - Verify manual refresh option available
- [ ] Network reconnection
  - Verify auto-refresh resumes
  - Verify data loads correctly

---

## 7.9 Security Testing

### Authentication
- [ ] Try accessing /cashier without login - should redirect
- [ ] Try accessing /barista without login - should redirect
- [ ] Try accessing API endpoints without auth - should 401

### Authorization
- [ ] As BARISTA, try to access /inventory - should deny
- [ ] As CASHIER, try to access /recipes - should deny
- [ ] Try to update other user's orders - should allow (for barista workflow)

### Input Validation
- [ ] Try SQL injection in customer search - should sanitize
- [ ] Try XSS in customer name field - should escape
- [ ] Try negative numbers in cash amount - should validate
- [ ] Try very large numbers (>1 million) - should handle
- [ ] Try special characters in all text inputs - should handle

---

## 7.10 Data Integrity Testing

### Stock Management
- [ ] Create order with products
- [ ] Mark order as PREPARING
- [ ] Verify stock deducted from ingredients
- [ ] Cancel order
- [ ] Verify stock returned to ingredients
- [ ] Check InventoryLog for audit trail

### Order State
- [ ] Verify orders can only transition in valid sequence:
  - PENDING → PREPARING ✓
  - PREPARING → READY ✓
  - READY → COMPLETED ✓
  - PENDING → CANCELLED ✓
  - READY → PENDING ✗ (should not allow)
- [ ] Verify timestamps set correctly for each transition

### Payment Calculations
- [ ] Order total = sum of (product price + variant modifier + packaging) × quantity
- [ ] Change = amountPaid - total
- [ ] Verify all calculations accurate to 2 decimal places
- [ ] Test with various price combinations

---

## 7.11 Performance & Load Testing

### Load Testing (Optional but Recommended)
- [ ] Simulate 10 concurrent users creating orders
- [ ] Simulate 5 baristas updating statuses simultaneously
- [ ] Simulate 50 orders in queue with auto-refresh
- [ ] Monitor server response times
- [ ] Monitor database query performance
- [ ] Identify bottlenecks

### Optimization Opportunities
- [ ] Add database query caching if needed
- [ ] Optimize Prisma queries (use select, include wisely)
- [ ] Add pagination if order list grows large
- [ ] Consider Redis for session management (future)

---

## 7.12 User Acceptance Testing (UAT)

### Prepare Test Scenarios
- [ ] Create realistic test scenarios for cashier
- [ ] Create realistic test scenarios for barista
- [ ] Prepare test data (products, customers, ingredients)

### Conduct UAT
- [ ] Have real cashier test the cashier display
  - Collect feedback on usability
  - Note any confusion points
  - Identify missing features
- [ ] Have real barista test the barista display
  - Collect feedback on queue visibility
  - Test status update flow
  - Note any workflow issues
- [ ] Observe users without guidance
  - Note where they struggle
  - Identify unintuitive UI elements

### Incorporate Feedback
- [ ] Prioritize feedback items
- [ ] Implement critical fixes
- [ ] Schedule nice-to-have improvements for later

---

## 7.13 Documentation Review

### User Documentation
- [ ] Review `/docs/USER-GUIDE.md`
- [ ] Ensure cashier workflow documented clearly
- [ ] Ensure barista workflow documented clearly
- [ ] Add screenshots of key screens
- [ ] Add troubleshooting section
- [ ] Add FAQ section

### Technical Documentation
- [ ] Review `/docs/API.md`
- [ ] Ensure all endpoints documented
- [ ] Add request/response examples
- [ ] Document error codes
- [ ] Review `/docs/DEPLOYMENT.md`
- [ ] Add production deployment checklist

---

## 7.14 Bug Fixes & Polish

### Fix Critical Bugs
- [ ] Review all bugs found during testing
- [ ] Fix any blocking issues (prevents core functionality)
- [ ] Fix high-priority bugs (degrades user experience)

### UI/UX Polish
- [ ] Ensure consistent spacing across all pages
- [ ] Ensure consistent button styles
- [ ] Ensure consistent color usage
- [ ] Smooth out any jarring animations
- [ ] Add loading states where missing
- [ ] Improve error messages (clear, actionable)

### Accessibility Improvements
- [ ] Add alt text for images
- [ ] Ensure keyboard navigation works throughout
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Ensure color contrast meets WCAG AA standards
- [ ] Add focus indicators

---

## 7.15 Production Readiness Checklist

### Environment Configuration
- [ ] Verify `.env` has production database URL
- [ ] Verify environment variables are set correctly
- [ ] Remove or disable debug logging
- [ ] Ensure error logging configured (console.error at minimum)

### Database
- [ ] Run all migrations on production database
- [ ] Verify database backups configured
- [ ] Seed initial data (admin user, basic products)
- [ ] Create CASHIER and BARISTA user accounts

### Security
- [ ] Change all default passwords
- [ ] Ensure HTTPS enabled (if deploying to web)
- [ ] Review and secure API endpoints
- [ ] Enable CORS restrictions if needed
- [ ] Add rate limiting to prevent abuse

### Performance
- [ ] Enable production mode (Next.js build)
- [ ] Optimize images and assets
- [ ] Enable compression (gzip/brotli)
- [ ] Test on production-like environment
- [ ] Monitor initial load time

### Monitoring
- [ ] Set up basic error monitoring (Sentry, LogRocket, or similar)
- [ ] Set up uptime monitoring (if applicable)
- [ ] Set up database backup alerts
- [ ] Create runbook for common issues

---

## 7.16 Final Testing Round

### Smoke Testing
- [ ] Test complete order flow end-to-end
- [ ] Test all critical user paths
- [ ] Verify no console errors
- [ ] Verify no broken links or 404s
- [ ] Test on all target devices one more time

### Regression Testing
- [ ] Run full test suite (`npm test`)
- [ ] Verify all existing features still work
- [ ] Test dashboard analytics
- [ ] Test inventory management
- [ ] Test recipe management
- [ ] Test public menu page

---

## 7.17 Training Materials

### Create Training Videos (Optional)
- [ ] Record cashier workflow demo (5 min)
- [ ] Record barista workflow demo (5 min)
- [ ] Record order management overview (3 min)

### Create Quick Reference Guides
- [ ] One-page cashier cheat sheet
- [ ] One-page barista cheat sheet
- [ ] Common troubleshooting tips

---

## 7.18 Deployment & Go-Live

### Pre-Deployment
- [ ] Create database backup
- [ ] Tag current version in git
- [ ] Review deployment checklist

### Deployment
- [ ] Deploy to production environment
- [ ] Run database migrations
- [ ] Verify application starts successfully
- [ ] Test critical functionality in production

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Be available for immediate fixes
- [ ] Collect user feedback from first real use
- [ ] Document any issues for future improvements

---

## 7.19 Final Commit & Documentation

- [ ] Commit all final fixes and polish
- [ ] Update version number in package.json
- [ ] Update CHANGELOG.md with all new features
- [ ] Tag release: `git tag v2.0.0`
- [ ] Push to repository: `git push --tags`

---

## 7.20 Post-Launch Review

### After 1 Week of Use
- [ ] Collect user feedback (cashiers, baristas)
- [ ] Review error logs
- [ ] Identify most common issues
- [ ] Plan Phase 2 improvements

### After 1 Month of Use
- [ ] Analyze usage patterns
- [ ] Review performance metrics
- [ ] Plan feature enhancements
- [ ] Consider additional automation

---

## Benefits
✅ Comprehensive testing coverage
✅ Confidence in production readiness
✅ Smooth user experience
✅ Minimal bugs in production
✅ Clear documentation
✅ Trained users
✅ Monitoring and support in place
✅ Successful launch and adoption
