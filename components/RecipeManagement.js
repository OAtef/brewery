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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  LocalCafe as CoffeeIcon,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      setError("Failed to fetch recipes");
    }
  };

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
          <Typography variant="h5">Products ({products.length})</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddProductDialogOpen(true)}
          >
            Add Product
          </Button>
        </Box>

        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Chip
                    label={product.category}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Recipes: {product.recipes?.length || 0}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(product, "product")}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Recipes Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5">Recipes ({recipes.length})</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddRecipeDialogOpen(true)}
          >
            Add Recipe
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Variant</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Ingredients</TableCell>
                <TableCell>Estimated Cost</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>{recipe.product?.name}</TableCell>
                  <TableCell>{recipe.variant}</TableCell>
                  <TableCell>
                    <Chip label={recipe.product?.category} size="small" />
                  </TableCell>
                  <TableCell>
                    {recipe.ingredients?.map((ri, index) => (
                      <Chip
                        key={index}
                        label={`${ri.ingredient.name} (${ri.quantity}${ri.ingredient.unit})`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    ${calculateRecipeCost(recipe).toFixed(2)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
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
