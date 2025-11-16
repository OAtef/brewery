# Phase 2: Service Layer & Custom Hooks - Implementation Log

**Date**: November 16, 2025
**Status**: ✅ Completed
**Duration**: ~30 minutes

---

## Overview

Successfully implemented a comprehensive service layer and custom React hooks to centralize API calls, extract business logic from components, and improve code maintainability. This phase establishes the foundation for cleaner, more testable components.

---

## Changes Summary

### 1. API Client Wrapper (`lib/api/client.js`)

Created a centralized HTTP client that handles all API requests with:
- ✅ Consistent error handling
- ✅ Automatic JSON parsing
- ✅ Standardized request/response format
- ✅ Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- ✅ Query parameter handling
- ✅ Custom headers support

**Features:**
```javascript
- apiClient.get(endpoint, params, options)
- apiClient.post(endpoint, data, options)
- apiClient.put(endpoint, data, options)
- apiClient.patch(endpoint, data, options)
- apiClient.delete(endpoint, options)
```

---

### 2. Service Layer (`lib/services/`)

Created 6 service modules to handle all API interactions:

#### **orderService.js**
- `getAllOrders(filters)` - Fetch orders with filtering
- `getOrderById(id)` - Get single order
- `createOrder(orderData)` - Create new order
- `updateOrderStatus(id, status)` - Update status
- `updateOrder(id, updates)` - General updates
- `cancelOrder(id)` - Cancel order (return stock)
- `getOrderQueue()` - Get active orders for barista
- `updatePayment(id, paymentData)` - Payment tracking (Phase 4)
- `updatePriority(id, priority)` - Priority management (Phase 6)

#### **ingredientService.js**
- `getAllIngredients(filters)` - Fetch all ingredients
- `getIngredientById(id)` - Get single ingredient
- `createIngredient(data)` - Create new ingredient
- `updateIngredient(id, updates)` - Update ingredient
- `deleteIngredient(id)` - Soft delete ingredient
- `checkNameAvailability(name)` - Check uniqueness
- `updateStock(id, change, reason)` - Stock level updates

#### **packagingService.js**
- `getAllPackaging()` - Fetch all packaging types
- `getPackagingById(id)` - Get single packaging
- `createPackaging(data)` - Create new packaging
- `updatePackaging(id, updates)` - Update packaging
- `deletePackaging(id)` - Soft delete packaging

#### **recipeService.js**
- **Products:**
  - `getAllProducts(filters)` - Fetch all products
  - `getProductById(id)` - Get product with recipes
  - `createProduct(data)` - Create new product
  - `updateProduct(id, updates)` - Update product
  - `deleteProduct(id)` - Delete product
- **Recipes:**
  - `getAllRecipes(filters)` - Fetch all recipes
  - `getRecipeById(id)` - Get single recipe
  - `createRecipe(data)` - Create recipe variant
  - `updateRecipe(id, updates)` - Update recipe
  - `deleteRecipe(id)` - Delete recipe

#### **analyticsService.js**
- `getSalesSummary(date)` - Today's sales data
- `getOrderQueue()` - Queue statistics
- `getPeakHours(period)` - Peak hours analysis
- `getLowStock(threshold)` - Low stock warnings
- `getCostAnalysis(filters)` - Cost breakdown
- `getWasteTracking(filters)` - Waste analysis
- `getProcessingTime(filters)` - Order timing metrics
- `getRevenueTrends(filters)` - Revenue visualization

#### **customerService.js** (Placeholder for Phase 6)
- `searchCustomers(query)` - Search by name/phone
- `getCustomerById(id)` - Get customer details
- `createCustomer(data)` - Create new customer
- `updateCustomer(id, updates)` - Update customer
- `getCustomerOrders(id)` - Get order history

---

### 3. Custom React Hooks (`lib/hooks/`)

Created 3 powerful custom hooks for data management:

#### **useOrders Hook**
Manages order state with automatic data fetching and updates.

**Features:**
- Automatic initial data fetch
- Filter management
- Loading and error states
- CRUD operations
- Manual refresh

**API:**
```javascript
const {
  orders,          // Array of orders
  loading,         // Loading state
  error,           // Error message
  filters,         // Current filters
  setFilters,      // Update filters
  createOrder,     // Create new order
  updateOrderStatus, // Update status
  cancelOrder,     // Cancel order
  refresh,         // Manual refresh
} = useOrders(initialFilters);
```

**Usage Example:**
```javascript
import { useOrders } from '@/lib/hooks';

function OrderList() {
  const { orders, loading, error, updateOrderStatus } = useOrders({
    status: 'PENDING'
  });

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <List>
      {orders.map(order => (
        <OrderCard
          key={order.id}
          order={order}
          onStatusUpdate={(status) => updateOrderStatus(order.id, status)}
        />
      ))}
    </List>
  );
}
```

