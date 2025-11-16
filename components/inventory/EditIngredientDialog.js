import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";

export default function EditIngredientDialog({
  open,
  onClose,
  ingredient,
  refreshIngredients,
}) {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setStock(ingredient.currentStock);
      setCost(ingredient.costPerUnit);
    }
  }, [ingredient]);

  const handleSubmit = async () => {
    setError("");
    try {
      const response = await fetch(`/api/ingredient/${ingredient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          stock: parseFloat(stock),
          costPerUnit: parseFloat(cost),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ingredient");
      }

      onClose();
      refreshIngredients();
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Ingredient</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Stock"
          type="number"
          fullWidth
          variant="outlined"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Cost"
          type="number"
          fullWidth
          variant="outlined"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
