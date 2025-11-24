import React, { useState, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRecipes } from '../../lib/hooks';

/**
 * ProductGrid - Displays products in a touch-friendly grid for POS
 * @param {Function} onProductSelect - Callback when product is selected
 */
export default function ProductGrid({ onProductSelect }) {
  const recipeOptions = useMemo(() => ({ autoFetch: true }), []);
  const { products, loading, error } = useRecipes(recipeOptions);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Helper to get category name safely
  const getCategoryName = (product) => {
    if (!product.category) return 'Uncategorized';
    if (typeof product.category === 'string') return product.category;
    return product.category.name || 'Uncategorized';
  };

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!products) return ['All'];
    const cats = new Set(products.map((p) => getCategoryName(p)));
    return ['All', ...Array.from(cats)];
  }, [products]);

  // Filter products by category and active status
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const categoryName = getCategoryName(product);
      const isCategoryMatch =
        selectedCategory === 'All' || categoryName === selectedCategory;
      const isActive = product.isActive !== false;
      return isCategoryMatch && isActive;
    });
  }, [products, selectedCategory]);

  // Get category color
  const getCategoryColor = (categoryName) => {
    const colors = {
      Espresso: 'primary',
      Coffee: 'secondary',
      Specialty: 'success',
      Beans: 'warning',
      Equipment: 'info',
    };
    return colors[categoryName] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load products: {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Category Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: '16px',
              fontWeight: 600,
              minHeight: '60px',
            },
          }}
        >
          {categories.map((category) => (
            <Tab key={category} label={category} value={category} />
          ))}
        </Tabs>
      </Box>

      {/* Product Grid */}
      <Grid container spacing={2}>
        {filteredProducts.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">No products available in this category</Alert>
          </Grid>
        ) : (
          filteredProducts.map((product) => (
            <Grid item xs={6} sm={4} md={3} key={product.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  minHeight: '140px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: 2,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => onProductSelect(product)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    p: 2,
                  }}
                >
                  <CardContent sx={{ width: '100%', p: 0 }}>
                    {/* Product Image Placeholder */}
                    <Box
                      sx={{
                        width: '100%',
                        height: '80px',
                        backgroundColor: 'grey.200',
                        borderRadius: 1,
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" color="grey.400">
                        {product.name.charAt(0)}
                      </Typography>
                    </Box>

                    {/* Product Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '18px',
                        fontWeight: 600,
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {product.name}
                    </Typography>

                    {/* Category Badge & Price */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <Chip
                        label={getCategoryName(product)}
                        size="small"
                        color={getCategoryColor(getCategoryName(product))}
                        sx={{ fontSize: '12px' }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: 'primary.main',
                        }}
                      >
                        ${(product.basePrice || 0).toFixed(2)}
                      </Typography>
                    </Box>

                    {/* Variant Count */}
                    {(product.variantGroups?.length > 0 || (product.recipes && product.recipes.length > 0)) && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block', fontSize: '12px' }}
                      >
                        {product.variantGroups?.length > 0
                          ? `${product.variantGroups.length} option group${product.variantGroups.length !== 1 ? 's' : ''}`
                          : `${product.recipes.length} variant${product.recipes.length !== 1 ? 's' : ''}`
                        } available
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
