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
  Timer as TimerIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  BarChart as BarChartIcon
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
import { Bar, Line } from 'react-chartjs-2';

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

const OrderProcessingTime = () => {
  const [processingData, setProcessingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchProcessingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/processing-time?period=${selectedPeriod}`);
      const data = await response.json();
      setProcessingData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching processing time data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcessingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  useEffect(() => {
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchProcessingData, 2 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const formatTime = (minutes) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}s`;
    }
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'simple': return 'success';
      case 'medium': return 'warning';
      case 'complex': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Chart data for hourly trends
  const hourlyTrendsChartData = processingData ? {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Average Processing Time (minutes)',
        data: processingData.hourlyTrends.map(trend => trend.averageProcessingTime || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Order Count',
        data: processingData.hourlyTrends.map(trend => trend.totalOrders),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ],
  } : null;

  const hourlyTrendsChartOptions = {
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
          text: 'Hour of Day'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Processing Time (minutes)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Order Count'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Processing Time Trends by Hour'
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Processing Time
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!processingData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Processing Time
          </Typography>
          <Alert severity="error">Failed to load processing time data</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Order Processing Time & Efficiency
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
              <IconButton size="small" onClick={fetchProcessingData} disabled={loading}>
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
                  {formatTime(processingData.summary.averageProcessingTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color="info.main">
                  {formatTime(processingData.summary.medianProcessingTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Median Time
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color="success.main">
                  {formatTime(processingData.summary.minProcessingTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fastest Order
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color="error.main">
                  {formatTime(processingData.summary.maxProcessingTime)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Slowest Order
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h5" color={getPerformanceColor(processingData.summary.performanceScore)}>
                  {processingData.summary.performanceScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Performance Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Complexity Breakdown */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon color="primary" />
                  Order Complexity
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(processingData.complexityBreakdown).map(([complexity, data]) => (
                    <Box key={complexity}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={complexity.toUpperCase()}
                            size="small"
                            color={getComplexityColor(complexity)}
                          />
                          <Typography variant="body2">
                            {data.count} orders
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                          {data.count > 0 ? formatTime(data.averageTime) : '-'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={data.count > 0 ? Math.min(100, (data.averageTime / 8) * 100) : 0}
                        color={getComplexityColor(complexity)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Benchmarks */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon color="info" />
                  Performance vs Targets
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(processingData.benchmarks.target).map(([complexity, target]) => {
                    const actual = processingData.benchmarks.actual[complexity];
                    const isOnTarget = actual <= target || actual === 0;
                    
                    return (
                      <Box key={complexity}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" textTransform="capitalize">
                            {complexity}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            {isOnTarget ? (
                              <CheckCircleIcon color="success" fontSize="small" />
                            ) : (
                              <WarningIcon color="warning" fontSize="small" />
                            )}
                            <Typography variant="body2" fontWeight="medium">
                              {actual > 0 ? formatTime(actual) : '-'} / {formatTime(target)}
                            </Typography>
                          </Box>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={actual > 0 ? Math.min(100, (target / actual) * 100) : 100}
                          color={isOnTarget ? 'success' : 'warning'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="secondary" />
                  Recent Orders
                </Typography>
                {processingData.recentOrders.length === 0 ? (
                  <Alert severity="info">No orders in this period</Alert>
                ) : (
                  <List dense>
                    {processingData.recentOrders.slice(0, 5).map((order, index) => (
                      <ListItem key={order.id} divider={index < 4}>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2">
                                Order #{order.id}
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {formatTime(order.processingTimeMinutes)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {order.productCount} items • {order.uniqueProducts} products
                              </Typography>
                              <br />
                              <Chip
                                label={order.complexity}
                                size="small"
                                color={getComplexityColor(order.complexity)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Hourly Trends Chart */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon color="primary" />
                  Processing Time Trends
                </Typography>
                {hourlyTrendsChartData && (
                  <Box sx={{ height: 400 }}>
                    <Bar data={hourlyTrendsChartData} options={hourlyTrendsChartOptions} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Efficiency Insights & Recommendations */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon color="primary" />
                  Efficiency Insights & Recommendations
                </Typography>
                {[...processingData.efficiencyInsights, ...processingData.recommendations].length === 0 ? (
                  <Alert severity="success">
                    Excellent processing efficiency! All metrics are within optimal ranges.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {processingData.efficiencyInsights.map((insight, index) => (
                      <Alert
                        key={`insight-${index}`}
                        severity={getPriorityColor(insight.priority)}
                      >
                        <Typography variant="body2">
                          <strong>Insight:</strong> {insight.message}
                        </Typography>
                      </Alert>
                    ))}
                    {processingData.recommendations.map((rec, index) => (
                      <Alert
                        key={`rec-${index}`}
                        severity={getPriorityColor(rec.priority)}
                        action={
                          rec.improvementPotential && (
                            <Chip
                              label={`${rec.improvementPotential}% improvement`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )
                        }
                      >
                        <Typography variant="body2">
                          <strong>{rec.complexity?.toUpperCase() || 'General'}:</strong> {rec.message}
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

export default OrderProcessingTime;
