import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Grid,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { getUnitDisplayText } from "../../lib/units";

export default function EditRecipeDialog({
  open,
  onClose,
  recipe,
  onRecipeUpdated,
}) {
  const [formData, setFormData] = useState({
    variant: "",
    ingredients: [{ ingredientId: "", quantity: "" }],
  });
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && recipe) {
      setFormData({
        variant: recipe.variant || "",
        ingredients:
          recipe.ingredients?.length > 0
            ? recipe.ingredients.map((ri) => ({
                ingredientId: ri.ingredientId.toString(),
                quantity: ri.quantity.toString(),
              }))
            : [{ ingredientId: "", quantity: "" }],
      });
      fetchIngredients();
    }
  }, [open, recipe]);

  const fetchIngredients = async () => {
    try {
      const res = await fetch("/api/ingredient");
      if (res.ok) {
        const data = await res.json();
        setIngredients(data);
      } else {
        throw new Error("Failed to fetch ingredients");
      }
    } catch (error) {
      setError(error.message || "Failed to fetch ingredients");
      console.error("Failed to fetch ingredients:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: "", quantity: "" }],
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const updatedIngredients = formData.ingredients.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        ingredients: updatedIngredients,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setError("");
      // Validate form
      if (!formData.variant) {
        setError("Please fill in all required fields");
        return;
      }

      const validIngredients = formData.ingredients.filter(
        (ing) => ing.ingredientId && ing.quantity
      );

      if (validIngredients.length === 0) {
        setError("Please add at least one ingredient");
        return;
      }

      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: formData.variant,
          ingredients: validIngredients.map((ing) => ({
            ingredientId: parseInt(ing.ingredientId),
            quantity: parseFloat(ing.quantity),
          })),
        }),
      });

      if (res.ok) {
        const updatedRecipe = await res.json();
        onRecipeUpdated(updatedRecipe);
        onClose();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update recipe");
      }
    } catch (error) {
      console.error("Failed to update recipe:", error);
      setError("Failed to update recipe");
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Recipe: {recipe.product?.name} - {recipe.variant}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Variant"
                value={formData.variant}
                onChange={(e) => handleInputChange("variant", e.target.value)}
                fullWidth
                margin="normal"
                required
                placeholder="e.g., Regular, Decaf, Sugar-Free"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ingredients
            </Typography>
            {formData.ingredients.map((ingredient, index) => (
              <Box
                key={index}
                sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}
              >
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Ingredient</InputLabel>
                  <Select
                    value={ingredient.ingredientId}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "ingredientId",
                        e.target.value
                      )
                    }
                    required
                  >
                    {ingredients.map((ing) => (
                      <MenuItem key={ing.id} value={ing.id}>
                        {ing.name} ({getUnitDisplayText(ing.unit)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  type="number"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    handleIngredientChange(index, "quantity", e.target.value)
                  }
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, step: 0.1 }}
                  required
                />
                <IconButton
                  onClick={() => removeIngredient(index)}
                  disabled={formData.ingredients.length === 1}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addIngredient}
              variant="outlined"
              size="small"
            >
              Add Ingredient
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Updating..." : "Update Recipe"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
