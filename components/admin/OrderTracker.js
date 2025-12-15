import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Chip,
    Button,
    Stack,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

export default function OrderTracker() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
    const [bulkDeleteStatus, setBulkDeleteStatus] = useState('');
    const [bulkDeleteDateFrom, setBulkDeleteDateFrom] = useState('');
    const [bulkDeleteDateTo, setBulkDeleteDateTo] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/analytics/order-queue');
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            // Flatten the ordersByStatus object or use the main orders array if available
            // The API seems to return { ordersByStatus: { pending: [], ... }, queueStats: ... }
            // We want to show active orders (pending, preparing, ready)

            let activeOrders = [];
            if (data.ordersByStatus) {
                activeOrders = [
                    ...data.ordersByStatus.pending,
                    ...data.ordersByStatus.preparing,
                    ...data.ordersByStatus.ready
                ];
            } else if (Array.isArray(data.orders)) {
                activeOrders = data.orders;
            }

            // Sort by creation time (oldest first)
            activeOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setOrders(activeOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch('/api/analytics/order-queue', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            fetchOrders(); // Refresh immediately
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'PREPARING': return 'info';
            case 'READY': return 'success';
            default: return 'default';
        }
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'PENDING': return 'PREPARING';
            case 'PREPARING': return 'READY';
            case 'READY': return 'COMPLETED';
            default: return null;
        }
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const handleDeleteOrder = async (orderId) => {
        if (!confirm(`Are you sure you want to delete order #${orderId}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete order');
            }

            showNotification('Order deleted successfully');
            fetchOrders(); // Refresh the list
        } catch (err) {
            console.error('Error deleting order:', err);
            showNotification('Failed to delete order', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (!bulkDeleteStatus && !bulkDeleteDateFrom && !bulkDeleteDateTo) {
            showNotification('Please select status or date range', 'warning');
            return;
        }

        const confirmMsg = bulkDeleteStatus
            ? `Delete all ${bulkDeleteStatus} orders?`
            : `Delete all orders between ${bulkDeleteDateFrom || 'start'} and ${bulkDeleteDateTo || 'now'}?`;

        if (!confirm(confirmMsg)) {
            return;
        }

        try {
            const response = await fetch('/api/orders/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: bulkDeleteStatus || undefined,
                    dateFrom: bulkDeleteDateFrom || undefined,
                    dateTo: bulkDeleteDateTo || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete orders');
            }

            const data = await response.json();
            showNotification(data.message);
            setBulkDeleteDialog(false);
            setBulkDeleteStatus('');
            setBulkDeleteDateFrom('');
            setBulkDeleteDateTo('');
            fetchOrders(); // Refresh the list
        } catch (err) {
            console.error('Error bulk deleting orders:', err);
            showNotification('Failed to delete orders', 'error');
        }
    };

    if (loading && orders.length === 0) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Kitchen Display System
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => setBulkDeleteDialog(true)}
                        color="error"
                        variant="outlined"
                    >
                        Bulk Delete
                    </Button>
                    <Button startIcon={<RefreshIcon />} onClick={fetchOrders}>
                        Refresh
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {orders.map((order) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                        <Card
                            elevation={3}
                            sx={{
                                borderTop: 4,
                                borderColor: `${getStatusColor(order.status)}.main`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start' }}>
                                    <Typography variant="h6">#{order.id}</Typography>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip
                                            label={order.status}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteOrder(order.id)}
                                            sx={{ ml: 1 }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Client: {order.client?.name || 'Guest'}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                    <Typography variant="body2">
                                        {new Date(order.createdAt).toLocaleTimeString()} ({order.timeSinceOrder}m ago)
                                    </Typography>
                                </Box>

                                <Stack spacing={1} sx={{ mb: 2 }}>
                                    {order.products?.map((item, idx) => {
                                        // Build variant display text
                                        const variantNames = [];
                                        if (item.selectedVariants && item.selectedVariants.length > 0) {
                                            item.selectedVariants.forEach(v => {
                                                if (v.variantOption?.name) {
                                                    variantNames.push(v.variantOption.name);
                                                }
                                            });
                                        } else if (item.recipe?.variant) {
                                            // Legacy support
                                            variantNames.push(item.recipe.variant);
                                        }

                                        return (
                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                                <LocalCafeIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'text.secondary' }} />
                                                <Box>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {item.quantity}x {item.product?.name || item.recipe?.product?.name}
                                                    </Typography>
                                                    {variantNames.length > 0 && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '12px' }}>
                                                            ({variantNames.join(', ')})
                                                        </Typography>
                                                    )}
                                                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                                                        <Box sx={{ mt: 0.5 }}>
                                                            {item.selectedExtras.map((extra, i) => (
                                                                <Typography
                                                                    key={i}
                                                                    variant="body2"
                                                                    color="success.main"
                                                                    sx={{ fontSize: '12px', fontWeight: 500 }}
                                                                >
                                                                    + {extra.extra?.name || 'Extra'}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </CardContent>

                            <Box sx={{ p: 2, pt: 0 }}>
                                {getNextStatus(order.status) && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color={getStatusColor(getNextStatus(order.status))}
                                        onClick={() => updateStatus(order.id, getNextStatus(order.status))}
                                        startIcon={<CheckCircleIcon />}
                                    >
                                        Mark as {getNextStatus(order.status)}
                                    </Button>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}

                {orders.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                            <CheckCircleIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6">All caught up!</Typography>
                            <Typography>No active orders at the moment.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Bulk Delete Dialog */}
            <Dialog open={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Delete Orders</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Delete orders by status and/or date range. Use with caution!
                    </Typography>

                    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                        <InputLabel>Status (Optional)</InputLabel>
                        <Select
                            value={bulkDeleteStatus}
                            label="Status (Optional)"
                            onChange={(e) => setBulkDeleteStatus(e.target.value)}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="PENDING">PENDING</MenuItem>
                            <MenuItem value="PREPARING">PREPARING</MenuItem>
                            <MenuItem value="READY">READY</MenuItem>
                            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="From Date (Optional)"
                        type="date"
                        value={bulkDeleteDateFrom}
                        onChange={(e) => setBulkDeleteDateFrom(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="To Date (Optional)"
                        type="date"
                        value={bulkDeleteDateTo}
                        onChange={(e) => setBulkDeleteDateTo(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkDeleteDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleBulkDelete}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteSweepIcon />}
                    >
                        Delete Orders
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
