# Phase 5: Barista Display Development

**Estimated Time**: 2-3 days
**Priority**: High (Production Critical)

---

## 5.1 Create Barista Page Structure

### Create Main Barista Page
- [ ] Create `/pages/barista.js`
- [ ] Add role-based protection (ADMIN, MANAGER, BARISTA)
- [ ] Import ProtectedRoute wrapper
- [ ] Set up full-screen layout optimized for queue display
- [ ] Add simple header with user info and logout
- [ ] Design for tablet/monitor viewing (landscape preferred)

### Page Layout Structure
```
┌─────────────────────────────────────────┐
│  Barista Queue - [Name] [Logout]       │
│  [🔔] 5 Orders | Avg Time: 8 min       │
├─────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │Order │ │Order │ │Order │ │Order │  │
│  │ #101 │ │ #102 │ │ #103 │ │ #104 │  │
│  │Urgent│ │Normal│ │Normal│ │Ready │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  [More orders scroll horizontally...]  │
└─────────────────────────────────────────┘
```

---

## 5.2 Create Order Queue Hook

### Create useOrderQueue Hook (Enhanced)
- [ ] Create or enhance `/lib/hooks/useOrderQueue.js`
- [ ] Fetch orders with status: PENDING, CONFIRMED, PREPARING, READY
- [ ] Auto-refresh every 10 seconds (configurable)
- [ ] Sort by priority (urgent → high → normal) then by createdAt
- [ ] Calculate metrics:
  - Total orders in queue
  - Average processing time
  - Overdue orders count (>15 min in PENDING)
- [ ] Return: { orders, loading, error, refresh, metrics }
- [ ] Add manual refresh function
- [ ] Add pause/resume auto-refresh

---

## 5.3 Create Order Card Component

### Create BaristaOrderCard Component
- [ ] Create `/components/barista/BaristaOrderCard.js`
- [ ] Large card design (min 250px width, 300px height)
- [ ] Display order information:
  - Order number (large, bold)
  - Customer name
  - Time since order created (e.g., "5 min ago")
  - Priority badge (if urgent/high)
  - Current status
- [ ] Color-coded border/background:
  - Red: Overdue (>15 min in PENDING)
  - Yellow: Urgent priority
  - Orange: High priority
  - Green: Normal
  - Blue: Ready for pickup
- [ ] Show product count badge (e.g., "3 items")
- [ ] Click to expand full details
- [ ] Touch-optimized (large tap target)

---

## 5.4 Create Order Detail Modal

### Create OrderDetailModal Component
- [ ] Create `/components/barista/OrderDetailModal.js`
- [ ] Full-screen or large modal dialog
- [ ] Header section:
  - Order number
  - Customer name
  - Customer address (for delivery context)
  - Order created time
  - Current status
  - Priority level
- [ ] Product list section:
  - For each product:
    - Product name (large, bold)
    - Variant name (if applicable)
    - Packaging type
    - Quantity (very prominent)
    - Special notes (if any)
- [ ] Recipe details section:
  - Expand to show ingredient breakdown
  - Show quantities for each ingredient
  - Helpful for training new baristas
- [ ] Action buttons at bottom:
  - "Start Preparing" (PENDING → PREPARING)
  - "Mark Ready" (PREPARING → READY)
  - "Mark Completed" (READY → COMPLETED)
  - "Back to Queue" (close modal)

---

## 5.5 Create Queue Header Component

### Create QueueHeader Component
- [ ] Create `/components/barista/QueueHeader.js`
- [ ] Display queue statistics:
  - Total orders count
  - Orders by status (PENDING: 3, PREPARING: 2, READY: 1)
  - Average processing time
  - Overdue orders count (alert if > 0)
- [ ] Add refresh button (manual refresh)
- [ ] Add auto-refresh indicator (spinning icon when refreshing)
- [ ] Add filter controls:
  - Show All
  - Show Pending Only
  - Show Preparing Only
  - Show Ready Only
- [ ] Add sound toggle (enable/disable notification sounds)

---

## 5.6 Create Status Update Functionality

