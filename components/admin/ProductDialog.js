import React, { useState } from 'react';
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
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function ProductDialog({ open, onClose, onSave }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [description, setDescription] = useState('');
    const [variantGroups, setVariantGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAddGroup = () => {
        setVariantGroups([...variantGroups, { name: '', options: [] }]);
    };

    const handleRemoveGroup = (index) => {
        const newGroups = [...variantGroups];
        newGroups.splice(index, 1);
        setVariantGroups(newGroups);
    };

    const handleGroupChange = (index, field, value) => {
        const newGroups = [...variantGroups];
        newGroups[index][field] = value;
        setVariantGroups(newGroups);
    };

    const handleAddOption = (groupIndex) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].options.push({ name: '', priceAdjustment: '' });
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
        if (!name || !category || !basePrice) return;

        setLoading(true);
        const productData = {
            name,
            category,
            basePrice: parseFloat(basePrice),
            description,
            variantGroups: variantGroups.map(g => ({
                name: g.name,
                options: g.options.map(o => ({
                    name: o.name,
                    priceAdjustment: parseFloat(o.priceAdjustment || 0)
                }))
            }))
        };

        await onSave(productData);
        setLoading(false);
        onClose();

        // Reset form
        setName('');
        setCategory('');
        setBasePrice('');
        setDescription('');
        setVariantGroups([]);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Product Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                fullWidth
                                required
                                placeholder="e.g. Coffee, Tea, Bakery"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Base Price"
                                type="number"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                fullWidth
                                required
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Variant Groups</Typography>
                        <Button startIcon={<AddIcon />} onClick={handleAddGroup} variant="outlined" size="small">
                            Add Group
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        e.g. &quot;Milk Type&quot; with options &quot;Whole&quot;, &quot;Oat (+0.50)&quot;
                    </Typography>

                    {variantGroups.map((group, groupIndex) => (
                        <Paper key={groupIndex} variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    label="Group Name (e.g. Milk)"
                                    value={group.name}
                                    onChange={(e) => handleGroupChange(groupIndex, 'name', e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                                <IconButton onClick={() => handleRemoveGroup(groupIndex)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ pl: 2 }}>
                                {group.options.map((option, optionIndex) => (
                                    <Box key={optionIndex} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                                        <TextField
                                            label="Option Name"
                                            value={option.name}
                                            onChange={(e) => handleOptionChange(groupIndex, optionIndex, 'name', e.target.value)}
                                            size="small"
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <TextField
                                            label="Price (+)"
                                            type="number"
                                            value={option.priceAdjustment}
                                            onChange={(e) => handleOptionChange(groupIndex, optionIndex, 'priceAdjustment', e.target.value)}
                                            size="small"
                                            sx={{ width: 100 }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                        />
                                        <IconButton size="small" onClick={() => handleRemoveOption(groupIndex, optionIndex)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddOption(groupIndex)}
                                    size="small"
                                    sx={{ mt: 1 }}
                                >
                                    Add Option
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading}>
                    Create Product
                </Button>
            </DialogActions>
        </Dialog>
    );
}
