import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  DateRange as DateRangeIcon,
  Refresh as RefreshIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareArrowsIcon,
  Star as StarIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);

const RevenueTrends = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/revenue-trends?period=${selectedPeriod}`);
      const data = await response.json();
      setRevenueData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchRevenueData, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value) => {
    if (value > 5) return <TrendingUpIcon color="success" fontSize="small" />;
    if (value < -5) return <TrendingDownIcon color="error" fontSize="small" />;
    return <TrendingFlatIcon color="info" fontSize="small" />;
  };

  const getGrowthColor = (value) => {
    if (value > 5) return 'success.main';
    if (value < -5) return 'error.main';
    return 'info.main';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Chart data for revenue trends
  const revenueChartData = revenueData ? {
    labels: revenueData.trendData.map(day => {
      const date = new Date(day.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: `Revenue (${revenueData.summary.period})`,
        data: revenueData.trendData.map(day => day.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true,
      },
      {
        label: 'Previous Period',
        data: revenueData.comparisonData.map(day => day.revenue),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1,
        borderDash: [5, 5],
        fill: false,
      }
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trends Comparison'
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Revenue Trends Analysis
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!revenueData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Revenue Trends Analysis
          </Typography>
          <Alert severity="error">Failed to load revenue trends data</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Revenue Trends & Growth Analysis
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="day">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
            </Typography>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchRevenueData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Metrics */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="primary.main">
                      {formatCurrency(revenueData.summary.currentPeriod.totalRevenue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                  <AttachMoneyIcon color="primary" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  {getGrowthIcon(revenueData.summary.growth.revenue)}
                  <Typography 
                    variant="body2" 
                    color={getGrowthColor(revenueData.summary.growth.revenue)}
                    ml={0.5}
                  >
                    {formatPercentage(revenueData.summary.growth.revenue)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="info.main">
                      {revenueData.summary.currentPeriod.totalOrders}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Orders
                    </Typography>
                  </Box>
                  <ShoppingCartIcon color="info" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  {getGrowthIcon(revenueData.summary.growth.orders)}
                  <Typography 
                    variant="body2" 
                    color={getGrowthColor(revenueData.summary.growth.orders)}
                    ml={0.5}
                  >
                    {formatPercentage(revenueData.summary.growth.orders)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(revenueData.summary.currentPeriod.averageOrderValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Order Value
                    </Typography>
                  </Box>
                  <AssessmentIcon color="success" />
                </Box>
                <Box display="flex" alignItems="center" mt={1}>
                  {getGrowthIcon(revenueData.summary.growth.averageOrderValue)}
                  <Typography 
                    variant="body2" 
                    color={getGrowthColor(revenueData.summary.growth.averageOrderValue)}
                    ml={0.5}
                  >
                    {formatPercentage(revenueData.summary.growth.averageOrderValue)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" color="secondary.main">
                      {formatCurrency(revenueData.summary.currentPeriod.dailyAverage)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Daily Average
                    </Typography>
                  </Box>
                  <DateRangeIcon color="secondary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon color="primary" />
                  Revenue Trends
                </Typography>
                {revenueChartData && (
                  <Box sx={{ height: 400 }}>
                    <Line data={revenueChartData} options={chartOptions} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Summary */}
          <Grid item xs={12} lg={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CompareArrowsIcon color="info" />
                  Period Comparison
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Current vs Previous {selectedPeriod}
                    </Typography>
                    <Divider />
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Revenue Change
                    </Typography>
                    <Typography variant="h6" color={getGrowthColor(revenueData.summary.growth.revenue)}>
                      {formatCurrency(revenueData.summary.currentPeriod.totalRevenue - revenueData.summary.comparisonPeriod.totalRevenue)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Order Volume Change
                    </Typography>
                    <Typography variant="h6" color={getGrowthColor(revenueData.summary.growth.orders)}>
                      {revenueData.summary.currentPeriod.totalOrders - revenueData.summary.comparisonPeriod.totalOrders} orders
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Best Day
                    </Typography>
                    <Typography variant="body1">
                      {new Date(revenueData.summary.bestPerformingDay.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(revenueData.summary.bestPerformingDay.revenue)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Worst Day
                    </Typography>
                    <Typography variant="body1">
                      {new Date(revenueData.summary.worstPerformingDay.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {formatCurrency(revenueData.summary.worstPerformingDay.revenue)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Insights & Recommendations */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InsightsIcon color="primary" />
                  Business Insights & Recommendations
                </Typography>
                {[...revenueData.insights, ...revenueData.recommendations].length === 0 ? (
                  <Alert severity="success">
                    All revenue metrics are performing well! Continue monitoring trends for optimization opportunities.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {revenueData.insights.map((insight, index) => (
                      <Alert
                        key={`insight-${index}`}
                        severity={getPriorityColor(insight.priority)}
                        icon={insight.type === 'positive' ? <StarIcon /> : <WarningIcon />}
                      >
                        <Typography variant="body2">
                          <strong>Insight:</strong> {insight.message}
                        </Typography>
                      </Alert>
                    ))}
                    {revenueData.recommendations.map((rec, index) => (
                      <Alert
                        key={`rec-${index}`}
                        severity={getPriorityColor(rec.priority)}
                        action={
                          rec.improvementPotential && (
                            <Chip
                              label={`${rec.improvementPotential}% potential`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )
                        }
                      >
                        <Typography variant="body2">
                          <strong>Recommendation:</strong> {rec.message}
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

export default RevenueTrends;
