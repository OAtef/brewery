import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

/**
 * QuantitySelector - Large, touch-friendly quantity selector for POS
 * @param {number} quantity - Current quantity
 * @param {Function} onQuantityChange - Callback when quantity changes
 * @param {number} min - Minimum quantity (default: 1)
 * @param {number} max - Maximum quantity (default: 99)
 */
export default function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
}) {
  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Select Quantity
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {/* Minus Button */}
        <IconButton
          onClick={handleDecrement}
          disabled={quantity <= min}
          color="primary"
          sx={{
            width: '70px',
            height: '70px',
            border: '2px solid',
            borderColor: 'primary.main',
            '&:disabled': {
              borderColor: 'grey.300',
            },
          }}
        >
          <RemoveIcon sx={{ fontSize: '32px' }} />
        </IconButton>

        {/* Quantity Display */}
        <Box
          sx={{
            minWidth: '120px',
            textAlign: 'center',
            px: 3,
            py: 2,
            borderRadius: 2,
            backgroundColor: 'grey.100',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: '48px',
              fontWeight: 700,
              color: 'primary.main',
              lineHeight: 1,
            }}
          >
            {quantity}
          </Typography>
        </Box>

        {/* Plus Button */}
        <IconButton
          onClick={handleIncrement}
          disabled={quantity >= max}
          color="primary"
          sx={{
            width: '70px',
            height: '70px',
            border: '2px solid',
            borderColor: 'primary.main',
            '&:disabled': {
              borderColor: 'grey.300',
            },
          }}
        >
          <AddIcon sx={{ fontSize: '32px' }} />
        </IconButton>
      </Box>

      {/* Quick Select Buttons */}
      <Box sx={{ display: 'flex', gap: 1, mt: 3, justifyContent: 'center' }}>
        {[1, 2, 5, 10].map((num) => (
          <Button
            key={num}
            variant="outlined"
            size="small"
            onClick={() => onQuantityChange(Math.min(num, max))}
            sx={{
              minWidth: '60px',
              fontSize: '16px',
            }}
          >
            {num}
          </Button>
        ))}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 2, textAlign: 'center', fontSize: '14px' }}
      >
        Use +/- buttons or quick select
      </Typography>
    </Paper>
  );
}
