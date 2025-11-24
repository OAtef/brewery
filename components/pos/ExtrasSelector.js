import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Alert,
    Chip,
} from '@mui/material';

export default function ExtrasSelector({ selectedExtras, onExtrasChange }) {
    const [availableExtras, setAvailableExtras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch available extras
    useEffect(() => {
        const fetchExtras = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/extras');
                if (!response.ok) {
                    throw new Error('Failed to fetch extras');
                }
                const data = await response.json();
                setAvailableExtras(data.extras || []);
            } catch (err) {
                console.error('Error fetching extras:', err);
                setError(err.message);
                setAvailableExtras([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExtras();
    }, []);

    // Handle extra toggle
    const handleExtraToggle = (extra, checked) => {
        if (checked) {
            // Add extra
            onExtrasChange([...selectedExtras, {
                id: extra.id,
                name: extra.name,
                price: extra.price,
            }]);
        } else {
            // Remove extra
            onExtrasChange(selectedExtras.filter((e) => e.id !== extra.id));
        }
    };

    // Check if an extra is selected
    const isExtraSelected = (extraId) => {
        return selectedExtras.some((e) => e.id === extraId);
    };

    // Calculate total extras price
    const totalExtrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);

    if (loading) {
        return (
            <Box sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Loading extras...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="warning" sx={{ my: 2 }}>
                Could not load extras: {error}
            </Alert>
        );
    }

    // If no extras available, don't render anything
    if (availableExtras.length === 0) {
        return null;
    }

    return (
        <Box sx={{ my: 2 }}>
            <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    Add Extras
                    {selectedExtras.length > 0 && (
                        <Chip
                            label={`${selectedExtras.length} selected - +$${totalExtrasPrice.toFixed(2)}`}
                            color="primary"
                            size="small"
                        />
                    )}
                </FormLabel>
                <FormGroup>
                    {availableExtras.map((extra) => (
                        <FormControlLabel
                            key={extra.id}
                            control={
                                <Checkbox
                                    checked={isExtraSelected(extra.id)}
                                    onChange={(e) => handleExtraToggle(extra, e.target.checked)}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                        {extra.name}
                                    </Typography>
                                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                        +${extra.price.toFixed(2)}
                                    </Typography>
                                </Box>
                            }
                            sx={{
                                py: 0.5,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    borderRadius: 1,
                                },
                            }}
                        />
                    ))}
                </FormGroup>
            </FormControl>
        </Box>
    );
}
