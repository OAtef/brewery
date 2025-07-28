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
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [pricingBreakdown, setPricingBreakdown] = useState(null);

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
      setCalculatedPrice(0);
      setPricingBreakdown(null);
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

  // Update calculated price when selections change
  useEffect(() => {
    const updatePrice = async () => {
      if (selectedVariant && selectedPackaging) {
        try {
          const response = await fetch(`/api/pricing/calculate?recipeId=${selectedVariant.id}&packagingId=${selectedPackaging.id}`);
          if (response.ok) {
            const pricingData = await response.json();
            setCalculatedPrice(pricingData.pricing.finalPrice || 0);
            setPricingBreakdown(pricingData.pricing);
          } else {
            // Fallback calculation
            const fallbackPrice = (selectedVariant.calculatedPrice || 0) + (selectedPackaging.costPerUnit * 2);
            setCalculatedPrice(fallbackPrice);
            setPricingBreakdown(null);
          }
        } catch (error) {
          console.error("Error fetching pricing:", error);
          // Fallback calculation
          const fallbackPrice = (selectedVariant.calculatedPrice || 0) + (selectedPackaging.costPerUnit * 2);
          setCalculatedPrice(fallbackPrice);
          setPricingBreakdown(null);
        }
      } else {
        setCalculatedPrice(0);
        setPricingBreakdown(null);
      }
    };
    updatePrice();
  }, [selectedVariant, selectedPackaging]);

  const calculatePrice = async () => {
    if (!selectedVariant || !selectedPackaging) return 0;
    
    try {
      // Get real-time calculated price from pricing API
      const response = await fetch(`/api/pricing/calculate?recipeId=${selectedVariant.id}&packagingId=${selectedPackaging.id}`);
      if (response.ok) {
        const pricingData = await response.json();
        return pricingData.pricing.finalPrice;
      } else {
        // Fallback to basic calculation if pricing API fails
        return (selectedVariant.calculatedPrice || 0) + (selectedPackaging.costPerUnit * 2);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      // Fallback calculation
      return (selectedVariant.calculatedPrice || 0) + (selectedPackaging.costPerUnit * 2);
    }
  };

  const handleConfirm = async () => {
    if (selectedVariant && selectedPackaging) {
      const price = await calculatePrice();
      onSelect({
        variant: selectedVariant,
        packaging: selectedPackaging,
        price: price,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedVariant(null);
    setSelectedPackaging(null);
    setCalculatedPrice(0);
    setPricingBreakdown(null);
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
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {variant.calculatedPrice ? 
                          `Base Price: $${variant.calculatedPrice.toFixed(2)}` : 
                          (variant.priceModifier && variant.priceModifier !== 0) ? `+$${variant.priceModifier.toFixed(2)}` : "No extra charge"
                        }
                      </Typography>
                      {variant.costBreakdown && (
                        <Typography variant="caption" color="text.secondary">
                          Cost: ${variant.costBreakdown.totalCost.toFixed(2)} | 
                          Margin: {variant.costBreakdown.profitMargin.toFixed(1)}%
                        </Typography>
                      )}
                    </Box>
                  }
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
              Total Price: ${calculatedPrice.toFixed(2)}
            </Typography>
            {pricingBreakdown ? (
              <Typography variant="body2" color="text.secondary">
                Recipe Base: ${pricingBreakdown.sellingPrice.toFixed(2)} + 
                Variant: ${(pricingBreakdown.variantModifier || 0).toFixed(2)} + 
                Packaging: ${(pricingBreakdown.packagingCost || 0).toFixed(2)}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Base: ${(selectedVariant.calculatedPrice || 0).toFixed(2)} + 
                Variant: ${(selectedVariant.priceModifier || 0).toFixed(2)} + 
                Packaging: ${(selectedPackaging.costPerUnit * 2 || 0).toFixed(2)}
              </Typography>
            )}
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
