# Phase 6: API Development & Enhancements

**Estimated Time**: 1-2 days
**Priority**: High

---

## 6.1 Create Customer API Endpoints

### Create Customer Index Route
- [ ] Create `/pages/api/customers/index.js`
- [ ] Implement GET - fetch all customers
  - Support query params: `?search=name_or_phone`
  - Search by name (partial match)
  - Search by client_number (partial match)
  - Limit to 20 results for search
- [ ] Implement POST - create new customer
  - Validate required fields: name, client_number
  - Validate client_number uniqueness
  - Hash and store data
  - Return created customer
- [ ] Add authentication check
- [ ] Add error handling

### Create Customer Detail Route
- [ ] Create `/pages/api/customers/[id].js`
- [ ] Implement GET - fetch customer by ID
  - Include order history
  - Include order statistics (total orders, total spent)
- [ ] Implement PATCH - update customer
  - Validate fields
  - Update database
- [ ] Implement DELETE - soft delete customer (optional)
- [ ] Add authentication check
- [ ] Add error handling

---

## 6.2 Enhance Order API Endpoints

### Update Order Creation Endpoint
- [ ] Open `/pages/api/orders/index.js`
- [ ] Enhance POST handler to accept new fields:
  - paymentMethod
  - amountPaid
  - changeGiven
  - receiptNumber
  - priorityLevel
  - estimatedTime
- [ ] Add validation for new fields:
  - paymentMethod in ['Cash', 'Card', 'Mobile']
  - amountPaid >= total (if provided)
  - changeGiven = amountPaid - total
  - priorityLevel in ['urgent', 'high', 'normal']
- [ ] Generate unique receiptNumber if not provided
  - Format: `RCP-${Date.now()}-${orderId}`
- [ ] Return full order with all new fields

### Update Order Update Endpoint
- [ ] Open `/pages/api/orders/[id].js`
- [ ] Enhance PATCH handler to accept status changes
- [ ] Add automatic timestamp updates:
  - If status → PREPARING: set `startedAt = new Date()`
  - If status → READY: set `readyAt = new Date()`
  - If status → COMPLETED: set `completedAt = new Date()`
- [ ] Allow updating priorityLevel separately
- [ ] Return updated order with timestamps

### Update Order Retrieval
- [ ] Enhance GET handler to include new fields in response
- [ ] Add query param support:
  - `?status=PENDING,PREPARING` - filter by status
  - `?priority=urgent,high` - filter by priority
  - `?from=YYYY-MM-DD` - orders from date
  - `?to=YYYY-MM-DD` - orders to date
- [ ] Default sort: priority desc, createdAt asc
- [ ] Include customer details in response
- [ ] Include product details with variants

---

## 6.3 Create Order Queue Endpoint

### Create Barista Queue Route
- [ ] Create `/pages/api/orders/queue.js`
- [ ] Implement GET - fetch active orders for barista
- [ ] Filter by status: PENDING, CONFIRMED, PREPARING, READY
- [ ] Exclude COMPLETED and CANCELLED
- [ ] Sort by:
  1. priorityLevel (urgent → high → normal)
  2. createdAt (oldest first)
- [ ] Include full order details:
  - Customer info
  - Product details with variants
  - Recipe ingredient breakdown
  - Timestamps
- [ ] Add performance optimization:
  - Limit to last 50 orders
  - Use select to fetch only needed fields
- [ ] Return queue metrics:
  ```javascript
  {
    orders: [...],
    metrics: {
      total: 15,
      pending: 5,
      preparing: 8,
      ready: 2,
      avgProcessingTime: 8, // minutes
      overdueCount: 2
    }
  }
  ```

---

## 6.4 Create Payment Recording Endpoint

### Create Payment Route
- [ ] Create `/pages/api/orders/[id]/payment.js`
- [ ] Implement POST - record payment details
- [ ] Accept payload:
  ```javascript
  {
    paymentMethod: "Cash",
    amountPaid: 20.00,
    changeGiven: 4.50,
    receiptNumber: "RCP-12345"
  }
  ```
