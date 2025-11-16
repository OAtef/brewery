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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Typography,
  Card,
  CardContent,
  TableSortLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import WarningIcon from "@mui/icons-material/Warning";
import AddIngredientDialog from "./AddIngredientDialog";
import AddPackageDialog from "./AddPackageDialog";
import EditIngredientDialog from "./EditIngredientDialog";
import { getUnitDisplayText, ALL_UNITS } from "../../lib/units";
import { useSelector } from "react-redux";

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addIngredientOpen, setAddIngredientOpen] = useState(false);
  const [addPackageOpen, setAddPackageOpen] = useState(false);
  const [editIngredientOpen, setEditIngredientOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [costFilter, setCostFilter] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const user = useSelector((state) => state.user);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ingredientsRes, packagingRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/packaging"),
      ]);

      if (!ingredientsRes.ok) {
        setError(
          new Error(`Failed to fetch ingredients: ${ingredientsRes.statusText}`)
        );
        setInventory([]);
        return;
      }
      if (!packagingRes.ok) {
        setError(
          new Error(`Failed to fetch packaging: ${packagingRes.statusText}`)
        );
        setInventory([]);
        return;
      }

      const ingredientsData = await ingredientsRes.json();
      const packagingData = await packagingRes.json();

      const ingredients = ingredientsData.map((item) => ({
        ...item,
        category: "Ingredient",
      }));

      const packaging = packagingData.map((item) => ({
        ...item,
        name: item.type, // map type to name for consistency
        unit: "package", // packages don't have a unit, so we'll use this
        category: "Package",
      }));

      const combinedData = [...ingredients, ...packaging];
      setInventory(combinedData);
    } catch (error) {
      console.error("Failed to fetch inventory data:", error);
      setError(error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and Search Logic
  useEffect(() => {
    let filtered = [...inventory];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Unit filter
    if (unitFilter) {
      filtered = filtered.filter((item) => item.unit === unitFilter);
    }

    // Stock level filter
    if (stockFilter) {
      switch (stockFilter) {
        case "low":
          filtered = filtered.filter(
            (item) => item.currentStock < lowStockThreshold
          );
          break;
        case "out":
          filtered = filtered.filter((item) => item.currentStock === 0);
          break;
        case "normal":
          filtered = filtered.filter(
            (item) => item.currentStock >= lowStockThreshold
          );
          break;
        default:
          break;
      }
    }

    // Cost filter
    if (costFilter) {
      switch (costFilter) {
        case "low":
          filtered = filtered.filter((item) => item.costPerUnit < 0.01);
          break;
        case "medium":
          filtered = filtered.filter(
            (item) => item.costPerUnit >= 0.01 && item.costPerUnit < 0.1
          );
          break;
        case "high":
          filtered = filtered.filter((item) => item.costPerUnit >= 0.1);
          break;
        default:
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "stock":
          aVal = a.currentStock;
          bVal = b.currentStock;
          break;
        case "cost":
          aVal = a.costPerUnit;
          bVal = b.costPerUnit;
          break;
        case "unit":
          aVal = a.unit;
          bVal = b.unit;
          break;
        default:
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredInventory(filtered);
  }, [
    inventory,
    searchQuery,
    unitFilter,
    stockFilter,
    costFilter,
    lowStockThreshold,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleAddIngredientOpen = () => {
    setAddIngredientOpen(true);
  };

  const handleAddIngredientClose = () => {
    setAddIngredientOpen(false);
  };

  const handleAddPackageOpen = () => {
    setAddPackageOpen(true);
  };

  const handleAddPackageClose = () => {
    setAddPackageOpen(false);
  };

  const handleEditIngredientOpen = (ingredient) => {
    setSelectedIngredient(ingredient);
    setEditIngredientOpen(true);
  };

  const handleEditIngredientClose = () => {
    setSelectedIngredient(null);
    setEditIngredientOpen(false);
  };

  const handleDelete = async (item) => {
    setDeleteError(null);
    const endpoint =
      item.category === "Ingredient"
        ? `/api/inventory/${item.id}`
        : `/api/packaging/${item.id}`;
    const res = await fetch(endpoint, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.message || `HTTP error! status: ${res.status}`);
    } else {
      fetchInventoryData();
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setUnitFilter("");
    setStockFilter("");
    setCostFilter("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (unitFilter) count++;
    if (stockFilter) count++;
    if (costFilter) count++;
    return count;
  };

  const getLowStockItems = () => {
    return inventory.filter(
      (item) => item.currentStock < lowStockThreshold && item.currentStock > 0
    );
  };

  const getOutOfStockItems = () => {
    return inventory.filter((item) => item.currentStock === 0);
  };

  if (loading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error: {error.message}
        </Alert>
      )}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1"></Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddIngredientOpen}
            sx={{ mr: 1 }}
          >
            Add Ingredient
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddPackageOpen}
          >
            Add Package
          </Button>
        </Box>
      </Box>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      )}

      {/* Stock Alerts */}
      {(getOutOfStockItems().length > 0 || getLowStockItems().length > 0) && (
        <Box mb={3}>
          {getOutOfStockItems().length > 0 && (
            <Alert severity="error" sx={{ mb: 1 }}>
              <Box display="flex" alignItems="center">
                <WarningIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {getOutOfStockItems().length} item(s) out of stock:{" "}
                  {getOutOfStockItems()
                    .map((item) => item.name)
                    .join(", ")}
                </Typography>
              </Box>
            </Alert>
          )}
          {getLowStockItems().length > 0 && (
            <Alert severity="warning">
              <Box display="flex" alignItems="center">
                <WarningIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {getLowStockItems().length} item(s) low in stock:{" "}
                  {getLowStockItems()
                    .map((item) => `${item.name} (${item.currentStock})`)
                    .join(", ")}
                </Typography>
              </Box>
            </Alert>
          )}
        </Box>
      )}

      {/* Inventory Statistics */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Items
              </Typography>
              <Typography variant="h5" component="div">
                {inventory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Out of Stock
              </Typography>
              <Typography variant="h5" component="div" color="error">
                {getOutOfStockItems().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock
              </Typography>
              <Typography variant="h5" component="div" color="warning.main">
                {getLowStockItems().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Filtered Results
              </Typography>
              <Typography variant="h5" component="div">
                {filteredInventory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <FormControl sx={{ m: 1, minWidth: 80 }}>
              <InputLabel>Unit</InputLabel>
              <Select
                value={unitFilter}
                label="Unit"
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <MenuItem value="">All Units</MenuItem>
                {[...new Set(inventory.map((item) => item.unit))].map(
                  (unit) => (
                    <MenuItem key={unit} value={unit}>
                      {getUnitDisplayText(unit)}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Stock Level</InputLabel>
              <Select
                value={stockFilter}
                label="Stock Level"
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="normal">Normal Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <FormControl sx={{ m: 1, minWidth: 80 }}>
              <InputLabel>Cost Range</InputLabel>
              <Select
                value={costFilter}
                label="Cost Range"
                onChange={(e) => setCostFilter(e.target.value)}
              >
                <MenuItem value="">All Costs</MenuItem>
                <MenuItem value="low">Low (&lt; $0.01)</MenuItem>
                <MenuItem value="medium">Medium ($0.01 - $0.10)</MenuItem>
                <MenuItem value="high">High (&gt; $0.10)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                disabled={getActiveFiltersCount() === 0}
                onClick={clearAllFilters}
              >
                Clear ({getActiveFiltersCount()})
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Filter Buttons */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          <Button
            size="small"
            variant={stockFilter === "out" ? "contained" : "outlined"}
            color="error"
            onClick={() => setStockFilter(stockFilter === "out" ? "" : "out")}
          >
            Out of Stock ({getOutOfStockItems().length})
          </Button>
          <Button
            size="small"
            variant={stockFilter === "low" ? "contained" : "outlined"}
            color="warning"
            onClick={() => setStockFilter(stockFilter === "low" ? "" : "low")}
          >
            Low Stock ({getLowStockItems().length})
          </Button>
          <Button
            size="small"
            variant={unitFilter === "ml" ? "contained" : "outlined"}
            onClick={() => setUnitFilter(unitFilter === "ml" ? "" : "ml")}
          >
            Liquids (ml)
          </Button>
          <Button
            size="small"
            variant={unitFilter === "g" ? "contained" : "outlined"}
            onClick={() => setUnitFilter(unitFilter === "g" ? "" : "g")}
          >
            Solids (g)
          </Button>
        </Box>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" mb={1}>
              Active filters:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  onDelete={() => setSearchQuery("")}
                  deleteIcon={<ClearIcon />}
                  size="small"
                />
              )}
              {unitFilter && (
                <Chip
                  label={`Unit: ${getUnitDisplayText(unitFilter)}`}
                  onDelete={() => setUnitFilter("")}
                  deleteIcon={<ClearIcon />}
                  size="small"
                />
              )}
              {stockFilter && (
                <Chip
                  label={`Stock: ${stockFilter}`}
                  onDelete={() => setStockFilter("")}
                  deleteIcon={<ClearIcon />}
                  size="small"
                />
              )}
              {costFilter && (
                <Chip
                  label={`Cost: ${costFilter}`}
                  onDelete={() => setCostFilter("")}
                  deleteIcon={<ClearIcon />}
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Low Stock Threshold Settings */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              type="number"
              label="Low Stock Threshold"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              helperText="Items below this quantity will be marked as low stock"
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </Paper>
      {/* Data Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="inventory table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" ? sortOrder : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === "unit"}
                  direction={sortBy === "unit" ? sortOrder : "asc"}
                  onClick={() => handleSort("unit")}
                >
                  Unit
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === "stock"}
                  direction={sortBy === "stock" ? sortOrder : "asc"}
                  onClick={() => handleSort("stock")}
                >
                  Current Stock
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === "cost"}
                  direction={sortBy === "cost" ? sortOrder : "asc"}
                  onClick={() => handleSort("cost")}
                >
                  Cost per Unit
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary" py={4}>
                    {inventory.length === 0
                      ? "No items found. Add your first ingredient or package to get started."
                      : "No items match your current filters. Try adjusting your search criteria."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow
                  key={item.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor:
                      item.currentStock === 0
                        ? "error.light"
                        : item.currentStock < lowStockThreshold
                        ? "warning.light"
                        : "inherit",
                    "&:hover": {
                      backgroundColor:
                        item.currentStock === 0
                          ? "error.main"
                          : item.currentStock < lowStockThreshold
                          ? "warning.main"
                          : "action.hover",
                    },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Box display="flex" alignItems="center">
                      {item.currentStock === 0 && (
                        <WarningIcon
                          color="error"
                          sx={{ mr: 1, fontSize: 20 }}
                        />
                      )}
                      {item.currentStock > 0 &&
                        item.currentStock < lowStockThreshold && (
                          <WarningIcon
                            color="warning"
                            sx={{ mr: 1, fontSize: 20 }}
                          />
                        )}
                      {item.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.category}
                      size="small"
                      color={
                        item.category === "Package" ? "secondary" : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    {item.category === "Package"
                      ? "N/A"
                      : getUnitDisplayText(item.unit)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={
                        item.currentStock === 0
                          ? "error"
                          : item.currentStock < lowStockThreshold
                          ? "warning.main"
                          : "inherit"
                      }
                      fontWeight={
                        item.currentStock <= lowStockThreshold
                          ? "bold"
                          : "normal"
                      }
                    >
                      {item.currentStock}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    ${item.costPerUnit.toFixed(4)}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      {item.category === "Ingredient" && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleEditIngredientOpen(item)}
                        >
                          Edit
                        </Button>
                      )}
                      {user?.role === "ADMIN" && (
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDelete(item)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <AddIngredientDialog
        open={addIngredientOpen}
        onClose={handleAddIngredientClose}
        refreshIngredients={fetchInventoryData}
      />
      <AddPackageDialog
        open={addPackageOpen}
        onClose={handleAddPackageClose}
        refreshPackaging={fetchInventoryData}
      />
      <EditIngredientDialog
        open={editIngredientOpen}
        onClose={handleEditIngredientClose}
        ingredient={selectedIngredient}
        refreshIngredients={fetchInventoryData}
      />
    </div>
  );
}
