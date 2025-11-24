import { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Paper,
    Card,
    CardContent,
    Button,
    Grid,
    Stack,
    CircularProgress,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Badge,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import QueueIcon from "@mui/icons-material/Queue";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import RefreshIcon from "@mui/icons-material/Refresh";
import TimelineIcon from "@mui/icons-material/Timeline";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import WhatShotIcon from "@mui/icons-material/Whatshot";
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
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import LowStockWarnings from "../analytics/LowStockWarnings";
import WasteTracking from "../analytics/WasteTracking";
import CostAnalysis from "../analytics/CostAnalysis";
import OrderProcessingTime from "../analytics/OrderProcessingTime";
import RevenueTrends from "../analytics/RevenueTrends";

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

export default function DashboardView() {
    const [salesData, setSalesData] = useState(null);
    const [queueData, setQueueData] = useState(null);
    const [peakHoursData, setPeakHoursData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [queueLoading, setQueueLoading] = useState(false);
    const [peakHoursLoading, setPeakHoursLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("active");
    const [peakHoursPeriod, setPeakHoursPeriod] = useState("today");

    // Fetch today's sales summary
    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/analytics/sales-summary");

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setSalesData(data);
            } catch (err) {
                console.error("Error fetching sales data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();

        // Refresh data every 5 minutes
        const interval = setInterval(fetchSalesData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch order queue data
    useEffect(() => {
        const fetchQueueData = async () => {
            try {
                setQueueLoading(true);
                const response = await fetch("/api/analytics/order-queue");

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setQueueData(data);
            } catch (err) {
                console.error("Error fetching queue data:", err);
                setError(err.message);
            } finally {
                setQueueLoading(false);
            }
        };

        fetchQueueData();

        // Refresh queue data every 30 seconds for real-time updates
        const interval = setInterval(fetchQueueData, 30 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch peak hours data
    useEffect(() => {
        const fetchPeakHoursData = async () => {
            try {
                setPeakHoursLoading(true);
                const response = await fetch(
                    `/api/analytics/peak-hours?period=${peakHoursPeriod}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPeakHoursData(data);
            } catch (err) {
                console.error("Error fetching peak hours data:", err);
                setError(err.message);
            } finally {
                setPeakHoursLoading(false);
            }
        };

        fetchPeakHoursData();
    }, [peakHoursPeriod]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch("/api/analytics/order-queue", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId,
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh queue data after status update
            const queueResponse = await fetch("/api/analytics/order-queue");
            const queueData = await queueResponse.json();
            setQueueData(queueData);
        } catch (err) {
            console.error("Error updating order status:", err);
            setError(err.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const getChangeColor = (change) => {
        if (change > 0) return "success.main";
        if (change < 0) return "error.main";
        return "text.secondary";
    };

    const getChangeIcon = (change) => {
        if (change > 0) return <TrendingUpIcon />;
        if (change < 0) return <TrendingDownIcon />;
        return <AnalyticsIcon />;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "PREPARING":
                return "info";
            case "READY":
                return "success";
            case "COMPLETED":
                return "default";
            case "CANCELLED":
                return "error";
            default:
                return "default";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent":
                return "error";
            case "high":
                return "warning";
            case "normal":
                return "default";
            default:
                return "default";
        }
    };

    // Prepare chart data
    const getChartData = () => {
        if (!peakHoursData?.hourlyData) return null;

        const labels = peakHoursData.hourlyData.map((h) => h.hourLabel);
        const orderCounts = peakHoursData.hourlyData.map((h) => h.orderCount);
        const revenues = peakHoursData.hourlyData.map((h) => h.revenue);

        const busyLevelColors = peakHoursData.hourlyData.map((h) => {
            switch (h.busyLevel) {
                case "peak":
                    return "rgba(244, 67, 54, 0.8)"; // Red
                case "high":
                    return "rgba(255, 152, 0, 0.8)"; // Orange
                case "medium":
                    return "rgba(255, 193, 7, 0.8)"; // Yellow
                case "low":
                    return "rgba(76, 175, 80, 0.8)"; // Green
                default:
                    return "rgba(158, 158, 158, 0.8)"; // Grey
            }
        });

        return {
            labels,
            datasets: [
                {
                    label: "Orders",
                    data: orderCounts,
                    backgroundColor: busyLevelColors,
                    borderColor: busyLevelColors.map((color) =>
                        color.replace("0.8", "1")
                    ),
                    borderWidth: 1,
                },
            ],
        };
    };

    const getRevenueChartData = () => {
        if (!peakHoursData?.hourlyData) return null;

        const labels = peakHoursData.hourlyData.map((h) => h.hourLabel);
        const revenues = peakHoursData.hourlyData.map((h) => h.revenue);

        return {
            labels,
            datasets: [
                {
                    label: "Revenue ($)",
                    data: revenues,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Hourly Order Volume",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    const revenueChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Hourly Revenue",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return "$" + value.toFixed(2);
                    },
                },
            },
        },
    };

    const getFilteredOrders = () => {
        if (!queueData?.ordersByStatus) return [];

        switch (statusFilter) {
            case "active":
                return [
                    ...queueData.ordersByStatus.pending,
                    ...queueData.ordersByStatus.preparing,
                    ...queueData.ordersByStatus.ready,
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case "pending":
                return queueData.ordersByStatus.pending;
            case "preparing":
                return queueData.ordersByStatus.preparing;
            case "ready":
                return queueData.ordersByStatus.ready;
            case "completed":
                return queueData.ordersByStatus.completed;
            default:
                return queueData.orders || [];
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Error loading dashboard: {error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "background.default" }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    ☕ Coffee Shop Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Today&apos;s Overview - {new Date().toLocaleDateString()}
                </Typography>
            </Box>

            {/* Today's Sales Summary */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                    <LocalCafeIcon />
                    Today&apos;s Sales Summary
                </Typography>

                <Grid container spacing={3}>
                    {/* Total Revenue */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ height: "100%" }}>
                            <CardContent>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <Typography variant="h4" color="primary" fontWeight="bold">
                                            {formatCurrency(salesData?.totalRevenue || 0)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Revenue
                                        </Typography>
                                    </Box>
                                    <AttachMoneyIcon
                                        sx={{ fontSize: 40, color: "primary.main" }}
                                    />
                                </Stack>

                                {salesData?.revenueChange !== undefined && (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                color: getChangeColor(salesData.revenueChange),
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            {getChangeIcon(salesData.revenueChange)}
                                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                                                {salesData.revenueChange > 0 ? "+" : ""}
                                                {salesData.revenueChange.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            vs yesterday
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Orders */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ height: "100%" }}>
                            <CardContent>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <Typography
                                            variant="h4"
                                            color="secondary"
                                            fontWeight="bold"
                                        >
                                            {salesData?.totalOrders || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Orders
                                        </Typography>
                                    </Box>
                                    <ShoppingCartIcon
                                        sx={{ fontSize: 40, color: "secondary.main" }}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Average Order Value */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ height: "100%" }}>
                            <CardContent>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <Typography
                                            variant="h4"
                                            color="success.main"
                                            fontWeight="bold"
                                        >
                                            {formatCurrency(salesData?.averageOrderValue || 0)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Avg Order Value
                                        </Typography>
                                    </Box>
                                    <AnalyticsIcon sx={{ fontSize: 40, color: "success.main" }} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Popular Items */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ height: "100%" }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🔥 Popular Today
                                </Typography>
                                <Stack spacing={1}>
                                    {salesData?.popularItems?.slice(0, 3).map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{ flex: 1, mr: 1 }}
                                            >
                                                {item.name}
                                            </Typography>
                                            <Chip
                                                label={item.count}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    ))}
                                    {(!salesData?.popularItems ||
                                        salesData.popularItems.length === 0) && (
                                            <Typography variant="body2" color="text.secondary">
                                                No sales today yet
                                            </Typography>
                                        )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Live Order Queue */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <QueueIcon />
                        Live Order Queue
                        {queueLoading && <CircularProgress size={20} />}
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => window.location.reload()}
                        size="small"
                    >
                        Refresh
                    </Button>
                </Box>

                {/* Queue Statistics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={1}>
                            <CardContent sx={{ textAlign: "center", py: 2 }}>
                                <Typography variant="h5" color="warning.main" fontWeight="bold">
                                    {queueData?.queueStats?.totalActive || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Active Orders
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={1}>
                            <CardContent sx={{ textAlign: "center", py: 2 }}>
                                <Typography variant="h5" color="info.main" fontWeight="bold">
                                    {queueData?.queueStats?.averageWaitTime || 0}m
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Avg Wait Time
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={1}>
                            <CardContent sx={{ textAlign: "center", py: 2 }}>
                                <Typography variant="h5" color="error.main" fontWeight="bold">
                                    {queueData?.queueStats?.overdueOrders || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Overdue Orders
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card elevation={1}>
                            <CardContent sx={{ textAlign: "center", py: 2 }}>
                                <Typography variant="h5" color="success.main" fontWeight="bold">
                                    {queueData?.queueStats?.totalReady || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ready for Pickup
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filter Controls */}
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Filter Orders</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Filter Orders"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="active">
                                <Badge
                                    badgeContent={queueData?.queueStats?.totalActive}
                                    color="warning"
                                >
                                    Active Orders
                                </Badge>
                            </MenuItem>
                            <MenuItem value="pending">
                                <Badge
                                    badgeContent={queueData?.queueStats?.totalPending}
                                    color="warning"
                                >
                                    Pending
                                </Badge>
                            </MenuItem>
                            <MenuItem value="preparing">
                                <Badge
                                    badgeContent={queueData?.queueStats?.totalPreparing}
                                    color="info"
                                >
                                    Preparing
                                </Badge>
                            </MenuItem>
                            <MenuItem value="ready">
                                <Badge
                                    badgeContent={queueData?.queueStats?.totalReady}
                                    color="success"
                                >
                                    Ready
                                </Badge>
                            </MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Orders Table */}
                <TableContainer component={Paper} elevation={2}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Wait Time</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getFilteredOrders().length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography variant="body2" color="text.secondary" py={4}>
                                            {queueData?.orders?.length === 0
                                                ? "No orders in queue"
                                                : `No ${statusFilter} orders found`}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getFilteredOrders().map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                #{order.id}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {order.client?.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {order.client?.client_number}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                {order.products?.slice(0, 2).map((item, index) => (
                                                    <Typography key={index} variant="body2">
                                                        {item.quantity}x{" "}
                                                        {item.product?.name || item.recipe?.product?.name}
                                                    </Typography>
                                                ))}
                                                {order.products?.length > 2 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        +{order.products.length - 2} more items
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={getStatusColor(order.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                            >
                                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">
                                                    {order.timeSinceOrder}m
                                                </Typography>
                                                {order.isOverdue && (
                                                    <Tooltip title="Order is overdue">
                                                        <WarningIcon color="error" sx={{ fontSize: 16 }} />
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.priority}
                                                color={getPriorityColor(order.priority)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {formatCurrency(order.total)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                {order.status === "PENDING" && (
                                                    <Tooltip title="Start Preparing">
                                                        <IconButton
                                                            size="small"
                                                            color="info"
                                                            onClick={() =>
                                                                updateOrderStatus(order.id, "PREPARING")
                                                            }
                                                        >
                                                            <PlayArrowIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {order.status === "PREPARING" && (
                                                    <Tooltip title="Mark as Ready">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() =>
                                                                updateOrderStatus(order.id, "READY")
                                                            }
                                                        >
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {order.status === "READY" && (
                                                    <Tooltip title="Complete Order">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() =>
                                                                updateOrderStatus(order.id, "COMPLETED")
                                                            }
                                                        >
                                                            <CheckCircleIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {["PENDING", "PREPARING"].includes(order.status) && (
                                                    <Tooltip title="Cancel Order">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                updateOrderStatus(order.id, "CANCELLED")
                                                            }
                                                        >
                                                            <CancelIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Peak Hours Chart */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <TimelineIcon />
                        Peak Hours Analysis
                        {peakHoursLoading && <CircularProgress size={20} />}
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Period</InputLabel>
                        <Select
                            value={peakHoursPeriod}
                            label="Period"
                            onChange={(e) => setPeakHoursPeriod(e.target.value)}
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="yesterday">Yesterday</MenuItem>
                            <MenuItem value="week">Last 7 Days</MenuItem>
                            <MenuItem value="month">Last 30 Days</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={3}>
                    {/* Charts */}
                    <Grid item xs={12} lg={8}>
                        <Grid container spacing={3}>
                            {/* Order Volume Chart */}
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        {getChartData() ? (
                                            <Bar data={getChartData()} options={chartOptions} />
                                        ) : (
                                            <Box sx={{ textAlign: "center", py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No data available for the selected period
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Revenue Chart */}
                            <Grid item xs={12}>
                                <Card elevation={2}>
                                    <CardContent>
                                        {getRevenueChartData() ? (
                                            <Line
                                                data={getRevenueChartData()}
                                                options={revenueChartOptions}
                                            />
                                        ) : (
                                            <Box sx={{ textAlign: "center", py: 4 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    No revenue data available
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Insights Panel */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={2}>
                            {/* Peak Hours Summary */}
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <WhatShotIcon color="error" />
                                        Peak Hours
                                    </Typography>
                                    {peakHoursData?.insights?.peakHours?.length > 0 ? (
                                        <List dense>
                                            {peakHoursData.insights.peakHours.map((hour, index) => (
                                                <ListItem key={hour.hour} sx={{ px: 0 }}>
                                                    <ListItemIcon>
                                                        <Chip
                                                            label={`#${index + 1}`}
                                                            size="small"
                                                            color={
                                                                index === 0
                                                                    ? "error"
                                                                    : index === 1
                                                                        ? "warning"
                                                                        : "default"
                                                            }
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={hour.hourLabel}
                                                        secondary={`${hour.orderCount
                                                            } orders • ${formatCurrency(hour.revenue)}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No peak hours identified
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Rush Periods */}
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <TrendingFlatIcon color="warning" />
                                        Rush Periods
                                    </Typography>
                                    {peakHoursData?.insights?.rushPeriods?.length > 0 ? (
                                        <List dense>
                                            {peakHoursData.insights.rushPeriods.map(
                                                (period, index) => (
                                                    <ListItem key={index} sx={{ px: 0 }}>
                                                        <ListItemText
                                                            primary={`${period.startLabel} - ${period.endLabel}`}
                                                            secondary={
                                                                <Box>
                                                                    <Typography variant="body2" component="span">
                                                                        {period.orders} orders •{" "}
                                                                        {formatCurrency(period.revenue)}
                                                                    </Typography>
                                                                    <br />
                                                                    <Chip
                                                                        label={`${period.duration}h duration`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="warning"
                                                                    />
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                )
                                            )}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No rush periods identified
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Business Insights */}
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                    >
                                        <AnalyticsIcon />
                                        Key Insights
                                    </Typography>
                                    {peakHoursData?.insights ? (
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Busiest Hour
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {peakHoursData.insights.busiestHour?.hourLabel ||
                                                        "N/A"}
                                                </Typography>
                                                <Typography variant="caption">
                                                    {peakHoursData.insights.busiestHour?.orderCount || 0}{" "}
                                                    orders
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Most Revenue Hour
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {peakHoursData.insights.mostRevenueHour?.hourLabel ||
                                                        "N/A"}
                                                </Typography>
                                                <Typography variant="caption">
                                                    {formatCurrency(
                                                        peakHoursData.insights.mostRevenueHour?.revenue || 0
                                                    )}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Average Orders/Hour
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {peakHoursData.insights.averageOrdersPerHour?.toFixed(
                                                        1
                                                    ) || "0.0"}
                                                </Typography>
                                            </Box>

                                            {peakHoursData.insights.quietHours?.length > 0 && (
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Quiet Hours
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {peakHoursData.insights.quietHours.length} hours
                                                        with no orders
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Loading insights...
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Low Stock Warnings */}
            <Box sx={{ mb: 4 }}>
                <LowStockWarnings />
            </Box>

            {/* Waste Tracking */}
            <Box sx={{ mb: 4 }}>
                <WasteTracking />
            </Box>

            {/* Cost Analysis */}
            <Box sx={{ mb: 4 }}>
                <CostAnalysis />
            </Box>

            {/* Order Processing Time */}
            <Box sx={{ mb: 4 }}>
                <OrderProcessingTime />
            </Box>

            {/* Revenue Trends */}
            <Box sx={{ mb: 4 }}>
                <RevenueTrends />
            </Box>

            {/* Analytics Features Status */}
            <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
                <Typography variant="h6" gutterBottom>
                    🎉 Analytics Dashboard Complete!
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Today&apos;s Sales Summary
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Live Order Queue
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Peak Hours Chart
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Low Stock Warnings
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Waste Tracking
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Cost Analysis
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Order Processing Time
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2" color="success.main">
                            ✅ Revenue Trends
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
