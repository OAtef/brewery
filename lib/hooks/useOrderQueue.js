/**
 * useOrderQueue Hook
 * Custom hook for barista order queue with auto-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../services/orderService';

export function useOrderQueue(refreshInterval = 10000, autoRefresh = true) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    avgProcessingTime: 0,
    overdueCount: 0,
  });
  const [isPaused, setIsPaused] = useState(!autoRefresh);
  const intervalRef = useRef(null);

  // Fetch queue data
  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await orderService.getOrderQueue();

      // Sort by priority and created time
      const sortedOrders = Array.isArray(data) ? data.sort((a, b) => {
        // Priority levels: urgent > high > normal
        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
        const priorityA = priorityOrder[a.priorityLevel] || 2;
        const priorityB = priorityOrder[b.priorityLevel] || 2;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If same priority, sort by created time (oldest first)
        return new Date(a.createdAt) - new Date(b.createdAt);
      }) : [];

      setOrders(sortedOrders);

      // Calculate metrics
      const now = new Date();
      const metrics = {
        total: sortedOrders.length,
        pending: sortedOrders.filter(o => o.status === 'PENDING').length,
        preparing: sortedOrders.filter(o => o.status === 'PREPARING').length,
        ready: sortedOrders.filter(o => o.status === 'READY').length,
        avgProcessingTime: 0, // Calculate based on actual data
        overdueCount: sortedOrders.filter(o => {
          const minutesSinceCreated = (now - new Date(o.createdAt)) / 1000 / 60;
          return o.status === 'PENDING' && minutesSinceCreated > 15;
        }).length,
      };

      setMetrics(metrics);
    } catch (err) {
      setError(err.message || 'Failed to fetch order queue');
      console.error('useOrderQueue error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    fetchQueue();

    if (!isPaused && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchQueue, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchQueue, isPaused, refreshInterval]);

  // Update order status
  const updateOrderStatus = async (id, status) => {
    try {
      const updated = await orderService.updateOrderStatus(id, status);
      setOrders(prev =>
        prev.filter(order => order.id !== id || ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(updated.status))
          .map(order => (order.id === id ? updated : order))
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      throw err;
    }
  };

  // Manual refresh
  const refresh = () => {
    fetchQueue();
  };

  // Pause/resume auto-refresh
  const pause = () => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resume = () => {
    setIsPaused(false);
  };

  return {
    orders,
    loading,
    error,
    metrics,
    isPaused,
    updateOrderStatus,
    refresh,
    pause,
    resume,
  };
}
