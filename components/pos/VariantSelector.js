import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel,
    Chip,
    Alert,
} from '@mui/material';

export default function VariantSelector({ product, selectedVariants, onVariantSelect }) {
    const [variantGroups, setVariantGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch variant groups for the product
    useEffect(() => {
        if (!product?.id) {
            setVariantGroups([]);
            return;
        }

        const fetchVariantGroups = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/products/${product.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                setVariantGroups(data.variantGroups || []);
            } catch (err) {
                console.error('Error fetching variant groups:', err);
                setError(err.message);
                setVariantGroups([]);
            } finally {
                setLoading(false);
            }
        };

        fetchVariantGroups();
    }, [product?.id]);

    // Handle variant option selection
    const handleVariantChange = (groupId, option) => {
        onVariantSelect(groupId, option);
    };

    // Check if product has legacy recipes (backward compatibility)
    const hasLegacyRecipes = product?.recipes && product.recipes.length > 0;

    if (loading) {
        return (
            <Box sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Loading variant options...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ my: 2 }}>
                Error loading variants: {error}
            </Alert>
        );
    }

    // If no variant groups and no legacy recipes, show nothing
    if (variantGroups.length === 0 && !hasLegacyRecipes) {
        return null;
    }

    return (
        <Box sx={{ my: 2 }}>
            {/* Legacy Recipe Support (for backward compatibility) */}
            {hasLegacyRecipes && (
                <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                    <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                        Size/Variant
                        <Chip
                            label="Legacy"
                            size="small"
                            color="default"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                    </FormLabel>
                    <RadioGroup
                        value={selectedVariants?.legacy?.id || ''}
                        onChange={(e) => {
                            const selectedRecipe = product.recipes.find(
                                (r) => r.id === parseInt(e.target.value)
                            );
                            if (selectedRecipe) {
                                handleVariantChange('legacy', selectedRecipe);
                            }
                        }}
                    >
                        {product.recipes
                            .filter((recipe) => recipe.isActive)
                            .map((recipe) => (
                                <FormControlLabel
                                    key={recipe.id}
                                    value={recipe.id.toString()}
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body1">{recipe.variant}</Typography>
                                            {recipe.priceModifier !== 0 && (
                                                <Typography
                                                    variant="body2"
                                                    color={recipe.priceModifier > 0 ? 'success.main' : 'error.main'}
                                                >
                                                    {recipe.priceModifier > 0 ? '+' : ''}${recipe.priceModifier.toFixed(2)}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            ))}
                    </RadioGroup>
                </FormControl>
            )}

            {/* New Variant Groups */}
            {variantGroups.map((group) => {
                const selectedOption = selectedVariants?.[group.id];

                return (
                    <FormControl key={group.id} component="fieldset" fullWidth sx={{ mb: 3 }}>
                        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                            {group.name}
                        </FormLabel>
                        <RadioGroup
                            value={selectedOption?.id?.toString() || ''}
                            onChange={(e) => {
                                const optionId = parseInt(e.target.value);
                                const option = group.options.find((opt) => opt.id === optionId);
                                if (option) {
                                    handleVariantChange(group.id, {
                                        id: option.id,
                                        name: option.name,
                                        priceAdjustment: option.priceAdjustment,
                                    });
                                }
                            }}
                        >
                            {group.options.map((option) => (
                                <FormControlLabel
                                    key={option.id}
                                    value={option.id.toString()}
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body1">{option.name}</Typography>
                                            {option.priceAdjustment !== 0 && (
                                                <Typography
                                                    variant="body2"
                                                    color={option.priceAdjustment > 0 ? 'success.main' : 'error.main'}
                                                >
                                                    {option.priceAdjustment > 0 ? '+' : ''}${option.priceAdjustment.toFixed(2)}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                );
            })}
        </Box>
    );
}
