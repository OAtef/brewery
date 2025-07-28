import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
} from "@mui/material";

import { useState, useEffect } from "react";

export default function ProductSelector({
  open,
  onClose,
  productId,
  onSelect,
}) {
  const [variants, setVariants] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (open && productId) {
      fetchData();
    }
  }, [open, productId]);

  const fetchData = async () => {
    try {
      // Fetch product with variants
      const productRes = await fetch(`/api/products/${productId}`);
      const productData = await productRes.json();
      setProduct(productData);
      setVariants(productData.recipes || []);

      // Fetch packaging options
      const packagingRes = await fetch("/api/packaging");
      const packagingData = await packagingRes.json();
      setPackaging(packagingData);

      // Reset selections
      setSelectedVariant(null);
      setSelectedPackaging(null);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handlePackagingSelect = (pkg) => {
    setSelectedPackaging(pkg);
  };

  const handleConfirm = () => {
    if (selectedVariant && selectedPackaging) {
      const price = calculatePrice();
      onSelect({
        variant: selectedVariant,
        packaging: selectedPackaging,
        price: price,
      });
      handleClose();
    }
  };

  const calculatePrice = () => {
    if (!product || !selectedVariant || !selectedPackaging) return 0;
    return product.basePrice + selectedVariant.priceModifier + selectedPackaging.costPerUnit;
  };

  const handleClose = () => {
    setSelectedVariant(null);
    setSelectedPackaging(null);
    onClose();
  };

  const isConfirmDisabled = !selectedVariant || !selectedPackaging;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">
          {product?.name} - Select Options
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Variant:
          </Typography>
          <List>
            {variants.map((variant) => (
              <ListItem
                button
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                selected={selectedVariant?.id === variant.id}
                sx={{ 
                  border: "1px solid #ccc", 
                  mb: 1, 
                  borderRadius: 1,
                  bgcolor: selectedVariant?.id === variant.id ? "primary.light" : "inherit"
                }}
              >
                <ListItemText 
                  primary={variant.variant}
                  secondary={variant.priceModifier !== 0 ? `+$${variant.priceModifier.toFixed(2)}` : "No extra charge"}
                />
                {selectedVariant?.id === variant.id && (
                  <Chip label="Selected" color="primary" size="small" />
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Packaging:
          </Typography>
          <List>
            {packaging.map((pkg) => (
              <ListItem
                button
                key={pkg.id}
                onClick={() => handlePackagingSelect(pkg)}
                selected={selectedPackaging?.id === pkg.id}
                sx={{ 
                  border: "1px solid #ccc", 
                  mb: 1, 
                  borderRadius: 1,
                  bgcolor: selectedPackaging?.id === pkg.id ? "primary.light" : "inherit"
                }}
              >
                <ListItemText 
                  primary={pkg.type}
                  secondary={`+$${pkg.costPerUnit.toFixed(2)}`}
                />
                {selectedPackaging?.id === pkg.id && (
                  <Chip label="Selected" color="primary" size="small" />
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        {selectedVariant && selectedPackaging && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="h6">
              Total Price: ${calculatePrice().toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Base: ${product?.basePrice.toFixed(2)} + 
              Variant: ${selectedVariant.priceModifier.toFixed(2)} + 
              Packaging: ${selectedPackaging.costPerUnit.toFixed(2)}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={isConfirmDisabled}
        >
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
