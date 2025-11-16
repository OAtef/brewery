/**
 * useOrders Hook
 * Custom hook for managing orders
 */

import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService';

export function useOrders(initialFilters = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getAllOrders(filters);
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('useOrders error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Create order
  const createOrder = async (orderData) => {
    try {
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err.message || 'Failed to create order');
      throw err;
    }
  };

  // Update order status
  const updateOrderStatus = async (id, status) => {
    try {
      const updated = await orderService.updateOrderStatus(id, status);
      setOrders(prev =>
        prev.map(order => (order.id === id ? updated : order))
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      throw err;
    }
  };

  // Cancel order
  const cancelOrder = async (id) => {
    try {
      const updated = await orderService.cancelOrder(id);
      setOrders(prev =>
        prev.map(order => (order.id === id ? updated : order))
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
      throw err;
    }
  };

  // Refresh data
  const refresh = () => {
    fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    filters,
    setFilters,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    refresh,
  };
}