### Create useOrderStatus Hook
- [ ] Create `/lib/hooks/useOrderStatus.js`
- [ ] Function: `updateStatus(orderId, newStatus)`
- [ ] Call orderService.updateOrderStatus()
- [ ] Add timestamp tracking:
  - If PENDING → PREPARING: set `startedAt`
  - If PREPARING → READY: set `readyAt`
  - If READY → COMPLETED: set `completedAt`
- [ ] Show success notification
- [ ] Refresh queue after update
- [ ] Handle errors gracefully

### Quick Status Buttons
- [ ] Large, color-coded buttons
- [ ] "Start Preparing" - Green, only shown for PENDING orders
- [ ] "Mark Ready" - Blue, only shown for PREPARING orders
- [ ] "Mark Completed" - Gray, only shown for READY orders
- [ ] Confirmation dialog for status changes (optional, can skip for speed)

---

## 5.7 Implement Main Barista Page

### Integrate All Components
- [ ] Import all barista components into `/pages/barista.js`
- [ ] Use `useOrderQueue()` hook for data
- [ ] Display QueueHeader at top
- [ ] Display order cards in horizontal scrollable list
- [ ] Implement card click → open OrderDetailModal
- [ ] Handle status updates from modal
- [ ] Show loading state while fetching
- [ ] Show empty state if no orders
- [ ] Auto-scroll to newest order (optional)

### Layout Considerations
- [ ] Horizontal scroll for order cards (better for wide screens)
- [ ] Sticky header (stays visible while scrolling)
- [ ] Large spacing between cards (easy to distinguish)
- [ ] Grid layout option (2-3 rows, scrollable columns)

---

## 5.8 Add Sound Notifications

### Create Notification Sound Component
- [ ] Create `/components/barista/SoundNotification.js`
- [ ] Use Web Audio API or HTML5 audio
- [ ] Add sound file to `/public/sounds/new-order.mp3` (gentle chime)
- [ ] Play sound when new order detected
- [ ] Compare previous order count vs current
- [ ] Toggle on/off based on user preference (localStorage)
- [ ] Add volume control (optional)

### Integration
- [ ] Detect new orders in useOrderQueue hook
- [ ] Trigger sound notification
- [ ] Show visual flash/animation for new orders
- [ ] Store sound preference in localStorage

---

## 5.9 Add Priority Indicators

### Visual Priority System
- [ ] Urgent orders: Red border, red badge, pulse animation
- [ ] High priority: Orange border, orange badge
- [ ] Normal: Green border (default)
- [ ] Overdue (>15 min): Red background, warning icon

### Priority Sorting
- [ ] Sort logic in useOrderQueue:
  1. Status (PENDING first, then PREPARING, then READY)
  2. Priority level (urgent → high → normal)
  3. Time since created (oldest first)
- [ ] Ensure urgent orders always appear first

---

## 5.10 Add Recipe Guidance Feature

### Recipe Display in Order Details
- [ ] Show full recipe breakdown for each product
- [ ] List ingredients with quantities
- [ ] Show preparation steps (if available in DB)
- [ ] Helpful for new baristas or complex drinks
- [ ] Collapsible sections (show/hide per product)

### Enhancement (Optional)
- [ ] Add recipe images (future)
- [ ] Add preparation time estimate per product
- [ ] Highlight special ingredients

---

## 5.11 Add Timer Display

### Order Timer Component
- [ ] Create `/components/barista/OrderTimer.js`
- [ ] Calculate elapsed time since order created
- [ ] Display as "X min ago" or "MM:SS"
- [ ] Update every second (or every 10 seconds for performance)
- [ ] Color-code based on age:
  - Green: 0-5 min
  - Yellow: 5-10 min
  - Orange: 10-15 min
  - Red: 15+ min

### Integration
- [ ] Add timer to OrderCard component
- [ ] Add timer to OrderDetailModal
- [ ] Use React hooks for real-time updates

---

## 5.12 Handle Edge Cases

### Empty Queue State
- [ ] Show friendly message: "No orders in queue!"
- [ ] Display motivational message or shop logo
- [ ] Auto-refresh continues in background

