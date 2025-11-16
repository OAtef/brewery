# Phase 3: Database Updates

**Estimated Time**: 1 day
**Priority**: High

---

## 3.1 Update Prisma Schema

### Add Payment Fields to Order Model
- [ ] Open `/prisma/schema.prisma`
- [ ] Add `paymentMethod String?` to Order model (Cash, Card, Mobile)
- [ ] Add `amountPaid Float?` to Order model
- [ ] Add `changeGiven Float?` to Order model
- [ ] Add `receiptSent Boolean @default(false)` to Order model
- [ ] Add `receiptNumber String?` to Order model (unique receipt ID)

### Add Priority and Timing Fields to Order Model
- [ ] Add `priorityLevel String @default("normal")` to Order model (urgent, high, normal)
- [ ] Add `estimatedTime Int?` to Order model (estimated preparation time in minutes)
- [ ] Add `startedAt DateTime?` to Order model (when barista starts preparing)
- [ ] Add `readyAt DateTime?` to Order model (when order is marked ready)
- [ ] Add `completedAt DateTime?` to Order model (when order is picked up/completed)

### Add CASHIER Role to UserRole Enum
- [ ] Locate `enum UserRole` in schema
- [ ] Add `CASHIER` to the enum values
- [ ] Enum should now be: `{ ADMIN, MANAGER, BARISTA, CASHIER }`

### Review Full Updated Order Model
- [ ] Verify all fields are correct:
  ```prisma
  model Order {
    id            Int      @id @default(autoincrement())
    clientId      Int
    userId        Int
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    application   String
    total         Float
    promoCode     String?
    status        OrderStatus
    notes         String?

    // NEW: Payment fields
    paymentMethod String?
    amountPaid    Float?
    changeGiven   Float?
    receiptSent   Boolean  @default(false)
    receiptNumber String?

    // NEW: Priority and timing fields
    priorityLevel String   @default("normal")
    estimatedTime Int?
    startedAt     DateTime?
    readyAt       DateTime?
    completedAt   DateTime?

    // Relations
    client        Client   @relation(fields: [clientId], references: [id])
    user          User     @relation(fields: [userId], references: [id])
    products      OrderProduct[]
  }
  ```

---

## 3.2 Create Database Migration

### Generate Migration
- [ ] Run: `npx prisma migrate dev --name add_payment_and_priority_fields`
- [ ] Review generated migration file in `/prisma/migrations/`
- [ ] Verify migration SQL looks correct

### Expected Migration Changes
- [ ] ALTER TABLE Order - add paymentMethod column
- [ ] ALTER TABLE Order - add amountPaid column
- [ ] ALTER TABLE Order - add changeGiven column
- [ ] ALTER TABLE Order - add receiptSent column (default false)
- [ ] ALTER TABLE Order - add receiptNumber column
- [ ] ALTER TABLE Order - add priorityLevel column (default 'normal')
- [ ] ALTER TABLE Order - add estimatedTime column
- [ ] ALTER TABLE Order - add startedAt column
- [ ] ALTER TABLE Order - add readyAt column
- [ ] ALTER TABLE Order - add completedAt column
- [ ] ALTER TYPE UserRole - add CASHIER value

---

## 3.3 Update Prisma Client

### Regenerate Prisma Client
- [ ] Run: `npx prisma generate`
- [ ] Verify Prisma Client types are updated
- [ ] Check that new fields appear in TypeScript autocomplete

---

## 3.4 Apply Migration to Database

### Run Migration
- [ ] Ensure Docker containers are running: `docker-compose up -d`
- [ ] Migration should auto-apply from migrate dev command
- [ ] Verify migration was successful

### Verify Database Changes
- [ ] Connect to PostgreSQL: `docker exec -it <container-name> psql -U postgres -d myapp`
- [ ] Run: `\d "Order"` to describe Order table
- [ ] Verify all new columns exist with correct types
- [ ] Run: `\dT+ "UserRole"` to verify CASHIER was added
- [ ] Exit: `\q`

