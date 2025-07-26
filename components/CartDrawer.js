import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../lib/redux/cartSlice";

export default function CartDrawer({ open, onClose }) {
  const cart = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 250, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Shopping Cart
        </Typography>
        <List>
          {cart.map((item) => (
            <ListItem key={`${item.id}-${item.variant?.id}`}>
              <ListItemText
                primary={item.name}
                secondary={`Variant: ${
                  item.variant?.variant || "N/A"
                } - Quantity: ${item.quantity}`}
              />
            </ListItem>
          ))}
        </List>
        {cart.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleClearCart}
            fullWidth
          >
            Clear Cart
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
