import React, { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
    Button,
    Dialog,
    DialogContent,
    Snackbar,
    Alert,
    TextField,
} from '@mui/material';
import ProductGrid from '../pos/ProductGrid';
import VariantSelector from '../pos/VariantSelector';
import ExtrasSelector from '../pos/ExtrasSelector';
import PackagingSelector from '../pos/PackagingSelector';
import QuantitySelector from '../pos/QuantitySelector';
import POSCart from '../pos/POSCart';
import PaymentDialog from '../pos/PaymentDialog';
import QueueStatus from '../pos/QueueStatus';
import Receipt from '../pos/Receipt';
import orderService from '../../lib/services/orderService';

export default function CashierView() {
    // Current user (from session/auth) - Hardcoded for now as per original file
    const [currentUser] = useState({ id: 1, name: 'Cashier', role: 'CASHIER' });

    // Selection state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVariants, setSelectedVariants] = useState({}); // Map: groupId -> option
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [selectedPackaging, setSelectedPackaging] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // Cart and customer
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('Guest'); // Simplified customer logic

    // Dialog states
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showReceiptDialog, setShowReceiptDialog] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);

    // Notification
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Handle product selection
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSelectedVariants({});
        setSelectedExtras([]);
        setSelectedPackaging(null);
        setQuantity(1);
    };

    const handleVariantSelect = (groupId, option) => {
        if (groupId === null) {
            // Clear all variants (Base selected)
            setSelectedVariants({});
        } else if (groupId === 'legacy') {
            // Legacy single variant support
            setSelectedVariants({ legacy: option });
        } else {
            // New variant group support
            setSelectedVariants(prev => ({
                ...prev,
                [groupId]: option
            }));
        }
    };

    // Handle add to cart
    const handleAddToCart = () => {
        if (!selectedProduct) {
            showNotification('Please select a product', 'error');
            return;
        }

        // Calculate unit price
        const basePrice = selectedProduct.basePrice || 0;

        // Sum variant prices
        const variantPrice = Object.values(selectedVariants).reduce((sum, v) => sum + (v.priceModifier || v.priceAdjustment || 0), 0);

        // Sum extra prices
        const extrasPrice = selectedExtras.reduce((sum, e) => sum + (e.price || 0), 0);

        const unitPrice = basePrice + variantPrice + extrasPrice;

        // Create cart item
        const cartItem = {
            product: selectedProduct,
            variants: selectedVariants,
            extras: selectedExtras,
            packaging: selectedPackaging || { type: 'Standard', costPerUnit: 0, id: 'default' }, // Default packaging if none selected
            quantity: quantity,
            unitPrice: unitPrice,
        };

        setCart([...cart, cartItem]);

        // Reset selections
        setSelectedProduct(null);
        setSelectedVariants({});
        setSelectedExtras([]);
        setSelectedPackaging(null);
        setQuantity(1);

        showNotification('Item added to cart', 'success');
    };

    // Handle remove item from cart
    const handleRemoveItem = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
        showNotification('Item removed from cart', 'info');
    };

    // Handle edit item (simplified - just remove and let user re-add)
    const handleEditItem = (index) => {
        const item = cart[index];
        setSelectedProduct(item.product);
        setSelectedVariants(item.variants || {});
        setSelectedExtras(item.extras || []);
        setSelectedPackaging(item.packaging);
        setQuantity(item.quantity);
        handleRemoveItem(index);
    };

    // Handle proceed to payment
    const handleProceedToPayment = () => {
        if (cart.length === 0) {
            showNotification('Cart is empty', 'error');
            return;
        }

        if (!customerName.trim()) {
            showNotification('Please enter a customer name', 'error');
            return;
        }

        setShowPaymentDialog(true);
    };

    // Handle payment completion
    const handlePaymentComplete = async (paymentData) => {
        try {
            // Calculate totals
            const subtotal = cart.reduce((sum, item) => {
                const itemPrice = item.unitPrice || 0;
                const packagingCost = item.packaging?.costPerUnit || 0;
                return sum + (itemPrice + packagingCost) * item.quantity;
            }, 0);

            const tax = subtotal * 0.08;
            const total = subtotal + tax;

            // Generate receipt number
            const receiptNumber = `RCP-${Date.now()}`;

            // Prepare order data
            const orderData = {
                client: {
                    client_number: `WALKIN-${Date.now()}`,
                    name: customerName || 'Guest',
                    address: 'N/A',
                },
                userId: currentUser.id,
                application: 'POS',

                // Pricing
                subtotal: subtotal,
                tax: tax,
                total: total,
                discount: 0,

                // Payment
                paymentMethod: paymentData.paymentMethod,
                paymentStatus: 'PAID',
                amountPaid: paymentData.amountPaid,
                changeGiven: paymentData.changeGiven,
                receiptNumber: receiptNumber,
                receiptSent: false,

                // Order management
                status: 'PENDING',
                priority: 'NORMAL',

                // Products
                products: cart.map((item) => {
                    // Flatten variants for API
                    // If legacy, use recipeId. If new, use selectedVariants array.
                    const legacyVariant = item.variants?.legacy;
                    const variantList = Object.entries(item.variants || {})
                        .filter(([key]) => key !== 'legacy')
                        .map(([_, v]) => ({ id: v.id, priceAdjustment: v.priceAdjustment }));

                    const extraList = (item.extras || []).map(e => ({ id: e.id, price: e.price }));

                    return {
                        productId: item.product.id,
                        recipeId: legacyVariant?.id || null,
                        packagingId: (!item.packaging || item.packaging.id === 'default') ? null : item.packaging.id,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        selectedVariants: variantList.length > 0 ? variantList : undefined,
                        selectedExtras: extraList.length > 0 ? extraList : undefined,
                    };
                }),
            };

            // Submit order
            const createdOrder = await orderService.createOrder(orderData);

            // Prepare receipt data
            const receiptData = {
                ...orderData,
                id: createdOrder.id,
                createdAt: createdOrder.createdAt,
                cashier: currentUser.name,
                customer: { name: customerName }, // Mock customer object
                items: cart.map((item) => {
                    // Format variant names
                    const variantNames = Object.values(item.variants || {}).map(v => v.name || v.variant).join(', ');
                    const extraNames = (item.extras || []).map(e => e.name).join(', ');

                    let name = item.product.name;
                    if (variantNames) name += ` (${variantNames})`;
                    if (extraNames) name += ` + ${extraNames}`;

                    return {
                        name: name,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        packagingCost: item.packaging.costPerUnit,
                        packaging: item.packaging.type,
                    };
                }),
            };

            setCompletedOrder(receiptData);

            // Close payment dialog
            setShowPaymentDialog(false);

            // Show receipt
            setShowReceiptDialog(true);

            // Clear cart and customer
            setCart([]);
            setCustomerName('Guest');

            showNotification('Order completed successfully!', 'success');
        } catch (error) {
            console.error('Order submission failed:', error);
            throw new Error(error.message || 'Failed to create order. Please try again.');
        }
    };

    // Show notification
    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    return (
        <Box sx={{ height: '100%', backgroundColor: 'grey.50', p: 2 }}>
            <Grid container spacing={3}>
                {/* Left Panel - Product Selection */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                            Select Products
                        </Typography>
                        <ProductGrid onProductSelect={handleProductSelect} />
                    </Box>

                    {/* Selection Steps */}
                    {selectedProduct && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {selectedProduct.name}
                            </Typography>

                            <VariantSelector
                                product={selectedProduct}
                                selectedVariants={selectedVariants}
                                onVariantSelect={handleVariantSelect}
                            />

                            <ExtrasSelector
                                selectedExtras={selectedExtras}
                                onExtrasChange={setSelectedExtras}
                            />

                            <Box sx={{ mt: 2 }}>
                                <PackagingSelector
                                    selectedPackaging={selectedPackaging}
                                    onPackagingSelect={setSelectedPackaging}
                                />
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleAddToCart}
                                sx={{ mt: 3, minHeight: '50px', fontSize: '16px', fontWeight: 600 }}
                            >
                                Add to Cart - ${(
                                    (selectedProduct.basePrice || 0) +
                                    Object.values(selectedVariants).reduce((sum, v) => sum + (v.priceModifier || v.priceAdjustment || 0), 0) +
                                    selectedExtras.reduce((sum, e) => sum + (e.price || 0), 0)
                                ).toFixed(2)}
                            </Button>
                        </Box>
                    )}

                    {/* Queue Status */}
                    <Box sx={{ mt: 3 }}>
                        <QueueStatus />
                    </Box>
                </Grid>

                {/* Right Panel - Cart & Customer */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                            Customer Name
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            size="small"
                        />
                    </Box>

                    <POSCart
                        items={cart}
                        onRemoveItem={handleRemoveItem}
                        onEditItem={handleEditItem}
                        onProceedToPayment={handleProceedToPayment}
                    />
                </Grid>
            </Grid>

            {/* Payment Dialog */}
            <PaymentDialog
                open={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                totalAmount={cart.reduce((sum, item) => {
                    const itemPrice = item.unitPrice || 0;
                    const packagingCost = item.packaging?.costPerUnit || 0;
                    const itemTotal = (itemPrice + packagingCost) * item.quantity;
                    return sum + itemTotal;
                }, 0) * 1.08} // Include 8% tax
                onPaymentComplete={handlePaymentComplete}
            />

            {/* Receipt Dialog */}
            <Dialog
                open={showReceiptDialog}
                onClose={() => setShowReceiptDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Receipt orderData={completedOrder} />
                </DialogContent>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%', fontSize: '16px' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
