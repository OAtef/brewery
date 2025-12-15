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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Delete as DeleteIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const WasteTracking = () => {
  const [wasteData, setWasteData] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newWasteEntry, setNewWasteEntry] = useState({
    ingredientId: '',
    amount: '',
    reason: ''
  });

  const fetchWasteData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/waste-tracking?period=${selectedPeriod}`);
      const data = await response.json();
      setWasteData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching waste data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/analytics/low-stock');
      const data = await response.json();
      setIngredients(data.allItems || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  useEffect(() => {
    fetchWasteData();
    fetchIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWasteData, 30 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const handleAddWaste = async () => {
    try {
      const response = await fetch('/api/analytics/waste-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWasteEntry),
      });

      if (response.ok) {
        setDialogOpen(false);
        setNewWasteEntry({ ingredientId: '', amount: '', reason: '' });
        fetchWasteData();
      } else {
        console.error('Failed to add waste entry');
      }
    } catch (error) {
      console.error('Error adding waste entry:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'success';
    if (efficiency >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Waste Tracking
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!wasteData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Waste Tracking
          </Typography>
          <Alert severity="error">Failed to load waste data</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Waste Tracking & Cost Analysis
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
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Log Waste
            </Button>
            <Typography variant="caption" color="text.secondary">
              {lastUpdated && `Updated: ${lastUpdated.toLocaleTimeString()}`}
            </Typography>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchWasteData} disabled={loading}>
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
                  {formatCurrency(wasteData.summary.totalWasteCost)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Waste Cost
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h4" color="warning.main">
                  {wasteData.summary.totalWasteEvents}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Waste Events
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h4" color={getEfficiencyColor(wasteData.summary.averageWasteEfficiency)}>
                  {wasteData.summary.averageWasteEfficiency}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Efficiency
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={3}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h4" color="success.main">
                  {wasteData.recommendations.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recommendations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Worst Performers */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon color="error" />
                  Highest Waste Cost
                </Typography>
                {wasteData.worstPerformers.length === 0 ? (
                  <Alert severity="success">No significant waste detected! 🎉</Alert>
                ) : (
                  <List dense>
                    {wasteData.worstPerformers.map((item, index) => (
                      <ListItem key={item.id} divider={index < wasteData.worstPerformers.length - 1}>
                        <ListItemIcon>
                          <DeleteIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">{item.name}</Typography>
                              <Typography variant="h6" color="error.main">
                                {formatCurrency(item.wasteCost)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {item.actualWaste} {item.unit} wasted • {item.wasteEvents} events
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

          {/* Best Performers */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon color="success" />
                  Best Efficiency
                </Typography>
                {wasteData.bestPerformers.length === 0 ? (
                  <Alert severity="info">All ingredients at baseline efficiency</Alert>
                ) : (
                  <List dense>
                    {wasteData.bestPerformers.map((item, index) => (
                      <ListItem key={item.id} divider={index < wasteData.bestPerformers.length - 1}>
                        <ListItemIcon>
                          <TrendingUpIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">{item.name}</Typography>
                              <Typography variant="h6" color="success.main">
                                {item.wasteEfficiency}%
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {item.actualWaste} {item.unit} wasted • Cost: {formatCurrency(item.wasteCost)}
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
                  Waste Reduction Recommendations
                </Typography>
                {wasteData.recommendations.length === 0 ? (
                  <Alert severity="success">
                    Excellent waste management! No recommendations at this time.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {wasteData.recommendations.map((rec, index) => (
                      <Alert
                        key={index}
                        severity={getPriorityColor(rec.priority)}
                        action={
                          <Chip
                            label={`Save ${formatCurrency(rec.estimatedSavings)}`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        }
                      >
                        <Typography variant="body2">
                          <strong>{rec.ingredient}:</strong> {rec.message}
                        </Typography>
                      </Alert>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Waste Events */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="info" />
                  Recent Waste Events
                </Typography>
                {wasteData.recentWasteEvents.length === 0 ? (
                  <Alert severity="info">No waste events recorded for this period</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Ingredient</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="right">Cost</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {wasteData.recentWasteEvents.slice(0, 5).map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>{event.ingredient}</TableCell>
                            <TableCell align="right">
                              {event.amount} {event.unit}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="error.main">
                                {formatCurrency(event.cost)}
                              </Typography>
                            </TableCell>
                            <TableCell>{event.reason.replace('waste: ', '')}</TableCell>
                            <TableCell>{event.user}</TableCell>
                            <TableCell>
                              {new Date(event.timestamp).toLocaleString()}
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
        </Grid>

        {/* Add Waste Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Log Waste Entry</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Ingredient</InputLabel>
                <Select
                  value={newWasteEntry.ingredientId}
                  onChange={(e) => setNewWasteEntry({ ...newWasteEntry, ingredientId: e.target.value })}
                >
                  {ingredients.map((ingredient) => (
                    <MenuItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.currentStock} {ingredient.unit} available)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Amount Wasted"
                type="number"
                value={newWasteEntry.amount}
                onChange={(e) => setNewWasteEntry({ ...newWasteEntry, amount: e.target.value })}
                fullWidth
              />
              <TextField
                label="Reason for Waste"
                value={newWasteEntry.reason}
                onChange={(e) => setNewWasteEntry({ ...newWasteEntry, reason: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="e.g., spilled during preparation, expired, contaminated..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddWaste}
              variant="contained"
              disabled={!newWasteEntry.ingredientId || !newWasteEntry.amount || !newWasteEntry.reason}
            >
              Log Waste
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WasteTracking;
