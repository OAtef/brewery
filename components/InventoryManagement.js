import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Alert,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIngredientDialog from "./AddIngredientDialog";
import EditIngredientDialog from "./EditIngredientDialog";
import { getUnitDisplayText } from "../lib/units";
import { useSelector } from "react-redux";

export default function InventoryManagement() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addIngredientOpen, setAddIngredientOpen] = useState(false);
  const [editIngredientOpen, setEditIngredientOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const user = useSelector((state) => state.user);

  const fetchIngredients = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      } else {
        const data = await res.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleAddIngredientOpen = () => {
    setAddIngredientOpen(true);
  };

  const handleAddIngredientClose = () => {
    setAddIngredientOpen(false);
  };

  const handleEditIngredientOpen = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditIngredientOpen(true);
  };

  const handleEditIngredientClose = () => {
    setSelectedIngredient(null);
    setEditIngredientOpen(false);
  };

  const handleDelete = async (ingredientId) => {
    setDeleteError(null);
    const res = await fetch(`/api/inventory/${ingredientId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.message || `HTTP error! status: ${res.status}`);
    } else {
      fetchIngredients();
    }
  };

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  if (error) {
    return <Alert severity="error">Error: {error.message}</Alert>;
  }

  return (
    <div>
      <h1>Inventory Management</h1>
      {deleteError && <Alert severity="error">{deleteError}</Alert>}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddIngredientOpen}
        >
          Add Ingredient
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Unit</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Cost</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow
                key={ingredient.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {ingredient.name}
                </TableCell>
                <TableCell align="right">
                  {getUnitDisplayText(ingredient.unit)}
                </TableCell>
                <TableCell align="right">{ingredient.currentStock}</TableCell>
                <TableCell align="right">{ingredient.costPerUnit}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleEditIngredientOpen(ingredient)}
                  >
                    Edit
                  </Button>
                  {user?.role === "ADMIN" && (
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDelete(ingredient.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddIngredientDialog
        open={addIngredientOpen}
        onClose={handleAddIngredientClose}
        refreshIngredients={fetchIngredients}
      />
      <EditIngredientDialog
        open={editIngredientOpen}
        onClose={handleEditIngredientClose}
        ingredient={selectedIngredient}
        refreshIngredients={fetchIngredients}
      />
    </div>
  );
}
