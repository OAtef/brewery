import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useCustomers } from '../../lib/hooks';

/**
 * AddCustomerDialog - Quick customer creation dialog for POS
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Callback to close dialog
 * @param {Function} onCustomerCreated - Callback when customer is created
 */
export default function AddCustomerDialog({ open, onClose, onCustomerCreated }) {
  const { createCustomer, loading } = useCustomers();
  const [formData, setFormData] = useState({
    name: '',
    client_number: '',
    address: '',
    application_used: 'POS',
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Handle input change
  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.client_number.trim()) {
      errors.client_number = 'Customer number is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const newCustomer = await createCustomer({
        name: formData.name.trim(),
        client_number: formData.client_number.trim(),
        address: formData.address.trim(),
        application_used: formData.application_used,
      });

      // Reset form
      setFormData({
        name: '',
        client_number: '',
        address: '',
        application_used: 'POS',
      });
      setFormErrors({});

      // Notify parent
      onCustomerCreated(newCustomer);

      // Close dialog
      onClose();
    } catch (error) {
      console.error('Failed to create customer:', error);
      setApiError(error.message || 'Failed to create customer. Please try again.');
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        client_number: '',
        address: '',
        application_used: 'POS',
      });
      setFormErrors({});
      setApiError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' },
      }}
    >
      <DialogTitle sx={{ fontSize: '24px', fontWeight: 600 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon />
          Add New Customer
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Name Field */}
            <TextField
              label="Customer Name"
              value={formData.name}
              onChange={handleChange('name')}
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
              required
              fullWidth
              autoFocus
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                },
              }}
            />

            {/* Customer Number Field */}
            <TextField
              label="Customer Number / Phone"
              value={formData.client_number}
              onChange={handleChange('client_number')}
              error={Boolean(formErrors.client_number)}
              helperText={formErrors.client_number || 'Unique identifier (phone, ID, etc.)'}
              required
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '18px',
                },
              }}
            />

            {/* Address Field */}
            <TextField
              label="Address (Optional)"
              value={formData.address}
              onChange={handleChange('address')}
              multiline
              rows={2}
              fullWidth
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: '16px',
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            size="large"
            sx={{ fontSize: '16px', minWidth: '100px' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
            sx={{ fontSize: '16px', minWidth: '150px' }}
          >
            {loading ? 'Adding...' : 'Add Customer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
