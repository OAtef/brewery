/**
 * Order Service
 * Handles all order-related API calls
 */

import apiClient from '../api/client';

const orderService = {
  /**
   * Get all orders with optional filters
   * @param {Object} filters - Filter parameters (status, priority, from, to)
   * @returns {Promise<Array>} List of orders
   */
  async getAllOrders(filters = {}) {
    try {
      const data = await apiClient.get('/orders', filters);
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Get a single order by ID
   * @param {number} id - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(id) {
    try {
      const data = await apiClient.get(`/orders/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      const data = await apiClient.post('/orders', orderData);
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(id, status) {
    try {
      const data = await apiClient.put(`/orders/${id}`, { status });
      return data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Update an order
   * @param {number} id - Order ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated order
   */
  async updateOrder(id, updates) {
    try {
      const data = await apiClient.put(`/orders/${id}`, updates);
      return data;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancel an order
   * @param {number} id - Order ID
   * @returns {Promise<Object>} Updated order
   */
  async cancelOrder(id) {
    try {
      const data = await apiClient.put(`/orders/${id}`, { status: 'CANCELLED' });
      return data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get order queue for barista (active orders)
   * @returns {Promise<Object>} Queue data with metrics
   */
  async getOrderQueue() {
    try {
      // This will be implemented in Phase 6
      // For now, filter orders by active statuses
      const data = await apiClient.get('/orders', {
        status: 'PENDING,CONFIRMED,PREPARING,READY',
      });
      return data;
    } catch (error) {
      console.error('Error fetching order queue:', error);
      throw error;
    }
  },

  /**
   * Update payment information (future - Phase 4)
   * @param {number} id - Order ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Updated order
   */
  async updatePayment(id, paymentData) {
    try {
      // Will be implemented in Phase 4 with new API endpoint
      const data = await apiClient.post(`/orders/${id}/payment`, paymentData);
      return data;
    } catch (error) {
      console.error(`Error updating payment for order ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update order priority (future - Phase 6)
   * @param {number} id - Order ID
   * @param {string} priority - Priority level (urgent, high, normal)
   * @returns {Promise<Object>} Updated order
   */
  async updatePriority(id, priority) {
    try {
      // Will be implemented in Phase 6 with new API endpoint
      const data = await apiClient.patch(`/orders/${id}/priority`, { priorityLevel: priority });
      return data;
    } catch (error) {
      console.error(`Error updating priority for order ${id}:`, error);
      throw error;
    }
  },
};

export default orderService;
