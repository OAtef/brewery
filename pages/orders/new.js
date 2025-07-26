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
import VariantSelector from "../../components/VariantSelector";
import CartDrawer from "../../components/CartDrawer";

export default function NewOrder() {
  const [products, setProducts] = useState([]);
  const [clientData, setClientData] = useState({
    client_number: "",
    name: "",
    address: "",
    application_used: "waiter",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVariantSelectorOpen, setIsVariantSelectorOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const cart = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const router = useRouter();

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

  const handleOpenVariantSelector = (product) => {
    setSelectedProduct(product);
  };

  useEffect(() => {
    if (selectedProduct) {
      console.log("Selected product:", selectedProduct);

      setIsVariantSelectorOpen(true);
    }
  }, [selectedProduct]);

  const handleCloseVariantSelector = () => {
    setSelectedProduct(null);
    setIsVariantSelectorOpen(false);
  };

  const handleVariantSelect = (variant) => {
    dispatch(addProduct({ product: selectedProduct, variant }));
    handleCloseVariantSelector();
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      alert("You must be logged in to create an order.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const orderData = {
      client: clientData,
      products: cart.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        packagingId: p.variant.id,
      })),
      userId: user.id,
      application: "waiter",
      total: cart.reduce(
        (acc, p) =>
          acc +
          p.recipes[0].ingredients.reduce(
            (acc, i) => acc + i.ingredient.costPerUnit * i.quantity,
            0
          ) *
            p.quantity,
        0
      ),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        dispatch(clearCart());
        router.push("/");
      } else {
        const error = await res.json();
        alert(`Failed to create order: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to create order", error);
      alert("An unexpected error occurred. Please try again.");
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
              required
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
              required
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
                  {product.category}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <IconButton
                  aria-label="add to cart"
                  onClick={() => handleOpenVariantSelector(product)}
                >
                  <Add />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selectedProduct && (
        <VariantSelector
          open={isVariantSelectorOpen}
          onClose={handleCloseVariantSelector}
          productId={selectedProduct.id}
          onSelect={handleVariantSelect}
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
