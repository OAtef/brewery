# Phase 2: Service Layer & Custom Hooks

**Estimated Time**: 1 day
**Priority**: High

---

## 2.1 Create API Client Wrapper

### Create Base API Client
- [ ] Create `/lib/api/client.js`
- [ ] Implement `get(url, options)` method
- [ ] Implement `post(url, data, options)` method
- [ ] Implement `put(url, data, options)` method
- [ ] Implement `patch(url, data, options)` method
- [ ] Implement `delete(url, options)` method
- [ ] Add centralized error handling
- [ ] Add request/response interceptors
- [ ] Add loading state management
- [ ] Add automatic JSON parsing
- [ ] Export singleton instance

### Features to Include
- [ ] Automatic authentication header injection
- [ ] Error response standardization
- [ ] Retry logic for failed requests (optional)
- [ ] Request timeout handling
- [ ] Network error detection

---

## 2.2 Create Service Layer

### Order Service
- [ ] Create `/lib/services/orderService.js`
- [ ] Implement `getAllOrders(filters)` - fetch orders with optional filters
- [ ] Implement `getOrderById(id)` - fetch single order
- [ ] Implement `createOrder(orderData)` - create new order
- [ ] Implement `updateOrderStatus(id, status)` - update order status
- [ ] Implement `cancelOrder(id)` - cancel order
- [ ] Implement `getOrderQueue()` - get active orders for barista
- [ ] Implement `updatePayment(id, paymentData)` - record payment (future)
- [ ] Implement `updatePriority(id, priority)` - update order priority (future)

### Ingredient Service
- [ ] Create `/lib/services/ingredientService.js`
- [ ] Implement `getAllIngredients(filters)` - fetch ingredients
- [ ] Implement `getIngredientById(id)` - fetch single ingredient
- [ ] Implement `createIngredient(data)` - create new ingredient
- [ ] Implement `updateIngredient(id, data)` - update ingredient
- [ ] Implement `deleteIngredient(id)` - soft delete ingredient
- [ ] Implement `checkNameAvailability(name)` - check if name exists
- [ ] Implement `updateStock(id, change, reason)` - update stock level

### Recipe Service
- [ ] Create `/lib/services/recipeService.js`
- [ ] Implement `getAllProducts(filters)` - fetch products
- [ ] Implement `getProductById(id)` - fetch single product with recipes
- [ ] Implement `createProduct(data)` - create new product
- [ ] Implement `updateProduct(id, data)` - update product
- [ ] Implement `deleteProduct(id)` - delete product
- [ ] Implement `createRecipe(productId, data)` - create recipe variant
- [ ] Implement `updateRecipe(id, data)` - update recipe
- [ ] Implement `deleteRecipe(id)` - delete recipe

### Packaging Service
- [ ] Create `/lib/services/packagingService.js`
- [ ] Implement `getAllPackaging()` - fetch all packaging types
- [ ] Implement `getPackagingById(id)` - fetch single packaging
- [ ] Implement `createPackaging(data)` - create new packaging
- [ ] Implement `updatePackaging(id, data)` - update packaging
- [ ] Implement `deletePackaging(id)` - soft delete packaging

### Customer Service (NEW)
- [ ] Create `/lib/services/customerService.js`
- [ ] Implement `searchCustomers(query)` - search by name/phone
- [ ] Implement `getCustomerById(id)` - fetch customer details
- [ ] Implement `createCustomer(data)` - create new customer
- [ ] Implement `updateCustomer(id, data)` - update customer info
- [ ] Implement `getCustomerOrders(id)` - get order history

### Analytics Service
- [ ] Create `/lib/services/analyticsService.js`
- [ ] Implement `getSalesSummary(date)` - today's sales
- [ ] Implement `getOrderQueue()` - live queue stats
- [ ] Implement `getPeakHours(period)` - peak hours analysis
- [ ] Implement `getLowStock()` - low stock warnings
- [ ] Implement `getCostAnalysis()` - cost breakdown
- [ ] Implement `getWasteTracking()` - waste analysis
- [ ] Implement `getProcessingTime()` - order timing
- [ ] Implement `getRevenueTrends()` - revenue visualization

---

## 2.3 Create Custom React Hooks

### useOrders Hook
- [ ] Create `/lib/hooks/useOrders.js`
- [ ] Implement data fetching with `useState` and `useEffect`
- [ ] Add loading state management
- [ ] Add error state management
- [ ] Add refresh/refetch function
- [ ] Add filter support
- [ ] Export hook

### useOrderQueue Hook
- [ ] Create `/lib/hooks/useOrderQueue.js`
- [ ] Implement auto-refresh (configurable interval)
- [ ] Add real-time updates
- [ ] Add status filtering
- [ ] Add priority sorting
- [ ] Add pause/resume auto-refresh
- [ ] Export hook

### useInventory Hook
- [ ] Create `/lib/hooks/useInventory.js`
- [ ] Implement ingredients fetching
- [ ] Implement packaging fetching
- [ ] Add search/filter support
- [ ] Add CRUD operations
- [ ] Export hook

### useRecipes Hook
- [ ] Create `/lib/hooks/useRecipes.js`
- [ ] Implement products fetching
- [ ] Add recipe variant management
- [ ] Add active/inactive filtering
- [ ] Export hook

### useCustomers Hook
- [ ] Create `/lib/hooks/useCustomers.js`
- [ ] Implement customer search
- [ ] Add customer creation
- [ ] Add customer details fetching
- [ ] Export hook

---

## 2.4 Update Existing Components to Use Services

### Update Order Components
- [ ] Update `/components/orders/ProductSelector.js` - use recipeService
- [ ] Update `/pages/orders/index.js` - use orderService and useOrders hook
- [ ] Update `/pages/orders/new.js` - use orderService for creation

### Update Inventory Components
- [ ] Update `/components/inventory/InventoryManagement.js` - use ingredientService
- [ ] Update `/components/inventory/AddIngredientDialog.js` - use ingredientService
- [ ] Update `/components/inventory/EditIngredientDialog.js` - use ingredientService
- [ ] Update `/components/inventory/AddPackageDialog.js` - use packagingService

### Update Recipe Components
- [ ] Update `/components/recipes/RecipeManagement.js` - use recipeService
- [ ] Update `/components/recipes/AddRecipeDialog.js` - use recipeService
- [ ] Update `/components/recipes/EditRecipeDialog.js` - use recipeService
- [ ] Update `/components/recipes/AddProductDialog.js` - use recipeService

### Update Analytics Components
- [ ] Update `/pages/index.js` - use analyticsService
- [ ] Update all analytics components - use analyticsService

---

## 2.5 Testing Service Layer

- [ ] Test orderService - all methods work correctly
- [ ] Test ingredientService - all methods work correctly
- [ ] Test recipeService - all methods work correctly
- [ ] Test packagingService - all methods work correctly
- [ ] Test customerService - all methods work correctly
- [ ] Test analyticsService - all methods work correctly
- [ ] Test custom hooks render without errors
- [ ] Test auto-refresh in useOrderQueue
- [ ] Verify no regression in existing features
- [ ] Run full test suite

---

## 2.6 Documentation

- [ ] Add JSDoc comments to all service methods
- [ ] Document hook usage with examples
- [ ] Update `/docs/API.md` with service layer info
- [ ] Create code examples for common patterns

---

## 2.7 Commit Changes

- [ ] Commit with message: "feat: Add service layer and custom hooks for data management"

---

## Benefits
✅ Centralized API calls - easier to maintain
✅ Reduced code duplication
✅ Consistent error handling
✅ Easier to test business logic
✅ Components focused on UI only
✅ Reusable hooks across components