- [ ] Validate order exists and is not already paid
- [ ] Update order with payment info
- [ ] Set `receiptSent: true` if receipt generated
- [ ] Return updated order
- [ ] Add authentication check (CASHIER, ADMIN, MANAGER only)

---

## 6.5 Create Priority Update Endpoint

### Create Priority Route
- [ ] Create `/pages/api/orders/[id]/priority.js`
- [ ] Implement PATCH - update order priority
- [ ] Accept payload:
  ```javascript
  {
    priorityLevel: "urgent"
  }
  ```
- [ ] Validate priorityLevel in ['urgent', 'high', 'normal']
- [ ] Update order
- [ ] Return updated order
- [ ] Add authentication check (MANAGER, ADMIN only)
- [ ] Add audit log entry (optional)

---

## 6.6 Create Receipt Endpoint

### Create Receipt Route
- [ ] Create `/pages/api/orders/[id]/receipt.js`
- [ ] Implement GET - generate receipt data
- [ ] Return structured receipt data:
  ```javascript
  {
    receiptNumber: "RCP-12345",
    orderDate: "2025-11-16T10:30:00Z",
    cashier: "John Doe",
    customer: {
      name: "Jane Smith",
      address: "123 Main St"
    },
    items: [
      {
        product: "Latte",
        variant: "Oat Milk",
        packaging: "Medium Cup",
        quantity: 2,
        unitPrice: 5.50,
        subtotal: 11.00
      }
    ],
    subtotal: 11.00,
    tax: 0.88,
    total: 11.88,
    paymentMethod: "Cash",
    amountPaid: 15.00,
    changeGiven: 3.12
  }
  ```
- [ ] Add authentication check
- [ ] Mark `receiptSent: true` in order

---

## 6.7 Enhance Analytics Endpoints

### Update Order Queue Endpoint
- [ ] Open `/pages/api/analytics/order-queue.js`
- [ ] Add priority filtering
- [ ] Add overdue order detection (>15 min in PENDING)
- [ ] Include estimated completion times
- [ ] Return enhanced metrics

### Create Processing Time Endpoint (if not exists)
- [ ] Create `/pages/api/analytics/processing-time.js`
- [ ] Calculate average time for each status transition:
  - PENDING → PREPARING
  - PREPARING → READY
  - READY → COMPLETED
- [ ] Filter by date range
- [ ] Return breakdown by product category

---

## 6.8 Add API Response Standardization

### Create API Response Helper
- [ ] Create `/lib/api/response.js`
- [ ] Implement standard response functions:
  ```javascript
  export const successResponse = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  };

  export const errorResponse = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  };

  export const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      validationErrors: errors,
      timestamp: new Date().toISOString()
    });
  };
  ```

### Apply to All API Routes
- [ ] Update all API routes to use standard response helpers
- [ ] Ensures consistent error format across API
- [ ] Makes debugging easier

---

## 6.9 Add API Validation Middleware

### Create Validation Helper
- [ ] Create `/lib/api/validation.js`
- [ ] Implement common validators:
  - `validateRequired(field, value)`
  - `validateEmail(email)`
  - `validatePhone(phone)`
  - `validateEnum(value, allowedValues)`
  - `validatePositiveNumber(value)`
  - `validateDateRange(from, to)`

### Apply to API Routes
- [ ] Use validators in customer routes
- [ ] Use validators in order routes
- [ ] Use validators in payment routes
- [ ] Return validation errors in standard format

---

## 6.10 Add API Rate Limiting (Optional but Recommended)

### Install Rate Limiting Package
- [ ] Run: `npm install express-rate-limit`
- [ ] Or implement simple rate limiting with in-memory store

### Create Rate Limiting Middleware
- [ ] Create `/lib/api/rateLimiter.js`
- [ ] Set limits:
  - Order creation: 10 requests per minute per IP
  - Customer search: 20 requests per minute per IP
  - General API: 100 requests per minute per IP

### Apply to Routes
- [ ] Add to order creation endpoint
- [ ] Add to customer creation endpoint
- [ ] Log rate limit violations

