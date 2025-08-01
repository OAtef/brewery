import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';

const LowStockWarnings = () => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/low-stock');
      const data = await response.json();
      setStockData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStockData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'error';
      case 'low': return 'warning';
      case 'warning': return 'info';
      default: return 'success';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <ErrorIcon />;
      case 'low': return <WarningIcon />;
      case 'warning': return <InfoIcon />;
      default: return <InventoryIcon />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStockPercentage = (current, dailyUsage) => {
    if (dailyUsage === 0) return 100;
    const daysLeft = current / dailyUsage;
    return Math.min(100, Math.max(0, (daysLeft / 30) * 100)); // 30 days = 100%
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Low Stock Warnings
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!stockData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Low Stock Warnings
          </Typography>
          <Alert severity="error">Failed to load stock data</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Low Stock Warnings
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
            </Typography>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchStockData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h4" color="error.main">
                  {stockData.summary.criticalItems}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Critical
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h4" color="warning.main">
                  {stockData.summary.lowStockItems}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Low Stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h4" color="info.main">
                  {stockData.summary.warningItems}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Warning
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h6" color="primary.main">
                  {formatCurrency(stockData.summary.totalReorderCost)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reorder Cost
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Low Stock Items List */}
        {stockData.lowStockItems.length === 0 ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              All ingredients are well-stocked! 🎉
            </Typography>
          </Alert>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingDownIcon color="warning" />
              Items Requiring Attention ({stockData.lowStockItems.length})
            </Typography>
            <List dense>
              {stockData.lowStockItems.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{
                    border: '1px solid',
                    borderColor: `${getStatusColor(item.status)}.light`,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: `${getStatusColor(item.status)}.main`,
                    color: 'white'
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    {getStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Chip
                          label={item.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(item.status)}
                          variant="outlined"
                          sx={{ color: 'white', borderColor: 'white' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
                          Stock: {item.currentStock} {item.unit} • 
                          Usage: {item.dailyUsage} {item.unit}/day • 
                          {item.daysUntilEmpty} days remaining
                        </Typography>
                        <Typography variant="body2" color="inherit" sx={{ opacity: 0.7 }}>
                          Suggested reorder: {item.suggestedReorderAmount} {item.unit} 
                          ({formatCurrency(item.suggestedReorderAmount * item.cost)})
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ width: 60 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getStockPercentage(item.currentStock, item.dailyUsage)}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                      {Math.round(getStockPercentage(item.currentStock, item.dailyUsage))}%
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Recent Movements */}
        {stockData.recentMovements && stockData.recentMovements.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Recent Stock Movements
            </Typography>
            <List dense>
              {stockData.recentMovements.slice(0, 3).map((movement, index) => (
                <ListItem key={index} divider={index < 2}>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{movement.ingredient}</strong> - {movement.reason}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {movement.change > 0 ? '+' : ''}{movement.change} units by {movement.user} • 
                        {new Date(movement.timestamp).toLocaleString()}
                      </Typography>
                    }
                  />
                  <Chip
                    label={movement.change > 0 ? '+' + movement.change : movement.change}
                    size="small"
                    color={movement.change > 0 ? 'success' : 'error'}
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockWarnings;
