import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import { usePackaging } from '../../lib/hooks';

/**
 * PackagingSelector - Touch-friendly packaging selection for POS
 * @param {Object} selectedPackaging - Currently selected packaging
 * @param {Function} onPackagingSelect - Callback when packaging is selected
 */
export default function PackagingSelector({ selectedPackaging, onPackagingSelect }) {
  const { packaging, loading, error } = usePackaging({ autoFetch: true });

  // Auto-select first packaging option if none selected
  useEffect(() => {
    if (packaging && packaging.length > 0 && !selectedPackaging) {
      onPackagingSelect(packaging[0]);
    }
  }, [packaging, selectedPackaging, onPackagingSelect]);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Alert severity="error">Failed to load packaging options</Alert>
      </Paper>
    );
  }

  if (!packaging || packaging.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Alert severity="warning">No packaging options available</Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Select Packaging
      </Typography>

      <Grid container spacing={2}>
        {packaging.map((pkg) => {
          const isSelected = selectedPackaging?.id === pkg.id;

          return (
            <Grid item xs={12} sm={6} md={4} key={pkg.id}>
              <Button
                fullWidth
                variant={isSelected ? 'contained' : 'outlined'}
                size="large"
                onClick={() => onPackagingSelect(pkg)}
                startIcon={<LocalCafeIcon sx={{ fontSize: '28px' }} />}
                sx={{
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  px: 2,
                  textAlign: 'left',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {pkg.type}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`+$${pkg.costPerUnit.toFixed(2)}`}
                      size="small"
                      color="secondary"
                      sx={{ fontSize: '12px' }}
                    />
                    {pkg.currentStock > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                        Stock: {pkg.currentStock}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Button>
            </Grid>
          );
        })}
      </Grid>

      {/* Stock Warning */}
      {selectedPackaging && selectedPackaging.currentStock < 10 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Low stock warning: Only {selectedPackaging.currentStock} {selectedPackaging.type} remaining
        </Alert>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 2, fontSize: '14px' }}
      >
        Packaging cost will be added to the total
      </Typography>
    </Paper>
  );
}