---

## 6.11 Testing API Endpoints

### Customer API Testing
- [ ] Test GET /api/customers - fetch all
- [ ] Test GET /api/customers?search=john - search by name
- [ ] Test GET /api/customers?search=555 - search by phone
- [ ] Test POST /api/customers - create new customer
- [ ] Test POST /api/customers with duplicate phone - should fail
- [ ] Test GET /api/customers/[id] - fetch customer details
- [ ] Test PATCH /api/customers/[id] - update customer

### Order API Testing
- [ ] Test POST /api/orders - create order with payment fields
- [ ] Test GET /api/orders - fetch with new fields
- [ ] Test GET /api/orders?status=PENDING - filter by status
- [ ] Test GET /api/orders?priority=urgent - filter by priority
- [ ] Test PATCH /api/orders/[id] - update status
- [ ] Test PATCH /api/orders/[id] - verify timestamps set correctly
- [ ] Test POST /api/orders/[id]/payment - record payment
- [ ] Test PATCH /api/orders/[id]/priority - update priority
- [ ] Test GET /api/orders/[id]/receipt - generate receipt

### Queue API Testing
- [ ] Test GET /api/orders/queue - fetch active orders
- [ ] Verify orders sorted by priority then time
- [ ] Verify metrics calculated correctly
- [ ] Test with 0 orders (empty queue)
- [ ] Test with 100+ orders (performance)

### Error Handling Testing
- [ ] Test invalid order ID (404 error)
- [ ] Test invalid payment method (400 validation error)
- [ ] Test unauthorized access (401 error)
- [ ] Test missing required fields (400 validation error)
- [ ] Test network error handling

### Integration Testing
- [ ] Test full order flow:
  1. Create customer
  2. Create order with payment
  3. Fetch order queue
  4. Update status to PREPARING
  5. Update status to READY
  6. Update status to COMPLETED
  7. Generate receipt
- [ ] Verify timestamps are set correctly at each step
- [ ] Verify stock is deducted when order starts preparing

---

## 6.12 API Documentation

### Document Customer Endpoints
- [ ] Add to `/docs/API.md`:
  - GET /api/customers
  - POST /api/customers
  - GET /api/customers/[id]
  - PATCH /api/customers/[id]
- [ ] Include request/response examples
- [ ] Document query parameters
- [ ] Document error responses

### Document Order Endpoints
- [ ] Document enhanced POST /api/orders
- [ ] Document PATCH /api/orders/[id]
- [ ] Document GET /api/orders/queue
- [ ] Document POST /api/orders/[id]/payment
- [ ] Document PATCH /api/orders/[id]/priority
- [ ] Document GET /api/orders/[id]/receipt

### Add API Examples
- [ ] Create example requests in docs
- [ ] Add cURL examples
- [ ] Add JavaScript fetch examples
- [ ] Document authentication requirements

---

## 6.13 Performance Optimization

### Add Database Indexing
- [ ] Add index on Order.status for faster filtering
- [ ] Add index on Order.priorityLevel for sorting
- [ ] Add index on Client.client_number for search
- [ ] Add compound index on Order (status, priorityLevel, createdAt)
- [ ] Update Prisma schema and create migration

### Optimize Queries
- [ ] Use Prisma `select` to fetch only needed fields
- [ ] Use `include` strategically for related data
- [ ] Avoid N+1 queries (fetch related data in single query)
- [ ] Add pagination for large result sets

---

## 6.14 Commit Changes

- [ ] Test all API endpoints thoroughly
- [ ] Run full test suite
- [ ] Update API documentation
- [ ] Commit with message: "feat: Add customer management API and enhance order endpoints with payment tracking"

---

## Benefits
✅ Customer management API
✅ Enhanced order creation with payment fields
✅ Barista queue endpoint with priority sorting
✅ Automatic timestamp tracking
✅ Receipt generation API
✅ Priority management
✅ Standardized API responses
✅ Input validation
✅ Better error handling
✅ Performance optimizations
✅ Comprehensive API documentation
