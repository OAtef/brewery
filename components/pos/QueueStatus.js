import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useOrderQueue } from '../../lib/hooks';

/**
 * QueueStatus - Compact order queue display for cashier POS
 * Shows recent/active orders with status
 */
export default function QueueStatus() {
  const { orders, loading } = useOrderQueue(15000, true); // Refresh every 15 seconds

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PREPARING: 'primary',
      READY: 'success',
      COMPLETED: 'default',
    };
    return colors[status] || 'default';
  };

  // Filter to show only active orders
  const activeOrders = orders
    .filter((order) => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status))
    .slice(0, 10);

  if (loading && activeOrders.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={30} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
        Active Orders Queue
      </Typography>

      {activeOrders.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No active orders
        </Typography>
      ) : (
        <Grid container spacing={1}>
          {activeOrders.map((order) => {
            const minutesAgo = Math.floor(
              (new Date() - new Date(order.createdAt)) / 60000
            );

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                <Box
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Order #{order.id}
                    </Typography>
                    <Chip
                      label={order.status}
                      size="small"
                      color={getStatusColor(order.status)}
                      sx={{ height: '20px', fontSize: '11px' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {order.client?.name || 'Walk-in'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: '14px', color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {minutesAgo}m ago
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Paper>
  );
}