### Error Handling
- [ ] Network error: Show banner, allow manual refresh
- [ ] Failed status update: Show error, allow retry
- [ ] API timeout: Show notification, continue auto-refresh

### Performance Optimization
- [ ] Limit displayed orders (e.g., show last 20)
- [ ] Pagination or "Load More" for older orders
- [ ] Optimize re-renders (React.memo for cards)
- [ ] Debounce auto-refresh if needed

---

## 5.13 Testing Barista Display

### Functional Testing
- [ ] Test order queue loads correctly
- [ ] Test auto-refresh works (10s interval)
- [ ] Test manual refresh button
- [ ] Test card click opens details modal
- [ ] Test "Start Preparing" button (PENDING → PREPARING)
- [ ] Test "Mark Ready" button (PREPARING → READY)
- [ ] Test "Mark Completed" button (READY → COMPLETED)
- [ ] Test order priority sorting
- [ ] Test color coding by priority/status
- [ ] Test timer displays and updates
- [ ] Test sound notification for new orders
- [ ] Test sound toggle (on/off)
- [ ] Test filter controls (show pending only, etc.)
- [ ] Test recipe details display

### Edge Cases
- [ ] Test with 0 orders (empty state)
- [ ] Test with 50+ orders (performance)
- [ ] Test network disconnection (error handling)
- [ ] Test concurrent status updates (multiple baristas)
- [ ] Test with very old orders (timer accuracy)

### Tablet Testing
- [ ] Test on iPad/Android tablet (landscape mode)
- [ ] Verify cards are readable from 2-3 feet away
- [ ] Test touch interactions (tap, scroll)
- [ ] Test auto-refresh doesn't cause lag
- [ ] Verify sound plays on tablet speakers
- [ ] Test in bright/dim lighting (contrast)

### Multi-Device Testing
- [ ] Test with cashier and barista displays open simultaneously
- [ ] Verify real-time updates work across devices
- [ ] Test order flow: Cashier creates → Barista sees immediately
- [ ] Test status updates reflect on both displays

---

## 5.14 Styling & UX Polish

### Visual Design
- [ ] Large, bold typography (20px+ for order numbers)
- [ ] High contrast colors for readability
- [ ] Clear status indicators (icons + colors)
- [ ] Smooth animations for status changes
- [ ] Loading skeletons while fetching
- [ ] Success/error notifications (toast style)

### Touch Optimization
- [ ] Minimum 60px×60px touch targets
- [ ] Swipe gestures for status changes (optional)
- [ ] Long-press for quick actions (optional)
- [ ] Prevent accidental double-taps

### Accessibility
- [ ] Keyboard navigation (tab through orders)
- [ ] ARIA labels for status buttons
- [ ] Screen reader announcements for new orders
- [ ] Focus indicators

---

## 5.15 Add Fullscreen Mode (Optional)

### Fullscreen Toggle
- [ ] Add fullscreen button in header
- [ ] Use Fullscreen API (document.documentElement.requestFullscreen())
- [ ] Hide browser UI for dedicated display mode
- [ ] Show exit fullscreen button when active

---

## 5.16 Documentation

- [ ] Update `/docs/USER-GUIDE.md` with Barista Display section
- [ ] Document queue workflow
- [ ] Document status update process
- [ ] Document priority system
- [ ] Document sound notifications
- [ ] Add screenshots of barista display

---

## 5.17 Commit Changes

- [ ] Test thoroughly on desktop, tablet, and mobile
- [ ] Verify auto-refresh doesn't cause performance issues
- [ ] Test with real order data
- [ ] Commit with message: "feat: Add barista queue display with auto-refresh and status management"

---

## Benefits
✅ Real-time order queue visibility
✅ Auto-refresh every 10 seconds
✅ Priority-based sorting
✅ Large, touch-friendly interface
✅ Quick status updates
✅ Recipe guidance for baristas
✅ Sound notifications for new orders
✅ Timer to track order age
✅ Optimized for tablet displays
✅ Professional barista experience
✅ Ready for production use at events
