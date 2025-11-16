/**
 * Analytics Service
 * Handles all analytics-related API calls
 */

import apiClient from '../api/client';

const analyticsService = {
  /**
   * Get today's sales summary
   * @param {string} date - Optional date (defaults to today)
   * @returns {Promise<Object>} Sales summary data
   */
  async getSalesSummary(date = null) {
    try {
      const params = date ? { date } : {};
      const data = await apiClient.get('/analytics/sales-summary', params);
      return data;
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      throw error;
    }
  },

  /**
   * Get order queue statistics
   * @returns {Promise<Object>} Order queue data
   */
  async getOrderQueue() {
    try {
      const data = await apiClient.get('/analytics/order-queue');
      return data;
    } catch (error) {
      console.error('Error fetching order queue:', error);
      throw error;
    }
  },

  /**
   * Get peak hours analysis
   * @param {string} period - Time period (today, yesterday, week, month)
   * @returns {Promise<Object>} Peak hours data
   */
  async getPeakHours(period = 'today') {
    try {
      const data = await apiClient.get('/analytics/peak-hours', { period });
      return data;
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      throw error;
    }
  },

  /**
   * Get low stock warnings
   * @param {number} threshold - Stock threshold
   * @returns {Promise<Array>} Low stock items
   */
  async getLowStock(threshold = null) {
    try {
      const params = threshold ? { threshold } : {};
      const data = await apiClient.get('/analytics/low-stock', params);
      return data;
    } catch (error) {
      console.error('Error fetching low stock:', error);
      throw error;
    }
  },

  /**
   * Get cost analysis
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Cost analysis data
   */
  async getCostAnalysis(filters = {}) {
    try {
      const data = await apiClient.get('/analytics/cost-analysis', filters);
      return data;
    } catch (error) {
      console.error('Error fetching cost analysis:', error);
      throw error;
    }
  },

  /**
   * Get waste tracking data
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Waste tracking data
   */
  async getWasteTracking(filters = {}) {
    try {
      const data = await apiClient.get('/analytics/waste-tracking', filters);
      return data;
    } catch (error) {
      console.error('Error fetching waste tracking:', error);
      throw error;
    }
  },

  /**
   * Get order processing time metrics
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Processing time data
   */
  async getProcessingTime(filters = {}) {
    try {
      const data = await apiClient.get('/analytics/processing-time', filters);
      return data;
    } catch (error) {
      console.error('Error fetching processing time:', error);
      throw error;
    }
  },

  /**
   * Get revenue trends
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Revenue trends data
   */
  async getRevenueTrends(filters = {}) {
    try {
      const data = await apiClient.get('/analytics/revenue-trends', filters);
      return data;
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      throw error;
    }
  },
};

export default analyticsService;
