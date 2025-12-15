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
  Chip,
  Button,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  Lightbulb as LightbulbIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalOffer as LocalOfferIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

const CostAnalysis = () => {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchCostData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/cost-analysis?period=${selectedPeriod}`);
      const data = await response.json();
      setCostData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  useEffect(() => {
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchCostData, 2 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percent) => {
    return `${percent}%`;
  };

  const getMarginColor = (margin) => {
    if (margin >= 50) return 'success';
    if (margin >= 30) return 'warning';
    return 'error';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cost Analysis & Profitability
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!costData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cost Analysis & Profitability
          </Typography>
          <Alert severity="error">Failed to load cost analysis data</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Cost Analysis & Profitability
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
            </Typography>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchCostData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color="primary.main">
                  {formatCurrency(costData.summary.totalRevenue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color="error.main">
                  {formatCurrency(costData.summary.totalCosts)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Costs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(costData.summary.totalProfit)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Profit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color={getMarginColor(costData.summary.overallProfitMargin)}>
                  {formatPercentage(costData.summary.overallProfitMargin)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Profit Margin
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color="info.main">
                  {formatCurrency(costData.summary.averageOrderValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Order Value
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Most Profitable Products */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  Most Profitable Products
                </Typography>
                {costData.mostProfitableProducts.length === 0 ? (
                  <Alert severity="info">No product data available</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Margin</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Profit/Unit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {costData.mostProfitableProducts.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {product.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {typeof product.category === 'object' ? product.category?.name : product.category} • Sold: {product.totalQuantitySold}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={formatPercentage(product.profitMargin)}
                                color={getMarginColor(product.profitMargin)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="primary.main">
                                {formatCurrency(product.totalRevenue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="success.main">
                                {formatCurrency(product.profitPerUnit)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Least Profitable Products */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon color="error" />
                  Products Needing Attention
                </Typography>
                {costData.leastProfitableProducts.length === 0 ? (
                  <Alert severity="success">All products are performing well! 🎉</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Margin</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Cost/Unit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {costData.leastProfitableProducts.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {product.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {typeof product.category === 'object' ? product.category?.name : product.category} • Sold: {product.totalQuantitySold}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={formatPercentage(product.profitMargin)}
                                color={getMarginColor(product.profitMargin)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="primary.main">
                                {formatCurrency(product.totalRevenue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="error.main">
                                {formatCurrency(product.averageCostPerUnit)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Cost Efficiency Metrics */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="info" />
                  Cost Efficiency Metrics
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Ingredient Cost %</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatPercentage(costData.costEfficiencyMetrics.ingredientCostPercentage)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Packaging Cost %</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatPercentage(costData.costEfficiencyMetrics.packagingCostPercentage)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Profit per Order</Typography>
                    <Typography variant="body2" fontWeight="medium" color="success.main">
                      {formatCurrency(costData.costEfficiencyMetrics.profitPerOrder)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Cost per Order</Typography>
                    <Typography variant="body2" fontWeight="medium" color="error.main">
                      {formatCurrency(costData.costEfficiencyMetrics.costPerOrder)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Total Orders</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {costData.summary.totalOrders}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Ingredient Cost Breakdown */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PieChartIcon color="primary" />
                  Top Ingredient Costs
                </Typography>
                {costData.ingredientCostBreakdown.length === 0 ? (
                  <Alert severity="info">No ingredient cost data available for this period</Alert>
                ) : (
                  <List dense>
                    {costData.ingredientCostBreakdown.slice(0, 5).map((ingredient, index) => (
                      <ListItem key={index} divider={index < 4}>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" fontWeight="medium">
                                {ingredient.name}
                              </Typography>
                              <Typography variant="body2" color="error.main">
                                {formatCurrency(ingredient.totalCost)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {ingredient.totalQuantityUsed} {ingredient.unit} used •
                              {formatCurrency(ingredient.costPerUnit)}/{ingredient.unit}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon color="primary" />
                  Cost Optimization Recommendations
                </Typography>
                {costData.recommendations.length === 0 ? (
                  <Alert severity="success">
                    Your cost structure is well-optimized! No immediate recommendations.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {costData.recommendations.map((rec, index) => (
                      <Alert
                        key={index}
                        severity={getPriorityColor(rec.priority)}
                        action={
                          rec.type === 'margin_improvement' ? (
                            <Chip
                              label={`${formatPercentage(rec.currentMargin)} margin`}
                              size="small"
                              color={getMarginColor(rec.currentMargin)}
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label={`${formatCurrency(rec.costImpact)} impact`}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )
                        }
                      >
                        <Typography variant="body2">
                          <strong>
                            {rec.product || rec.ingredient}:
                          </strong> {rec.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          Suggested: {rec.suggestedAction}
                        </Typography>
                      </Alert>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CostAnalysis;
