import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Paper,
    Divider,
    InputAdornment,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

export default function EditProductDialog({ open, onClose, product, onSave }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [description, setDescription] = useState('');
    const [variantGroups, setVariantGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load product data when dialog opens or product changes
    useEffect(() => {
        if (open && product) {
            setName(product.name || '');
            setCategory(product.category?.name || product.categoryName || '');
            setBasePrice(product.basePrice?.toString() || '0');
            setDescription(product.description || '');

            // Load variant groups with options
            if (product.variantGroups && product.variantGroups.length > 0) {
                setVariantGroups(product.variantGroups.map(group => ({
                    id: group.id,
                    name: group.name,
                    options: group.options.map(opt => ({
                        id: opt.id,
                        name: opt.name,
                        priceAdjustment: opt.priceAdjustment.toString()
                    }))
                })));
            } else {
                setVariantGroups([]);
            }
        }
    }, [open, product]);

    const handleAddGroup = () => {
        setVariantGroups([...variantGroups, { name: '', options: [] }]);
    };

    const handleRemoveGroup = (index) => {
        const newGroups = [...variantGroups];
        newGroups.splice(index, 1);
        setVariantGroups(newGroups);
    };

    const handleGroupChange = (index, value) => {
        const newGroups = [...variantGroups];
        newGroups[index].name = value;
        setVariantGroups(newGroups);
    };

    const handleAddOption = (groupIndex) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].options.push({ name: '', priceAdjustment: '0' });
        setVariantGroups(newGroups);
    };

    const handleRemoveOption = (groupIndex, optionIndex) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].options.splice(optionIndex, 1);
        setVariantGroups(newGroups);
    };

    const handleOptionChange = (groupIndex, optionIndex, field, value) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].options[optionIndex][field] = value;
        setVariantGroups(newGroups);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Product name is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    category: category.trim(),
                    basePrice: parseFloat(basePrice) || 0,
                    description: description.trim(),
                    variantGroups: variantGroups
                        .filter(g => g.name.trim()) // Only include groups with names
                        .map(group => ({
                            name: group.name.trim(),
                            options: group.options
                                .filter(o => o.name.trim()) // Only include options with names
                                .map(opt => ({
                                    name: opt.name.trim(),
                                    priceAdjustment: parseFloat(opt.priceAdjustment) || 0
                                }))
                        }))
                        .filter(g => g.options.length > 0) // Only include groups with options
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update product');
            }

            const updatedProduct = await response.json();
            onSave(updatedProduct);
            onClose();
        } catch (err) {
            console.error('Error updating product:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon />
                    Edit Product
                </Box>
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Basic Info */}
                    <TextField
                        label="Product Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Base Price"
                            type="number"
                            value={basePrice}
                            onChange={(e) => setBasePrice(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            sx={{ width: 150 }}
                        />
                    </Box>

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={2}
                        fullWidth
                    />

                    <Divider sx={{ my: 2 }} />

                    {/* Variant Groups */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Variant Groups</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddGroup}
                            size="small"
                        >
                            Add Group
                        </Button>
                    </Box>

                    {variantGroups.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No variant groups. Click "Add Group" to create one.
                        </Typography>
                    )}

                    {variantGroups.map((group, groupIndex) => (
                        <Paper key={groupIndex} elevation={1} sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
                                <TextField
                                    label="Group Name"
                                    placeholder="e.g., Size, Milk Type, Temperature"
                                    value={group.name}
                                    onChange={(e) => handleGroupChange(groupIndex, e.target.value)}
                                    fullWidth
                                    size="small"
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => handleRemoveGroup(groupIndex)}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ ml: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle2">Options</Typography>
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={() => handleAddOption(groupIndex)}
                                        size="small"
                                    >
                                        Add Option
                                    </Button>
                                </Box>

                                {group.options.length === 0 && (
                                    <Typography variant="caption" color="text.secondary">
                                        No options yet
                                    </Typography>
                                )}

                                {group.options.map((option, optionIndex) => (
                                    <Box
                                        key={optionIndex}
                                        sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}
                                    >
                                        <TextField
                                            label="Option Name"
                                            placeholder="e.g., Small, Large"
                                            value={option.name}
                                            onChange={(e) => handleOptionChange(groupIndex, optionIndex, 'name', e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Price"
                                            type="number"
                                            value={option.priceAdjustment}
                                            onChange={(e) => handleOptionChange(groupIndex, optionIndex, 'priceAdjustment', e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                            size="small"
                                            sx={{ width: 120 }}
                                        />
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveOption(groupIndex, optionIndex)}
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
