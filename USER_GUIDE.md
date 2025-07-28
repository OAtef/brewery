# 📋 Complete User Guide: Operating Your Order Management System

## 🚀 Getting Started

### Prerequisites
1. Make sure your application is running: `npm run dev`
2. Database should be seeded with initial data
3. Access the application at `http://localhost:3000`

---

## 📦 Step 1: Setting Up Products

### 1.1 Access Product Management
- Navigate to `http://localhost:3000/inventory`
- You'll see the **Inventory Management** interface

### 1.2 Add New Products
1. **Click "Add Product" button**
2. **Fill in Product Details:**
   - **Name**: e.g., "Latte", "Espresso", "Cold Brew"
   - **Category**: e.g., "Espresso", "Cold Coffee", "Hot Coffee"
   - **Base Price**: e.g., 4.50 (this is the starting price)
   - **Description**: e.g., "Rich espresso with steamed milk"
   - **Is Active**: Check to make it available for orders

3. **Click "Add Product"** to save

### 1.3 Verify Products
- Your new products will appear in the product list
- Each product shows: Name, Category, Base Price, Status (Active/Inactive)

---

## 📋 Step 2: Setting Up Packaging Options

### 2.1 Access Packaging Management
- From the inventory page, look for packaging management section
- Or navigate directly via the menu

### 2.2 Available Packaging Types
You should already have these packaging options:
- **Small Cup (8oz)** - $0.15
- **Medium Cup (12oz)** - $0.20  
- **Large Cup (16oz)** - $0.25
- **Extra Large Cup (20oz)** - $0.30
- **To-Go Container** - $0.35

### 2.3 Add More Packaging (if needed)
1. **Click "Add Packaging"**
2. **Fill in details:**
   - **Type**: e.g., "Specialty Mug (14oz)"
   - **Cost Per Unit**: e.g., 0.40
   - **Current Stock**: e.g., 100

---

## 🛒 Step 3: Creating Orders (Customer-Facing Process)

### 3.1 Access the Main Ordering Interface
- Navigate to `http://localhost:3000`
- This is your main customer interface

### 3.2 Add Products to Cart
1. **Browse Available Products**
   - You'll see all active products with their base prices
   - Products display: Name, Category, Description, Base Price

2. **Select a Product**
   - Click on a product or "Add to Cart" button
   - This opens the **ProductSelector Dialog**

3. **Choose Product Options**
   - **Variant**: Select from available recipes/variants (if any)
   - **Packaging**: Choose cup size (Small, Medium, Large, etc.)
   - **Quantity**: Select how many you want
   - **See Price Update**: Total price updates automatically
     - Base Price + Variant Modifier + Packaging Cost = Total

4. **Add to Cart**
   - Click "Add to Cart" to confirm
   - Product appears in your cart (cart icon shows item count)

### 3.3 Review Cart
1. **Open Cart Drawer**
   - Click the cart icon (usually top-right)
   - Review all items, quantities, and prices

2. **Modify Items (if needed)**
   - Update quantities
   - Remove items
   - See total automatically update

3. **Proceed to Checkout**
   - Click "Checkout" or "Place Order"

---

## 👨‍💼 Step 4: Staff Order Management

### 4.1 Access Order Management Dashboard
- Navigate to `http://localhost:3000/orders`
- This is the **staff interface** for managing orders

### 4.2 View All Orders
You'll see a comprehensive table with:
- **Order ID**
- **Customer Name** 
- **Total Amount**
- **Status** (PENDING, CONFIRMED, PREPARING, READY, COMPLETED)
- **Created Date**
- **Actions**

### 4.3 Process Orders
1. **Update Order Status**
   - Click the status dropdown for any order
   - Select new status:
     - **PENDING** → **CONFIRMED** (order accepted)
     - **CONFIRMED** → **PREPARING** (started making)
     - **PREPARING** → **READY** (order complete, ready for pickup)
     - **READY** → **COMPLETED** (customer received order)

2. **View Order Details**
   - Click "View Details" on any order
   - See complete order information:
     - Customer details
     - All products ordered
     - Quantities and pricing
     - Special notes (if any)

3. **Filter Orders**
   - Use status filters to show only specific order types
   - Filter by date ranges
   - Search by customer name

---

## 🔄 Complete Workflow Example

Let me walk you through a complete example:

### Scenario: Customer Orders 2 Lattes

#### **Step 1: Customer Places Order**
1. Customer visits `http://localhost:3000`
2. Sees "Latte" product (Base Price: $4.50)
3. Clicks "Add to Cart"
4. **ProductSelector opens:**
   - Variant: "Regular" (no extra cost)
   - Packaging: Selects "Large Cup (16oz)" (+$0.25)
   - Quantity: 2
   - **Total shows: 2 × ($4.50 + $0.25) = $9.50**
5. Clicks "Add to Cart"
6. Opens cart, reviews order, clicks "Checkout"
7. **Order creation process:**
   - System creates customer record
   - Creates order with PENDING status
   - Links products with chosen packaging

#### **Step 2: Staff Processes Order**
1. Staff member goes to `http://localhost:3000/orders`
2. Sees new order in PENDING status
3. **Order progression:**
   - Changes status to **CONFIRMED** (order accepted)
   - Changes status to **PREPARING** (making the lattes)
   - Changes status to **READY** (lattes finished)
   - Changes status to **COMPLETED** (customer picked up)

---

## 💡 Pro Tips for Efficient Operation

### For Setting Up Products:
- **Start with core items** (basic coffees, teas)
- **Set competitive base prices** 
- **Use clear, appetizing descriptions**
- **Keep active products updated**

### For Managing Orders:
- **Check orders frequently** during busy periods
- **Use status updates consistently** to track progress
- **Review order details** if customers have questions
- **Keep completed orders** for sales reporting

### For Customer Experience:
- **Ensure accurate pricing** (base + modifiers + packaging)
- **Keep packaging stocked** to avoid disappointments
- **Train staff** on the status progression system

---

## 🚨 Troubleshooting Common Issues

### "No products showing"
- Check if products are marked as "Active"
- Verify products exist in inventory management

### "Can't add to cart"
- Ensure packaging options are available
- Check if product has proper pricing set

### "Order not updating"
- Refresh the orders page
- Check if you have proper staff permissions

### "Pricing seems wrong"
- Verify: Base Price + Variant Modifier + Packaging Cost
- Check packaging costs in inventory management

---

## 📊 System Capabilities Summary

Your system now supports:
- ✅ **Product catalog management**
- ✅ **Dynamic pricing with packaging options**
- ✅ **Customer order placement**
- ✅ **Staff order management dashboard**
- ✅ **Order status tracking workflow**
- ✅ **Customer and order history**
- ✅ **Inventory tracking integration**

**You're now ready to run your coffee shop/brewery efficiently!** 🎉
