import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

export default function MenuPage() {
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch recipes and products
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        
        // Fetch recipes (coffee drinks)
        const recipesResponse = await fetch('/api/recipes');
        const recipesData = await recipesResponse.json();
        
        // Fetch products (coffee beans, equipment)
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        
        if (recipesResponse.ok) {
          // API returns direct array, not wrapped in object
          console.log('Recipes response:', recipesData);
          setRecipes(Array.isArray(recipesData) ? recipesData : []);
        }
        
        if (productsResponse.ok) {
          // API returns direct array, not wrapped in object
          console.log('Products response:', productsData);
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
        
        console.log('Final state - recipes:', Array.isArray(recipesData) ? recipesData.length : 0);
        console.log('Final state - products:', Array.isArray(productsData) ? productsData.length : 0);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu. Please try again later.');
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const handleItemClick = (item, type) => {
    setSelectedItem({ ...item, type });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading our delicious menu...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          <LocalCafeIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
          Coffee & Bakery Menu
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover our handcrafted drinks and upcoming bakery selections
        </Typography>
      </Box>

      {/* Coffee Drinks Section */}
      {products.filter(product => ['Espresso', 'Coffee'].includes(product.category)).length > 0 && (
        <Box mb={6}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
            ☕ Coffee Drinks
          </Typography>
          <Grid container spacing={3}>
            {products
              .filter(product => ['Espresso', 'Coffee'].includes(product.category))
              .map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    }
                  }}
                  onClick={() => handleItemClick(product, 'drink')}
                >
                  <CardContent>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.category} - A delicious coffee creation
                    </Typography>
                    
                    {/* Recipes/Variants Preview */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Available variants:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {product.recipes?.slice(0, 3).map((recipe, index) => (
                          <Chip
                            key={index}
                            label={recipe.variant}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {product.recipes?.length > 3 && (
                          <Chip
                            label={`+${product.recipes.length - 3} more`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemClick(product, 'drink');
                      }}
                    >
                      View Recipes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Desserts & Bakery Section */}
      <Box>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          🧁 Desserts & Bakery
        </Typography>
        
        {/* Coming Soon Placeholder */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 6, 
            bgcolor: 'background.default', 
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'primary.main'
          }}
        >
          <Typography variant="h5" gutterBottom color="primary">
            🍰 Coming Soon!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We&apos;re working on bringing you delicious desserts and fresh bakery items.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expect croissants, muffins, cookies, cakes, and other sweet treats to complement your coffee experience.
          </Typography>
        </Box>
      </Box>

      {/* Empty State */}
      {products.filter(product => ['Espresso', 'Coffee'].includes(product.category)).length === 0 && (
        <Box textAlign="center" py={8}>
          <LocalCafeIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Coffee Menu Coming Soon!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We&apos;re brewing up something special. Check back soon for our amazing coffee drinks and bakery items.
          </Typography>
        </Box>
      )}

      {/* Item Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              {selectedItem?.name}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedItem.description || 'A wonderful addition to our menu.'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {selectedItem.type === 'drink' && selectedItem.recipes && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Available Recipes:
                  </Typography>
                  {selectedItem.recipes.map((recipe, index) => (
                    <Box key={index} mb={2} p={2} sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        <strong>{recipe.variant}</strong>
                      </Typography>
                      {recipe.ingredients && (
                        <Box>
                          <Typography variant="body2" gutterBottom>
                            Ingredients:
                          </Typography>
                          <Grid container spacing={1}>
                            {recipe.ingredients.map((recipeIngredient, idx) => (
                              <Grid item key={idx}>
                                <Chip
                                  label={`${recipeIngredient.ingredient.name} (${recipeIngredient.quantity}${recipeIngredient.ingredient.unit})`}
                                  variant="outlined"
                                  size="small"
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
              
              {selectedItem.type === 'recipe' && selectedItem.ingredients && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Ingredients:
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedItem.ingredients.map((ingredient, index) => (
                      <Grid item key={index}>
                        <Chip
                          label={`${ingredient.name} (${ingredient.quantity}${ingredient.unit})`}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              
              {selectedItem.type === 'recipe' && selectedItem.instructions && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Instructions:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedItem.instructions}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