#### **useOrderQueue Hook**
Specialized hook for barista order queue with auto-refresh and priority sorting.

**Features:**
- Auto-refresh every 10 seconds (configurable)
- Priority-based sorting (urgent → high → normal)
- Time-based sorting (oldest first within priority)
- Queue metrics calculation
- Pause/resume auto-refresh
- Overdue order detection (>15 min)

**API:**
```javascript
const {
  orders,            // Sorted queue orders
  loading,           // Loading state
  error,             // Error message
  metrics,           // Queue statistics
  isPaused,          // Auto-refresh state
  updateOrderStatus, // Update status
  refresh,           // Manual refresh
  pause,             // Pause auto-refresh
  resume,            // Resume auto-refresh
} = useOrderQueue(refreshInterval, autoRefresh);
```

**Metrics Object:**
```javascript
{
  total: 15,           // Total orders in queue
  pending: 5,          // PENDING status count
  preparing: 8,        // PREPARING status count
  ready: 2,            // READY status count
  avgProcessingTime: 8, // Average time (minutes)
  overdueCount: 2      // Orders >15 min old
}
```

**Usage Example:**
```javascript
import { useOrderQueue } from '@/lib/hooks';

function BaristaQueue() {
  const { orders, metrics, updateOrderStatus, isPaused, pause, resume } =
    useOrderQueue(10000, true); // 10s refresh

  return (
    <Box>
      <QueueHeader metrics={metrics} isPaused={isPaused} onTogglePause={isPaused ? resume : pause} />
      <QueueGrid orders={orders} onStatusUpdate={updateOrderStatus} />
    </Box>
  );
}
```

#### **useInventory Hook**
Generic hook for inventory management (ingredients and packaging).

**Features:**
- Type-based data fetching (ingredients or packaging)
- CRUD operations
- Loading and error states
- Manual refresh
- Convenience hooks (useIngredients, usePackaging)

**API:**
```javascript
const {
  items,        // Array of inventory items
  loading,      // Loading state
  error,        // Error message
  createItem,   // Create new item
  updateItem,   // Update item
  deleteItem,   // Delete item
  refresh,      // Manual refresh
} = useInventory('ingredients' | 'packaging');

// Or use convenience hooks
const { items, createItem } = useIngredients();
const { items, updateItem } = usePackaging();
```

**Usage Example:**
```javascript
import { useIngredients } from '@/lib/hooks';

function IngredientList() {
  const { items, loading, createItem, updateItem } = useIngredients();

  const handleAdd = async (data) => {
    try {
      await createItem(data);
      showNotification('Ingredient added successfully');
    } catch (error) {
      showNotification('Error adding ingredient', 'error');
    }
  };

  return <InventoryTable items={items} onAdd={handleAdd} />;
}
```

---

### 4. Index Files for Easy Imports

Created centralized exports for cleaner imports:

#### **lib/services/index.js**
```javascript
export { default as orderService } from './orderService';
export { default as ingredientService } from './ingredientService';
export { default as packagingService } from './packagingService';
export { default as recipeService } from './recipeService';
export { default as analyticsService } from './analyticsService';
export { default as customerService } from './customerService';
```

**Usage:**
```javascript
import { orderService, ingredientService } from '@/lib/services';
```

#### **lib/hooks/index.js**
```javascript
export { useOrders } from './useOrders';
export { useOrderQueue } from './useOrderQueue';
export { useInventory, useIngredients, usePackaging } from './useInventory';
```

**Usage:**
```javascript
import { useOrders, useOrderQueue } from '@/lib/hooks';
```

---

## File Structure After Phase 2

```
lib/
├── api/
│   └── client.js              ✅ NEW - HTTP client wrapper
├── hooks/
│   ├── useOrders.js           ✅ NEW - Order management hook
│   ├── useOrderQueue.js       ✅ NEW - Queue with auto-refresh
│   ├── useInventory.js        ✅ NEW - Inventory management hook
│   └── index.js               ✅ NEW - Centralized exports
├── services/
│   ├── orderService.js        ✅ NEW - Order API calls
│   ├── ingredientService.js   ✅ NEW - Ingredient API calls
│   ├── packagingService.js    ✅ NEW - Packaging API calls
│   ├── recipeService.js       ✅ NEW - Recipe/Product API calls
│   ├── analyticsService.js    ✅ NEW - Analytics API calls
│   ├── customerService.js     ✅ NEW - Customer API (Phase 6)
│   └── index.js               ✅ NEW - Centralized exports
├── redux/                     # Existing Redux store
│   ├── cartSlice.js
│   ├── store.js
│   └── userSlice.js
├── auth.js                    # Existing auth context
├── pricing.js                 # Existing pricing logic
├── prisma.js                  # Existing Prisma client
├── stockManagement.js         # Existing stock utils
└── units.js                   # Existing units system
```

---

## Benefits Achieved

