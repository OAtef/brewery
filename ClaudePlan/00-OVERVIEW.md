# Coffee Shop Application Reorganization & Production-Ready Plan

## Project Goals

### 1. File Organization (Medium Priority)
Reorganize scattered files into a clean, maintainable structure that's easy to navigate.

### 2. Production-Ready Features (High Priority)
Create dedicated cashier and barista displays for real-world coffee shop operations and events.

---

## Implementation Phases

- [ ] **Phase 1**: File Organization & Code Structure (1-2 days)
- [ ] **Phase 2**: Service Layer & Custom Hooks (1 day)
- [ ] **Phase 3**: Database Updates (1 day)
- [ ] **Phase 4**: Cashier Display Development (2-3 days)
- [ ] **Phase 5**: Barista Display Development (2-3 days)
- [ ] **Phase 6**: API Development (1-2 days)
- [ ] **Phase 7**: Testing & Refinement (2-3 days)

**Total Estimated Time**: 11-16 days (2-3 weeks)

---

## Key Requirements

### User Requirements Summary
- **Display Setup**: Single device with role switching (login-based)
- **Cashier Features**:
  - Create new orders (POS interface)
  - View order queue status
  - Handle payments & receipts
  - Manage customer info
- **Barista Features**:
  - View order queue (incoming orders)
  - Mark order status (preparing/ready)
  - View order details & recipes
- **Connectivity**: Mobile hotspot (always online) - no offline mode needed

---

## Progress Tracking

See individual phase files for detailed todo lists:
- `01-file-organization.md`
- `02-service-layer.md`
- `03-database-updates.md`
- `04-cashier-display.md`
- `05-barista-display.md`
- `06-api-development.md`
- `07-testing-refinement.md`

---

## Final Target Structure

```
my-threejs-project/
├── components/
│   ├── layout/          # Layout, Navigation, NotificationProvider
│   ├── auth/            # ProtectedRoute, ClientProtectedRoute, LoginPopup
│   ├── inventory/       # InventoryManagement + dialogs
│   ├── recipes/         # RecipeManagement + dialogs
│   ├── orders/          # ProductSelector, VariantSelector, CartDrawer
│   ├── analytics/       # All dashboard analytics components
│   ├── 3d/              # ThreeScene
│   ├── pos/             # NEW: Cashier POS components
│   └── barista/         # NEW: Barista queue components
├── lib/
│   ├── services/        # NEW: API service layer
│   ├── hooks/           # NEW: Custom React hooks
│   └── api/             # NEW: API client wrapper
├── scripts/             # NEW: Organized scripts
│   ├── testing/
│   ├── database/
│   └── utilities/
└── docs/                # NEW: All documentation
```
