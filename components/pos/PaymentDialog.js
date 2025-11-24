import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/**
 * PaymentDialog - Complete payment processing dialog for POS
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Callback to close dialog
 * @param {number} totalAmount - Total amount to pay
 * @param {Function} onPaymentComplete - Callback when payment is completed
 */
export default function PaymentDialog({
  open,
  onClose,
  totalAmount = 0,
  onPaymentComplete,
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountTendered, setAmountTendered] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setPaymentMethod('CASH');
      setAmountTendered('');
      setError(null);
      setProcessing(false);
    }
  }, [open]);

  // Calculate change
  const tenderedAmount = parseFloat(amountTendered) || 0;
  const change = tenderedAmount - totalAmount;



  // Validate payment
  const validatePayment = () => {
    if (paymentMethod === 'CASH') {
      if (!amountTendered || tenderedAmount === 0) {
        setError('Please enter amount tendered');
        return false;
      }
      if (tenderedAmount < totalAmount) {
        setError(`Insufficient payment. Need $${totalAmount.toFixed(2)}`);
        return false;
      }
    }
    return true;
  };

  // Handle payment completion
  const handleCompletePayment = async () => {
    if (!validatePayment()) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const paymentData = {
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        amountPaid: paymentMethod === 'CASH' ? tenderedAmount : totalAmount,
        changeGiven: paymentMethod === 'CASH' ? change : 0,
      };

      await onPaymentComplete(paymentData);
      // Dialog will be closed by parent component
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={processing ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' },
      }}
    >
      <DialogTitle sx={{ fontSize: '24px', fontWeight: 600 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon />
          Complete Payment
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Total Amount Display */}
        <Box
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'primary.light',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, fontSize: '16px' }}>
            Total Amount
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontSize: '48px', fontWeight: 700, color: 'primary.main' }}
          >
            ${totalAmount.toFixed(2)}
          </Typography>
        </Box>

        {/* Payment Method Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Payment Method
          </Typography>
          <ToggleButtonGroup
            value={paymentMethod}
            exclusive
            onChange={(e, value) => value && setPaymentMethod(value)}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                minHeight: '70px',
                fontSize: '16px',
              },
            }}
          >
            <ToggleButton value="CASH">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <AttachMoneyIcon sx={{ fontSize: '28px' }} />
                Cash
              </Box>
            </ToggleButton>
            <ToggleButton value="CARD">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <CreditCardIcon sx={{ fontSize: '28px' }} />
                Card
              </Box>
            </ToggleButton>
            <ToggleButton value="MOBILE_PAYMENT">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <PhoneAndroidIcon sx={{ fontSize: '28px' }} />
                Mobile Pay
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Cash Payment Section */}
        {paymentMethod === 'CASH' && (
          <>
            {/* Amount Tendered Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                Amount Tendered
              </Typography>
              <TextField
                fullWidth
                autoFocus
                type="number"
                value={amountTendered}
                onChange={(e) => {
                  setAmountTendered(e.target.value);
                  setError(null);
                }}
                placeholder="Enter amount"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontWeight: 600 }}>$</Typography>,
                  sx: {
                    fontSize: '24px',
                    fontWeight: 600,
                  },
                }}
              />
            </Box>

            {/* Change Display */}
            {tenderedAmount > 0 && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: change >= 0 ? 'success.light' : 'error.light',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {change >= 0 ? 'Change' : 'Still Owed'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ${Math.abs(change).toFixed(2)}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Card/Mobile Payment Section */}
        {(paymentMethod === 'CARD' || paymentMethod === 'MOBILE_PAYMENT') && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {paymentMethod === 'CARD'
              ? 'Please process card payment on terminal'
              : 'Please complete mobile payment and confirm'}
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          disabled={processing}
          size="large"
          sx={{ fontSize: '16px', minWidth: '120px' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCompletePayment}
          variant="contained"
          disabled={processing}
          size="large"
          startIcon={processing ? <CircularProgress size={20} /> : <PaymentIcon />}
          sx={{ fontSize: '16px', minWidth: '180px' }}
        >
          {processing ? 'Processing...' : 'Complete Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