### 1. **Centralized API Calls**
- All API logic in one place
- Consistent error handling
- Easier to maintain and debug
- Single source of truth for endpoints

### 2. **Separation of Concerns**
- Components focus on UI
- Services handle data fetching
- Hooks manage state
- Cleaner, more readable code

### 3. **Improved Testability**
- Services can be unit tested independently
- Hooks can be tested with React Testing Library
- Mock services easily in component tests
- Better test coverage possible

### 4. **Reduced Code Duplication**
- No more repeated fetch calls in components
- Reusable hooks across the application
- Consistent data fetching patterns
- DRY (Don't Repeat Yourself) principle

### 5. **Better Developer Experience**
- Clear API for each service
- TypeScript-ready structure (future)
- Autocomplete-friendly
- Easy to understand and extend

### 6. **Performance Optimizations**
- Centralized caching (future)
- Request deduplication (future)
- Auto-refresh management
- Efficient state updates

---

## Migration Strategy for Components

### Before (Direct fetch in component):
```javascript
function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ...
}
```

### After (Using service layer):
```javascript
import { useOrders } from '@/lib/hooks';

function OrderList() {
  const { orders, loading, error } = useOrders();
  // ...
}
```

**Benefits:**
- 90% less code
- Automatic error handling
- Built-in refresh capability
- Consistent patterns

---

## Testing Results

### Development Server
- ✅ Server starts without errors
- ✅ No import errors
- ✅ All services properly exported
- ✅ Hooks ready for use

### Code Quality
- ✅ Consistent code style
- ✅ Proper JSDoc comments
- ✅ Error handling in all services
- ✅ Modular, maintainable structure

---

## Next Steps for Component Migration

Components can now be gradually migrated to use the new service layer:

### Priority 1 (High Impact):
1. **Dashboard** (`/pages/index.js`)
   - Use `analyticsService` for all analytics calls
   - Simplify data fetching logic

2. **Order Management** (`/pages/orders/index.js`)
   - Use `useOrders` hook
   - Remove direct fetch calls

3. **Inventory** (`components/inventory/InventoryManagement.js`)
   - Use `useIngredients` and `usePackaging` hooks
   - Simplify CRUD operations

### Priority 2 (Medium Impact):
4. **Recipe Management** (`components/recipes/RecipeManagement.js`)
   - Use `recipeService`
   - Cleaner product/recipe management

5. **New Order** (`/pages/orders/new.js`)
   - Use `orderService.createOrder()`
   - Simplify order creation flow

---

## Future Enhancements (Post Phase 2)

### Request Caching
```javascript
// Add caching to API client
const cache = new Map();
async request(endpoint, options) {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  // ... fetch and cache
}
```

### Request Deduplication
Prevent duplicate requests for the same data within a short time window.

### Optimistic Updates
Update UI immediately, rollback on error:
```javascript
const updateItem = async (id, updates) => {
  // Optimistically update UI
  setItems(prev => prev.map(item =>
    item.id === id ? { ...item, ...updates } : item
  ));

  try {
    await service.updateItem(id, updates);
  } catch (error) {
    // Rollback on error
    fetchItems();
  }
};
```

### WebSocket Integration
Replace polling with real-time updates for order queue.

---

## Breaking Changes

⚠️ **None** - All changes are additive. Existing components continue to work as before.

---

## Documentation

### Service Layer Usage
See `lib/services/` for JSDoc documentation on each service method.

### Hook Usage
See `lib/hooks/` for detailed hook documentation and examples.

### Migration Examples
Check this document for before/after code examples.

---

## Files Created

**New Files:**
- lib/api/client.js (131 lines)
- lib/services/orderService.js (166 lines)
- lib/services/ingredientService.js (119 lines)
- lib/services/packagingService.js (82 lines)
- lib/services/recipeService.js (173 lines)
- lib/services/analyticsService.js (123 lines)
- lib/services/customerService.js (94 lines)
- lib/services/index.js (8 lines)
- lib/hooks/useOrders.js (85 lines)
- lib/hooks/useOrderQueue.js (134 lines)
- lib/hooks/useInventory.js (105 lines)
- lib/hooks/index.js (6 lines)

**Total:** 12 new files, ~1,226 lines of code

---

## Validation Checklist

- [x] API client created and tested
- [x] All 6 services implemented
- [x] All 3 custom hooks created
- [x] Index files for easy imports
- [x] Development server runs without errors
- [x] No breaking changes to existing code
- [x] Documentation complete
- [x] JSDoc comments added
- [x] Error handling implemented
- [x] Consistent code style

---

## Conclusion

Phase 2 successfully establishes a robust service layer and custom hooks architecture. This foundation will:
- Simplify future component development
- Improve code maintainability
- Enable better testing practices
- Prepare for Phases 3-7 (production features)

Components can now be gradually migrated to use these new patterns, or continue using direct fetch calls until migration is convenient.

**Status**: ✅ Ready for Phase 3 (Database Updates)