---

## 3.5 Update Seed Data (Optional)

### Update seed-database.js
- [ ] Open `/scripts/database/seed-database.js`
- [ ] Add sample payment data to test orders
- [ ] Add priority levels to test orders
- [ ] Add estimated times to test orders

### Example Updates
```javascript
// Add to order creation
{
  // ... existing fields
  paymentMethod: "Cash",
  amountPaid: 20.00,
  changeGiven: 4.50,
  receiptSent: true,
  receiptNumber: "RCP-001",
  priorityLevel: "normal",
  estimatedTime: 5,
}
```

### Re-seed Database (if needed)
- [ ] Backup current data if needed
- [ ] Run: `node scripts/database/seed-database.js`
- [ ] Verify test data includes new fields

---

## 3.6 Create CASHIER User Account

### Create Cashier User
- [ ] Create script or manually add cashier user via Prisma Studio
- [ ] User details:
  - Email: cashier@coffeeshop.com
  - Password: (hashed) - set a secure password
  - Role: CASHIER
  - Name: "Cashier User"

### Script Option
- [ ] Create `/scripts/database/create-cashier-user.js`
- [ ] Import bcrypt and Prisma client
- [ ] Hash password and create user
- [ ] Run script: `node scripts/database/create-cashier-user.js`

### Manual Option via Prisma Studio
- [ ] Run: `npx prisma studio`
- [ ] Navigate to User model
- [ ] Add new record with CASHIER role
- [ ] Use bcryptjs to hash password first

---

## 3.7 Update API Route Type Checking

### Update Order API Validation
- [ ] Open `/pages/api/orders/index.js`
- [ ] Add validation for new fields in POST/PATCH:
  - paymentMethod (enum: Cash, Card, Mobile)
  - amountPaid (number, positive)
  - changeGiven (number, positive or zero)
  - priorityLevel (enum: urgent, high, normal)
  - estimatedTime (number, positive)

### Update Order API Response
- [ ] Ensure new fields are included in API responses
- [ ] Update `/pages/api/orders/[id].js` to return new fields

---

## 3.8 Testing Database Changes

### Test Order Creation with New Fields
- [ ] Create test order with payment data
- [ ] Verify paymentMethod is saved correctly
- [ ] Verify amountPaid and changeGiven are saved
- [ ] Verify receiptNumber is generated/saved
- [ ] Verify priorityLevel defaults to "normal"

### Test Order Updates
- [ ] Update order status to PREPARING
- [ ] Verify startedAt is set (if implemented)
- [ ] Update order status to READY
- [ ] Verify readyAt is set (if implemented)

### Test CASHIER Role
- [ ] Login as CASHIER user
- [ ] Verify authentication works
- [ ] Test role-based access (should access cashier pages when created)

### Test Data Retrieval
- [ ] Fetch orders via API
- [ ] Verify all new fields are returned
- [ ] Test filtering by priorityLevel
- [ ] Test sorting by estimatedTime

---

## 3.9 Documentation

- [ ] Update `/docs/API.md` with new Order model fields
- [ ] Document payment field requirements
- [ ] Document priority levels (urgent, high, normal)
- [ ] Document timing fields usage
- [ ] Add database schema diagram (optional)

---

## 3.10 Commit Changes

- [ ] Test all changes thoroughly
- [ ] Commit migration files
- [ ] Commit with message: "feat: Add payment tracking, priority levels, and CASHIER role to database"

---

## Rollback Plan (If Needed)

- [ ] Create rollback migration if issues occur
- [ ] Run: `npx prisma migrate resolve --rolled-back <migration-name>`
- [ ] Restore from backup if necessary

---

## Benefits
✅ Payment tracking for cash handling
✅ Receipt generation support
✅ Order priority management
✅ Performance metrics (timing data)
✅ CASHIER role for dedicated POS users
✅ Better order lifecycle tracking
