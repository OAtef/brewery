import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableSortLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  LocalCafe as CoffeeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import AddProductDialog from "./AddProductDialog";
import AddRecipeDialog from "./AddRecipeDialog";
import EditRecipeDialog from "./EditRecipeDialog";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RecipeManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter states for Products
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");
  const [productSortBy, setProductSortBy] = useState("name");
  const [productSortOrder, setProductSortOrder] = useState("asc");

  // Search and Filter states for Recipes
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState("");
  const [recipeVariantFilter, setRecipeVariantFilter] = useState("");
  const [recipeCostFilter, setRecipeCostFilter] = useState("");
  const [recipeIngredientFilter, setRecipeIngredientFilter] = useState("");
  const [recipeSortBy, setRecipeSortBy] = useState("productName");
  const [recipeSortOrder, setRecipeSortOrder] = useState("asc");

  // Dialog states
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [addRecipeDialogOpen, setAddRecipeDialogOpen] = useState(false);
  const [editRecipeDialogOpen, setEditRecipeDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // "product" or "recipe"

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchRecipes()]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setError("Failed to fetch products");
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/recipes");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setRecipes(data);
      setFilteredRecipes(data);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      setError("Failed to fetch recipes");
    }
  };

  // Product filtering and searching
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (productSearchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(productSearchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(productSearchQuery.toLowerCase())
      );
    }

    // Category filter
    if (productCategoryFilter) {
      filtered = filtered.filter(
        (product) => product.category === productCategoryFilter
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (productSortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "category":
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        case "recipeCount":
          aVal = a.recipes?.length || 0;
          bVal = b.recipes?.length || 0;
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (productSortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [
    products,
    productSearchQuery,
    productCategoryFilter,
    productSortBy,
    productSortOrder,
  ]);

  // Recipe filtering and searching
  useEffect(() => {
    let filtered = [...recipes];

    // Search filter
    if (recipeSearchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.product?.name
            .toLowerCase()
            .includes(recipeSearchQuery.toLowerCase()) ||
          recipe.variant
            .toLowerCase()
            .includes(recipeSearchQuery.toLowerCase()) ||
          recipe.ingredients?.some((ri) =>
            ri.ingredient.name
              .toLowerCase()
              .includes(recipeSearchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (recipeCategoryFilter) {
      filtered = filtered.filter(
        (recipe) => recipe.product?.category === recipeCategoryFilter
      );
    }

    // Variant filter
    if (recipeVariantFilter) {
      filtered = filtered.filter((recipe) =>
        recipe.variant.toLowerCase().includes(recipeVariantFilter.toLowerCase())
      );
    }

    // Cost filter
    if (recipeCostFilter) {
      filtered = filtered.filter((recipe) => {
        const cost = calculateRecipeCost(recipe);
        switch (recipeCostFilter) {
          case "low":
            return cost < 2;
          case "medium":
            return cost >= 2 && cost < 5;
          case "high":
            return cost >= 5;
          default:
            return true;
        }
      });
    }

    // Ingredient filter
    if (recipeIngredientFilter) {
      filtered = filtered.filter((recipe) =>
        recipe.ingredients?.some((ri) =>
          ri.ingredient.name
            .toLowerCase()
            .includes(recipeIngredientFilter.toLowerCase())
        )
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (recipeSortBy) {
        case "productName":
          aVal = a.product?.name.toLowerCase() || "";
          bVal = b.product?.name.toLowerCase() || "";
          break;
        case "variant":
          aVal = a.variant.toLowerCase();
          bVal = b.variant.toLowerCase();
          break;
        case "category":
          aVal = a.product?.category.toLowerCase() || "";
          bVal = b.product?.category.toLowerCase() || "";
          break;
        case "cost":
          aVal = calculateRecipeCost(a);
          bVal = calculateRecipeCost(b);
          break;
        case "ingredientCount":
          aVal = a.ingredients?.length || 0;
          bVal = b.ingredients?.length || 0;
          break;
        default:
          aVal = a.product?.name.toLowerCase() || "";
          bVal = b.product?.name.toLowerCase() || "";
      }

      if (recipeSortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredRecipes(filtered);
  }, [
    recipes,
    recipeSearchQuery,
    recipeCategoryFilter,
    recipeVariantFilter,
    recipeCostFilter,
    recipeIngredientFilter,
    recipeSortBy,
    recipeSortOrder,
  ]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleRecipeAdded = (newRecipe) => {
    setRecipes((prev) => [...prev, newRecipe]);
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === updatedRecipe.id ? updatedRecipe : recipe
      )
    );
  };

  // Sorting handlers
  const handleProductSort = (column) => {
    if (productSortBy === column) {
      setProductSortOrder(productSortOrder === "asc" ? "desc" : "asc");
    } else {
      setProductSortBy(column);
      setProductSortOrder("asc");
    }
  };

  const handleRecipeSort = (column) => {
    if (recipeSortBy === column) {
      setRecipeSortOrder(recipeSortOrder === "asc" ? "desc" : "asc");
    } else {
      setRecipeSortBy(column);
      setRecipeSortOrder("asc");
    }
  };

  // Clear filters
  const clearProductFilters = () => {
    setProductSearchQuery("");
    setProductCategoryFilter("");
    setProductSortBy("name");
    setProductSortOrder("asc");
  };

  const clearRecipeFilters = () => {
    setRecipeSearchQuery("");
    setRecipeCategoryFilter("");
    setRecipeVariantFilter("");
    setRecipeCostFilter("");
    setRecipeIngredientFilter("");
    setRecipeSortBy("productName");
    setRecipeSortOrder("asc");
  };

  // Get filter counts
  const getProductFilterCount = () => {
    let count = 0;
    if (productSearchQuery) count++;
    if (productCategoryFilter) count++;
    return count;
  };

  const getRecipeFilterCount = () => {
    let count = 0;
    if (recipeSearchQuery) count++;
    if (recipeCategoryFilter) count++;
    if (recipeVariantFilter) count++;
    if (recipeCostFilter) count++;
    if (recipeIngredientFilter) count++;
    return count;
  };

  // Get unique values for filters
  const getUniqueCategories = () => {
    return [...new Set(products.map((p) => p.category))].sort();
  };

  const getUniqueVariants = () => {
    return [...new Set(recipes.map((r) => r.variant))].sort();
  };

  const getUniqueIngredients = () => {
    const ingredients = new Set();
    recipes.forEach((recipe) => {
      recipe.ingredients?.forEach((ri) => {
        ingredients.add(ri.ingredient.name);
      });
    });
    return [...ingredients].sort();
  };

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setEditRecipeDialogOpen(true);
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setError(null);
      const endpoint =
        deleteType === "product"
          ? `/api/products/${itemToDelete.id}`
          : `/api/recipes/${itemToDelete.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });

      if (res.ok) {
        if (deleteType === "product") {
          setProducts((prev) => prev.filter((p) => p.id !== itemToDelete.id));
          // Also remove related recipes
          setRecipes((prev) =>
            prev.filter((r) => r.productId !== itemToDelete.id)
          );
        } else {
          setRecipes((prev) => prev.filter((r) => r.id !== itemToDelete.id));
        }
      } else {
        const error = await res.json();
        setError(error.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      setError("Failed to delete item");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType("");
    }
  };

  const calculateRecipeCost = (recipe) => {
    if (!recipe.ingredients) return 0;
    return recipe.ingredients.reduce((total, ri) => {
      return total + ri.quantity * ri.ingredient.costPerUnit;
    }, 0);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Recipe & Product Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Products" icon={<CoffeeIcon />} iconPosition="start" />
          <Tab label="Recipes" icon={<RestaurantIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Products Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5">
            Products ({filteredProducts.length} of {products.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddProductDialogOpen(true)}
          >
            Add Product
          </Button>
        </Box>

        {/* Product Search and Filter Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products by name or description..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={productCategoryFilter}
                  label="Category"
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {getUniqueCategories().map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  disabled={getProductFilterCount() === 0}
                  onClick={clearProductFilters}
                  size="small"
                >
                  Clear ({getProductFilterCount()})
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Quick filter buttons for products */}
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {getUniqueCategories().map((category) => (
              <Button
                key={category}
                size="small"
                variant={
                  productCategoryFilter === category ? "contained" : "outlined"
                }
                onClick={() =>
                  setProductCategoryFilter(
                    productCategoryFilter === category ? "" : category
                  )
                }
              >
                {category} (
                {products.filter((p) => p.category === category).length})
              </Button>
            ))}
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {filteredProducts.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body1" color="textSecondary">
                  {products.length === 0
                    ? "No products found. Add your first product to get started."
                    : "No products match your current filters. Try adjusting your search criteria."}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Chip
                      label={product.category}
                      color="primary"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    {product.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {product.description}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Recipes: {product.recipes?.length || 0}
                    </Typography>
                    {product.basePrice > 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Base Price: ${product.basePrice.toFixed(2)}
                      </Typography>
                    )}
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(product, "product")}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </TabPanel>

      {/* Recipes Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5">
            Recipes ({filteredRecipes.length} of {recipes.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddRecipeDialogOpen(true)}
          >
            Add Recipe
          </Button>
        </Box>

        {/* Recipe Search and Filter Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search recipes, products, or ingredients..."
                value={recipeSearchQuery}
                onChange={(e) => setRecipeSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item sx={{ m: 1, minWidth: 120 }} xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={recipeCategoryFilter}
                  label="Category"
                  onChange={(e) => setRecipeCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {getUniqueCategories().map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item sx={{ m: 1, minWidth: 120 }} xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Variant</InputLabel>
                <Select
                  value={recipeVariantFilter}
                  label="Variant"
                  onChange={(e) => setRecipeVariantFilter(e.target.value)}
                >
                  <MenuItem value="">All Variants</MenuItem>
                  {getUniqueVariants().map((variant) => (
                    <MenuItem key={variant} value={variant}>
                      {variant}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item sx={{ m: 1, minWidth: 120 }} xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Cost Range</InputLabel>
                <Select
                  value={recipeCostFilter}
                  label="Cost Range"
                  onChange={(e) => setRecipeCostFilter(e.target.value)}
                >
                  <MenuItem value="">All Costs</MenuItem>
                  <MenuItem value="low">Low (&lt; $2)</MenuItem>
                  <MenuItem value="medium">Medium ($2 - $5)</MenuItem>
                  <MenuItem value="high">High (&gt; $5)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  disabled={getRecipeFilterCount() === 0}
                  onClick={clearRecipeFilters}
                  size="small"
                >
                  Clear ({getRecipeFilterCount()})
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Ingredient filter */}
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Filter by ingredient name..."
                  value={recipeIngredientFilter}
                  onChange={(e) => setRecipeIngredientFilter(e.target.value)}
                  label="Ingredient Filter"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Quick filter buttons for recipes */}
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            <Button
              size="small"
              variant={recipeCostFilter === "low" ? "contained" : "outlined"}
              color="success"
              onClick={() =>
                setRecipeCostFilter(recipeCostFilter === "low" ? "" : "low")
              }
            >
              Low Cost (
              {recipes.filter((r) => calculateRecipeCost(r) < 2).length})
            </Button>
            <Button
              size="small"
              variant={recipeCostFilter === "high" ? "contained" : "outlined"}
              color="warning"
              onClick={() =>
                setRecipeCostFilter(recipeCostFilter === "high" ? "" : "high")
              }
            >
              High Cost (
              {recipes.filter((r) => calculateRecipeCost(r) >= 5).length})
            </Button>
            {getUniqueCategories()
              .slice(0, 3)
              .map((category) => (
                <Button
                  key={category}
                  size="small"
                  variant={
                    recipeCategoryFilter === category ? "contained" : "outlined"
                  }
                  onClick={() =>
                    setRecipeCategoryFilter(
                      recipeCategoryFilter === category ? "" : category
                    )
                  }
                >
                  {category} (
                  {
                    recipes.filter((r) => r.product?.category === category)
                      .length
                  }
                  )
                </Button>
              ))}
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={recipeSortBy === "productName"}
                    direction={
                      recipeSortBy === "productName" ? recipeSortOrder : "asc"
                    }
                    onClick={() => handleRecipeSort("productName")}
                  >
                    Product
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={recipeSortBy === "variant"}
                    direction={
                      recipeSortBy === "variant" ? recipeSortOrder : "asc"
                    }
                    onClick={() => handleRecipeSort("variant")}
                  >
                    Variant
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={recipeSortBy === "category"}
                    direction={
                      recipeSortBy === "category" ? recipeSortOrder : "asc"
                    }
                    onClick={() => handleRecipeSort("category")}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={recipeSortBy === "ingredientCount"}
                    direction={
                      recipeSortBy === "ingredientCount"
                        ? recipeSortOrder
                        : "asc"
                    }
                    onClick={() => handleRecipeSort("ingredientCount")}
                  >
                    Ingredients
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={recipeSortBy === "cost"}
                    direction={
                      recipeSortBy === "cost" ? recipeSortOrder : "asc"
                    }
                    onClick={() => handleRecipeSort("cost")}
                  >
                    Estimated Cost
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecipes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="textSecondary" py={4}>
                      {recipes.length === 0
                        ? "No recipes found. Add your first recipe to get started."
                        : "No recipes match your current filters. Try adjusting your search criteria."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>{recipe.product?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={recipe.variant}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={recipe.product?.category} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          {recipe.ingredients?.length || 0} ingredients
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {recipe.ingredients?.slice(0, 3).map((ri, index) => (
                            <Chip
                              key={index}
                              label={`${ri.ingredient.name} (${ri.quantity}${ri.ingredient.unit})`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {recipe.ingredients?.length > 3 && (
                            <Chip
                              label={`+${recipe.ingredients.length - 3} more`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={
                          calculateRecipeCost(recipe) >= 5
                            ? "warning.main"
                            : calculateRecipeCost(recipe) < 2
                            ? "success.main"
                            : "inherit"
                        }
                        fontWeight={
                          calculateRecipeCost(recipe) >= 5 ||
                          calculateRecipeCost(recipe) < 2
                            ? "bold"
                            : "normal"
                        }
                      >
                        ${calculateRecipeCost(recipe).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          onClick={() => handleEditRecipe(recipe)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(recipe, "recipe")}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Dialogs */}
      <AddProductDialog
        open={addProductDialogOpen}
        onClose={() => setAddProductDialogOpen(false)}
        onProductAdded={handleProductAdded}
      />

      <AddRecipeDialog
        open={addRecipeDialogOpen}
        onClose={() => setAddRecipeDialogOpen(false)}
        onRecipeAdded={handleRecipeAdded}
      />

      <EditRecipeDialog
        open={editRecipeDialogOpen}
        onClose={() => setEditRecipeDialogOpen(false)}
        recipe={selectedRecipe}
        onRecipeUpdated={handleRecipeUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {deleteType}?
            {deleteType === "product" &&
              " This will also delete all associated recipes."}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
