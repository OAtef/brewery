import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Collapse,
    TextField,
    Button,
    InputAdornment,
    CircularProgress,
    Alert,
    Snackbar,
    Chip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';

import ProductDialog from './ProductDialog';
import ExtrasDialog from './ExtrasDialog';
import EditProductDialog from './EditProductDialog';

function ProductRow({ product, onUpdatePrice, onEditProduct }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [basePrice, setBasePrice] = useState(product.basePrice);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await onUpdatePrice('product', product.id, basePrice);
        setLoading(false);
        setEditing(false);
    };

    // Use variantGroups if available, otherwise fall back to recipes (legacy)
    const hasVariants = product.variantGroups && product.variantGroups.length > 0;

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {product.name}
                </TableCell>
                <TableCell>
                    {product.category?.name || product.categoryName || (typeof product.category === 'string' ? product.category : '')}
                </TableCell>
                <TableCell>
                    {editing ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                size="small"
                                type="number"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                sx={{ width: 100 }}
                            />
                            <IconButton size="small" onClick={handleSave} disabled={loading}>
                                <SaveIcon color="primary" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>${parseFloat(product.basePrice).toFixed(2)}</Typography>
                            <IconButton size="small" onClick={() => setEditing(true)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </TableCell>
                <TableCell>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => onEditProduct(product)}
                    >
                        Edit
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Variants & Options
                            </Typography>

                            {hasVariants ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {product.variantGroups.map((group) => (
                                        <Box key={group.id} sx={{ mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                {group.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                {group.options.map((option) => (
                                                    <Chip
                                                        key={option.id}
                                                        label={`${option.name} ${option.priceAdjustment > 0 ? `(+$${option.priceAdjustment.toFixed(2)})` : ''}`}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    No variants defined.
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function ProductManager() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Dialog states
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [openExtrasDialog, setOpenExtrasDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');
            const data = await response.json();
            if (response.ok) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setNotification({ open: true, message: 'Failed to load products', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleUpdatePrice = async (type, id, price) => {
        try {
            const response = await fetch('/api/products/update-price', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, id, price }),
            });

            if (!response.ok) throw new Error('Failed to update price');

            setNotification({ open: true, message: 'Price updated successfully', severity: 'success' });
            fetchProducts(); // Refresh data
        } catch (error) {
            console.error('Error updating price:', error);
            setNotification({ open: true, message: 'Failed to update price', severity: 'error' });
        }
    };

    const handleCreateProduct = async (productData) => {
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (!response.ok) throw new Error('Failed to create product');

            setNotification({ open: true, message: 'Product created successfully', severity: 'success' });
            fetchProducts();
        } catch (error) {
            console.error('Error creating product:', error);
            setNotification({ open: true, message: 'Failed to create product', severity: 'error' });
        }
    };

    if (loading && products.length === 0) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                    Product Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ListIcon />}
                        onClick={() => setOpenExtrasDialog(true)}
                    >
                        Manage Extras
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenProductDialog(true)}
                    >
                        Add Product
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Product Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Base Price</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <ProductRow
                                key={product.id}
                                product={product}
                                onUpdatePrice={handleUpdatePrice}
                                onEditProduct={(prod) => {
                                    setSelectedProduct(prod);
                                    setOpenEditDialog(true);
                                }}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ProductDialog
                open={openProductDialog}
                onClose={() => setOpenProductDialog(false)}
                onSave={handleCreateProduct}
            />

            <ExtrasDialog
                open={openExtrasDialog}
                onClose={() => setOpenExtrasDialog(false)}
            />

            <EditProductDialog
                open={openEditDialog}
                onClose={() => {
                    setOpenEditDialog(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
                onSave={(updatedProduct) => {
                    setNotification({ open: true, message: 'Product updated successfully', severity: 'success' });
                    fetchProducts();
                }}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={3000}
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
