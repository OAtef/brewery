import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/router";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED"
];

const STATUS_COLORS = {
  PENDING: "warning",
  CONFIRMED: "info",
  PREPARING: "primary",
  READY: "success",
  COMPLETED: "default",
  CANCELLED: "error"
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    if (user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "BARISTA") {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
        if (selectedOrder && selectedOrder.id === orderId) {
          const updatedOrder = { ...selectedOrder, status: newStatus };
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const filteredOrders = statusFilter === "ALL"
    ? orders
    : orders.filter(order => order.status === statusFilter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateOrderTotal = (order) => {
    return order.products.reduce((total, product) =>
      total + (product.unitPrice * product.quantity), 0
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6">Loading orders...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1">
          Order Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchOrders}
        >
          Refresh
        </Button>
      </Box>

      {/* Filter Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Orders</MenuItem>
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.client.name}</TableCell>
                <TableCell>{order.products.length} items</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={STATUS_COLORS[order.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(order)}
                    sx={{ mr: 1 }}
                  >
                    Details
                  </Button>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredOrders.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order #{selectedOrder?.id} Details
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="h6">Client Information</Typography>
                  <Typography>Name: {selectedOrder.client.name}</Typography>
                  <Typography>Address: {selectedOrder.client.address}</Typography>
                  <Typography>Client #: {selectedOrder.client.client_number}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Order Information</Typography>
                  <Typography>Status:
                    <Chip
                      label={selectedOrder.status}
                      color={STATUS_COLORS[selectedOrder.status]}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography>Created: {formatDate(selectedOrder.createdAt)}</Typography>
                  <Typography>Total: ${selectedOrder.total.toFixed(2)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Order Items</Typography>
              <List>
                {selectedOrder.products.map((product, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={product.product.name}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Variant: {product.recipe?.variant || "Default"}
                          </Typography>
                          <Typography variant="body2">
                            Packaging: {product.packaging.type}
                          </Typography>
                          <Typography variant="body2">
                            Quantity: {product.quantity} × ${product.unitPrice.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            Subtotal: ${(product.quantity * product.unitPrice).toFixed(2)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
