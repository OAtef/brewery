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
  Grid,
  Alert,
} from "@mui/material";

export default function AddProductDialog({ open, onClose, onProductAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Espresso",
    "Coffee",
    "Tea",
    "Cold Brew",
    "Frappuccino",
    "Specialty",
    "Pastry",
    "Sandwich",
    "Other",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setError("");
      if (!formData.name || !formData.category) {
        setError("Please fill in all required fields");
        return;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newProduct = await res.json();
        onProductAdded(newProduct);
        handleClose();
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      setError("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Product</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Product Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                fullWidth
                margin="normal"
                required
                placeholder="e.g., Cappuccino, Croissant"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth margin="normal">
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  required
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em>Select Category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Creating..." : "Create Product"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
