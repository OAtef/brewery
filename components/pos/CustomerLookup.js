import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Button,
  Autocomplete,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import { useCustomers } from '../../lib/hooks';

/**
 * CustomerLookup - Search and select customers for POS orders
 * @param {Object} selectedCustomer - Currently selected customer
 * @param {Function} onCustomerSelect - Callback when customer is selected
 * @param {Function} onAddNewCustomer - Callback to open add customer dialog
 */
export default function CustomerLookup({
  selectedCustomer,
  onCustomerSelect,
  onAddNewCustomer,
}) {
  const { customers, loading, searchCustomers, clearSearch } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input change
  const handleSearchChange = useCallback(
    async (event, value) => {
      setSearchQuery(value);
      if (value && value.length >= 2) {
        try {
          await searchCustomers(value);
        } catch (error) {
          console.error('Customer search error:', error);
        }
      } else {
        clearSearch();
      }
    },
    [searchCustomers, clearSearch]
  );

  // Handle customer selection
  const handleCustomerSelect = (event, value) => {
    if (value) {
      onCustomerSelect(value);
      setSearchQuery('');
      clearSearch();
    }
  };

  // Clear selected customer
  const handleClearCustomer = () => {
    onCustomerSelect(null);
    setSearchQuery('');
    clearSearch();
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Customer</Typography>
        {selectedCustomer && (
          <Button
            size="small"
            onClick={handleClearCustomer}
            sx={{ fontSize: '12px' }}
          >
            Change Customer
          </Button>
        )}
      </Box>

      {/* Selected Customer Display */}
      {selectedCustomer ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: 'success.light',
            border: '2px solid',
            borderColor: 'success.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon sx={{ color: 'success.dark' }} />
            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '18px' }}>
              {selectedCustomer.name}
            </Typography>
            <Chip label="Selected" color="success" size="small" />
          </Box>
          {selectedCustomer.client_number && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Customer #: {selectedCustomer.client_number}
            </Typography>
          )}
          {selectedCustomer.address && (
            <Typography variant="body2" color="text.secondary">
              Address: {selectedCustomer.address}
            </Typography>
          )}
        </Box>
      ) : (
        <>
          {/* Customer Search */}
          <Autocomplete
            freeSolo
            options={customers}
            loading={loading}
            inputValue={searchQuery}
            onInputChange={handleSearchChange}
            onChange={handleCustomerSelect}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.name || '';
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.client_number} {option.address && `• ${option.address}`}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Customer"
                placeholder="Enter name or phone number"
                fullWidth
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '18px',
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText="No customers found - try adding a new one"
          />

          {/* Add New Customer Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={onAddNewCustomer}
            sx={{
              mt: 2,
              minHeight: '50px',
              fontSize: '16px',
            }}
          >
            Add New Customer
          </Button>

          {/* Helper Text */}
          <Alert severity="info" sx={{ mt: 2 }}>
            Search for existing customer or add a new one to continue
          </Alert>
        </>
      )}
    </Paper>
  );
}
