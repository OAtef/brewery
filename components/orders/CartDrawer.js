import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Divider,
  TextField,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { clearCart, removeProduct, updateQuantity } from "../../lib/redux/cartSlice";

export default function CartDrawer({ open, onClose }) {
  const cart = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleRemoveItem = (item) => {
    dispatch(removeProduct({
      product: item,
      variant: item.variant,
      packaging: item.packaging
    }));
  };

  const handleQuantityChange = (item, newQuantity) => {
    dispatch(updateQuantity({
      product: item,
      variant: item.variant,
      packaging: item.packaging,
      quantity: parseInt(newQuantity)
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Shopping Cart ({cart.length} items)
        </Typography>
        
        {cart.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
            Your cart is empty
          </Typography>
        ) : (
          <>
            <List>
              {cart.map((item, index) => (
                <ListItem key={`${item.id}-${item.variant?.id}-${item.packaging?.id}`} sx={{ px: 0 }}>
                  <Box sx={{ width: "100%" }}>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {item.variant?.variant || "Default"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.packaging?.type || "No packaging"}
                          </Typography>
                          <Typography variant="body2" color="primary">
                            ${item.unitPrice?.toFixed(2)} each
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveItem(item)}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, e.target.value)}
                        sx={{ width: 60, mx: 1 }}
                        inputProps={{ min: 1 }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleQuantityChange(item, 0)}
                        sx={{ ml: 1 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ textAlign: "right", mt: 1, fontWeight: "bold" }}>
                      Subtotal: ${(item.unitPrice * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ textAlign: "right" }}>
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
            
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClearCart}
              fullWidth
              sx={{ mb: 1 }}
            >
              Clear Cart
            </Button>
          </>
        )}
      </Box>
    </Drawer>
  );
}
