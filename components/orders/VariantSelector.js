import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Button,
} from "@mui/material";

import { useState, useEffect } from "react";

export default function VariantSelector({
  open,
  onClose,
  productId,
  onSelect,
}) {
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (open && productId) {
      async function fetchVariants() {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        setVariants(data.recipes || []);
      }
      fetchVariants();
    }
  }, [open, productId]);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select a Variant</DialogTitle>
      <DialogContent>
        <List>
          {variants.map((variant) => (
            <ListItem
              button
              key={variant.id}
              onClick={() => onSelect(variant)}
              sx={{ border: "1px solid #ccc", mb: 1 }}
            >
              <ListItemText primary={variant.variant} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
