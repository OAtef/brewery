import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';

/**
 * POSCart - Shopping cart display for cashier POS
 * @param {Array} items - Cart items
 * @param {Function} onRemoveItem - Callback to remove item
 * @param {Function} onEditItem - Callback to edit item
 * @param {Function} onProceedToPayment - Callback to proceed to payment
 * @param {number} taxRate - Tax rate (default: 0.08 for 8%)
 */
export default function POSCart({
  items = [],
  onRemoveItem,
  onEditItem,
  onProceedToPayment,
  taxRate = 0.08,
}) {
  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.unitPrice || 0;
    const packagingCost = item.packaging?.costPerUnit || 0;
    const itemTotal = (itemPrice + packagingCost) * item.quantity;
    return sum + itemTotal;
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Format item display name
  const getItemDisplayName = (item) => {
    let name = item.product?.name || 'Unknown Product';

    // Handle new variant system (multiple variant groups)
    const variantNames = [];
    if (item.variants && typeof item.variants === 'object') {
      Object.values(item.variants).forEach(variant => {
        if (variant.name) {
          variantNames.push(variant.name);
        } else if (variant.variant) {
          // Legacy support
          variantNames.push(variant.variant);
        }
      });
    }

    if (variantNames.length > 0) {
      name += ` (${variantNames.join(', ')})`;
    }

    return name;
  };

  // Calculate item total
  const getItemTotal = (item) => {
    const itemPrice = item.unitPrice || 0;
    const packagingCost = item.packaging?.costPerUnit || 0;
    return (itemPrice + packagingCost) * item.quantity;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '600px',
      }}
    >
      {/* Cart Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ShoppingCartIcon />
        <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 600 }}>
          Current Order
        </Typography>
        {items.length > 0 && (
          <Chip
            label={items.length}
            size="small"
            sx={{
              ml: 'auto',
              backgroundColor: 'white',
              color: 'primary.main',
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Cart Items */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {items.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Cart is empty. Select products to add them to the order.
          </Alert>
        ) : (
          <List sx={{ p: 0 }}>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  {/* Item Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '16px' }}>
                      {getItemDisplayName(item)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => onEditItem(index)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onRemoveItem(index)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Item Details */}
                  <ListItemText
                    secondary={
                      <Box>
                        {/* Extras */}
                        {item.extras && item.extras.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            {item.extras.map((extra, i) => (
                              <Typography
                                key={i}
                                variant="body2"
                                color="success.main"
                                sx={{ fontSize: '13px', fontWeight: 500 }}
                              >
                                + {extra.name}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
                          Packaging: {item.packaging?.type || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: '14px' }}>
                            Qty: {item.quantity} × ${(item.unitPrice + (item.packaging?.costPerUnit || 0)).toFixed(2)}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              fontSize: '16px',
                              color: 'primary.main',
                            }}
                          >
                            ${getItemTotal(item).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Cart Summary */}
      <Box sx={{ p: 2, borderTop: '2px solid', borderColor: 'divider' }}>
        {/* Subtotal */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1" sx={{ fontSize: '16px' }}>
            Subtotal:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '16px', fontWeight: 500 }}>
            ${subtotal.toFixed(2)}
          </Typography>
        </Box>

        {/* Tax */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
            Tax ({(taxRate * 100).toFixed(0)}%):
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '14px' }}>
            ${tax.toFixed(2)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '20px', fontWeight: 700 }}>
            Total:
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontSize: '24px', fontWeight: 700, color: 'primary.main' }}
          >
            ${total.toFixed(2)}
          </Typography>
        </Box>

        {/* Proceed to Payment Button */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<PaymentIcon />}
          onClick={onProceedToPayment}
          disabled={items.length === 0}
          sx={{
            minHeight: '60px',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          Proceed to Payment
        </Button>
      </Box>
    </Paper>
  );
}
