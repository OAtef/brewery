import React from 'react';
import { Box, Typography, Button, Divider, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

/**
 * Receipt - Print-ready receipt component
 * @param {Object} orderData - Complete order data including items, customer, payment
 * @param {Function} onPrint - Optional callback when print is triggered
 */
export default function Receipt({ orderData, onPrint }) {
  if (!orderData) return null;

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  const receiptDate = new Date(orderData.createdAt || Date.now());

  return (
    <Box>
      {/* Print Button (hidden when printing) */}
      <Box sx={{ mb: 2, '@media print': { display: 'none' } }}>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          fullWidth
          size="large"
        >
          Print Receipt
        </Button>
      </Box>

      {/* Receipt Content */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          maxWidth: '400px',
          mx: 'auto',
          fontFamily: 'monospace',
          '@media print': {
            boxShadow: 'none',
            p: 2,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            COFFEE SHOP
          </Typography>
          <Typography variant="body2">Receipt</Typography>
          <Typography variant="caption" display="block">
            {receiptDate.toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Receipt Info */}
        <Box sx={{ mb: 2 }}>
          {orderData.receiptNumber && (
            <Typography variant="body2">
              Receipt #: {orderData.receiptNumber}
            </Typography>
          )}
          <Typography variant="body2">Order #: {orderData.id}</Typography>
          {orderData.cashier && (
            <Typography variant="body2">Cashier: {orderData.cashier}</Typography>
          )}
          {orderData.customer && (
            <Typography variant="body2">Customer: {orderData.customer.name}</Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Items */}
        <Box sx={{ mb: 2 }}>
          {orderData.items?.map((item, index) => (
            <Box key={index} sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ${((item.unitPrice + (item.packagingCost || 0)) * item.quantity).toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {item.quantity} × ${(item.unitPrice + (item.packagingCost || 0)).toFixed(2)}
                {item.packaging && ` (${item.packaging})`}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Totals */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Subtotal:</Typography>
            <Typography variant="body2">${orderData.subtotal?.toFixed(2) || '0.00'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Tax:</Typography>
            <Typography variant="body2">${orderData.tax?.toFixed(2) || '0.00'}</Typography>
          </Box>
          {orderData.discount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Discount:</Typography>
              <Typography variant="body2">-${orderData.discount.toFixed(2)}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Total */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            TOTAL:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ${orderData.total?.toFixed(2) || '0.00'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Payment Info */}
        {orderData.paymentMethod && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Payment: {orderData.paymentMethod}
            </Typography>
            {orderData.paymentMethod === 'CASH' && (
              <>
                <Typography variant="body2">
                  Tendered: ${orderData.amountPaid?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2">
                  Change: ${orderData.changeGiven?.toFixed(2) || '0.00'}
                </Typography>
              </>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Footer */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Thank you for your purchase!
          </Typography>
          <Typography variant="caption">
            Please come again
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
