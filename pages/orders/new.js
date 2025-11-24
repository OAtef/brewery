import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  IconButton,
  Drawer,
} from "@mui/material";
import { Add, ShoppingCart } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import {
  addProduct,
  removeProduct,
  clearCart,
} from "../../lib/redux/cartSlice";
import { useAuth } from "../../lib/auth";
import { useRouter } from "next/router";
import ProductSelector from "../../components/orders/ProductSelector";
import CartDrawer from "../../components/orders/CartDrawer";
import { useNotification } from "../../components/layout/NotificationProvider";

export default function NewOrder() {
  const [products, setProducts] = useState([]);
  const [clientData, setClientData] = useState({
    client_number: "",
    name: "",
    address: "",
    application_used: "waiter",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const cart = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showError, showSuccess, showWarning } = useNotification();

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  const handleClientChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleOpenProductSelector = (product) => {
    setSelectedProduct(product);
  };

  useEffect(() => {
    if (selectedProduct) {
      console.log("Selected product:", selectedProduct);
      setIsProductSelectorOpen(true);
    }
  }, [selectedProduct]);

  const handleCloseProductSelector = () => {
    setSelectedProduct(null);
    setIsProductSelectorOpen(false);
  };

  const handleProductSelect = (selection) => {
    dispatch(addProduct({
      product: selectedProduct,
      variant: selection.variant,
      packaging: selection.packaging,
      price: selection.price
    }));
    handleCloseProductSelector();
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      showError("You must be logged in to create an order.", "Authentication Required");
      return;
    }

    if (cart.length === 0) {
      showWarning("Please add at least one product to your cart before submitting the order.", "Empty Cart");
      return;
    }

    if (!clientData.client_number.trim()) {
      showError("Client number is required.", "Missing Client Information");
      return;
    }

    const orderData = {
      client: clientData,
      products: cart.map((p) => ({
        productId: p.id,
        recipeId: p.variant?.id,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        packagingId: p.packaging?.id,
      })),
      userId: user.id,
      application: "waiter",
      total: cart.reduce((acc, p) => acc + (p.unitPrice * p.quantity), 0),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(clearCart());
        showSuccess("Order created successfully! Redirecting to home page...", "Order Created");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        // Handle specific error cases
        if (res.status === 400 && data.error === "Invalid user ID") {
          showError(
            "Your session appears to be invalid. You will be logged out automatically.",
            "Session Expired"
          );
          // Auto-logout after showing error
          setTimeout(() => {
            logout("invalid_session");
          }, 2000);
        } else {
          showError(
            data.error || "An unexpected error occurred while creating your order.",
            "Order Creation Failed"
          );
        }
      }
    } catch (error) {
      console.error("Failed to create order", error);
      showError(
        "Network error occurred. Please check your connection and try again.",
        "Network Error"
      );
    }
  };

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Create New Order
        </Typography>
        <IconButton color="primary" onClick={() => setIsCartDrawerOpen(true)}>
          <ShoppingCart />
        </IconButton>
      </Box>
      <CartDrawer
        open={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
      <Box component="form" noValidate autoComplete="off" sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Client Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="client_number"
              label="Client Number"
              name="client_number"
              value={clientData.client_number}
              onChange={handleClientChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="name"
              label="Name"
              name="name"
              value={clientData.name}
              onChange={handleClientChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="address"
              label="Address"
              name="address"
              value={clientData.address}
              onChange={handleClientChange}
            />
          </Grid>
        </Grid>
      </Box>
      <Typography variant="h6" gutterBottom>
        Products
      </Typography>
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {product.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {typeof product.category === 'object' ? product.category?.name : product.category}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <IconButton
                  aria-label="add to cart"
                  onClick={() => handleOpenProductSelector(product)}
                >
                  <Add />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedProduct && (
        <ProductSelector
          open={isProductSelectorOpen}
          onClose={handleCloseProductSelector}
          productId={selectedProduct.id}
          onSelect={handleProductSelect}
        />
      )}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={handleSubmitOrder}>
          Submit Order
        </Button>
      </Box>
    </Container>
  );
}
