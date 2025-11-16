# Phase 1: File Organization & Code Structure

**Estimated Time**: 1-2 days
**Priority**: Medium

---

## 1.1 Create New Directory Structure

### Components Reorganization
- [ ] Create `/components/layout/` directory
- [ ] Create `/components/auth/` directory
- [ ] Create `/components/inventory/` directory
- [ ] Create `/components/recipes/` directory
- [ ] Create `/components/orders/` directory
- [ ] Create `/components/analytics/` directory
- [ ] Create `/components/3d/` directory
- [ ] Create `/components/pos/` directory (for future cashier components)
- [ ] Create `/components/barista/` directory (for future barista components)

### Library Reorganization
- [ ] Create `/lib/services/` directory
- [ ] Create `/lib/hooks/` directory
- [ ] Create `/lib/api/` directory

### Scripts Reorganization
- [ ] Create `/scripts/` directory
- [ ] Create `/scripts/testing/` subdirectory
- [ ] Create `/scripts/database/` subdirectory
- [ ] Create `/scripts/utilities/` subdirectory

### Documentation Reorganization
- [ ] Create `/docs/` directory

---

## 1.2 Move Components to Feature Folders

### Layout Components
- [ ] Move `Layout.js` → `/components/layout/Layout.js`
- [ ] Move `NotificationProvider.js` → `/components/layout/NotificationProvider.js`

### Auth Components
- [ ] Move `ProtectedRoute.js` → `/components/auth/ProtectedRoute.js`
- [ ] Move `ClientProtectedRoute.js` → `/components/auth/ClientProtectedRoute.js`
- [ ] Move `LoginPopup.js` → `/components/auth/LoginPopup.js`

### Inventory Components
- [ ] Move `InventoryManagement.js` → `/components/inventory/InventoryManagement.js`
- [ ] Move `AddIngredientDialog.js` → `/components/inventory/AddIngredientDialog.js`
- [ ] Move `EditIngredientDialog.js` → `/components/inventory/EditIngredientDialog.js`
- [ ] Move `AddPackageDialog.js` → `/components/inventory/AddPackageDialog.js`

### Recipe Components
- [ ] Move `RecipeManagement.js` → `/components/recipes/RecipeManagement.js`
- [ ] Move `AddRecipeDialog.js` → `/components/recipes/AddRecipeDialog.js`
- [ ] Move `EditRecipeDialog.js` → `/components/recipes/EditRecipeDialog.js`
- [ ] Move `AddProductDialog.js` → `/components/recipes/AddProductDialog.js`

### Order Components
- [ ] Move `ProductSelector.js` → `/components/orders/ProductSelector.js`
- [ ] Move `VariantSelector.js` → `/components/orders/VariantSelector.js`
- [ ] Move `CartDrawer.js` → `/components/orders/CartDrawer.js`

### Analytics Components
- [ ] Move `LowStockWarnings.js` → `/components/analytics/LowStockWarnings.js`
- [ ] Move `WasteTracking.js` → `/components/analytics/WasteTracking.js`
- [ ] Move `CostAnalysis.js` → `/components/analytics/CostAnalysis.js`
- [ ] Move `OrderProcessingTime.js` → `/components/analytics/OrderProcessingTime.js`
- [ ] Move `RevenueTrends.js` → `/components/analytics/RevenueTrends.js`

### 3D Components
- [ ] Move `ThreeScene.js` → `/components/3d/ThreeScene.js`

---

## 1.3 Move Test Scripts

- [ ] Move `test-api-endpoints.js` → `/scripts/testing/test-api-endpoints.js`
- [ ] Move `test-data.sql` → `/scripts/testing/test-data.sql`
- [ ] Move `test-fixed-apis.js` → `/scripts/testing/test-fixed-apis.js`
- [ ] Move `test-order-functionality.js` → `/scripts/testing/test-order-functionality.js`
- [ ] Move `test-order-system.sh` → `/scripts/testing/test-order-system.sh`
- [ ] Move `test-recipe-management.js` → `/scripts/testing/test-recipe-management.js`
- [ ] Move `test-units.js` → `/scripts/testing/test-units.js`
- [ ] Move `validate-api-only.sh` → `/scripts/testing/validate-api-only.sh`
- [ ] Move `validate-workflow.js` → `/scripts/testing/validate-workflow.js`

---

## 1.4 Move Database Scripts

- [ ] Move `seed-database.js` → `/scripts/database/seed-database.js`
- [ ] Move `ensure-admin.js` → `/scripts/database/ensure-admin.js`
- [ ] Move `create-test-orders.js` → `/scripts/database/create-test-orders.js`
- [ ] Move `cleanup-duplicate-products.js` → `/scripts/database/cleanup-duplicate-products.js`
- [ ] Move `backup.sql` → `/scripts/database/backup-restore/backup.sql`

---

## 1.5 Consolidate Documentation

- [ ] Move `README.md` → `/docs/README.md` (copy, keep root README with quick links)
- [ ] Move `USER_GUIDE.md` → `/docs/USER-GUIDE.md`
- [ ] Move `ORDER_IMPLEMENTATION_SUMMARY.md` → `/docs/ORDER-IMPLEMENTATION.md`
- [ ] Move `VARIANT_FIX_SUMMARY.md` → `/docs/VARIANT-FIX.md`
- [ ] Move `CI-CD-NO-RESTRICTIONS.md` → `/docs/CI-CD.md`
- [ ] Create `/docs/API.md` (new API documentation)
- [ ] Create `/docs/DEPLOYMENT.md` (new deployment guide)
- [ ] Update root `README.md` with links to docs folder

---

## 1.6 Update All Import Statements

### Update imports in pages/
- [ ] Update `/pages/index.js` - analytics component imports
- [ ] Update `/pages/inventory/index.js` - inventory component imports
- [ ] Update `/pages/recipes/index.js` - recipe component imports
- [ ] Update `/pages/orders/index.js` - order component imports
- [ ] Update `/pages/orders/new.js` - order component imports
- [ ] Update `/pages/menu.js` - component imports
- [ ] Update `/pages/scene.js` - ThreeScene import
- [ ] Update `/pages/_app.js` - Layout and NotificationProvider imports

### Update imports in components/
- [ ] Update all moved components that import other components
- [ ] Update Layout component imports (used across app)

---

## 1.7 Testing After Reorganization

- [ ] Start development server (`npm run dev`)
- [ ] Test dashboard page loads correctly
- [ ] Test inventory page loads and functions
- [ ] Test recipes page loads and functions
- [ ] Test orders page loads and functions
- [ ] Test new order creation works
- [ ] Test menu page loads
- [ ] Test 3D scene page loads
- [ ] Test authentication flow works
- [ ] Run existing test suite (`npm test`)
- [ ] Fix any broken imports or tests

---

## 1.8 Clean Up

- [ ] Remove old empty `/components/` root files (if all moved)
- [ ] Remove old test script files from root (if all moved)
- [ ] Remove old database script files from root (if all moved)
- [ ] Update `.gitignore` if needed
- [ ] Commit changes with message: "refactor: Reorganize project structure into feature-based folders"

---

## Notes
- Create a backup or commit current state before starting
- Update imports incrementally and test frequently
- Keep the original files until all imports are verified working
- Use find & replace carefully for import path updates
