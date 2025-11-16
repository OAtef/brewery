/**
 * Packaging Service
 * Handles all packaging-related API calls
 */

import apiClient from '../api/client';

const packagingService = {
  /**
   * Get all packaging types
   * @returns {Promise<Array>} List of packaging types
   */
  async getAllPackaging() {
    try {
      const data = await apiClient.get('/packaging');
      return data;
    } catch (error) {
      console.error('Error fetching packaging:', error);
      throw error;
    }
  },

  /**
   * Get a single packaging by ID
   * @param {number} id - Packaging ID
   * @returns {Promise<Object>} Packaging details
   */
  async getPackagingById(id) {
    try {
      const data = await apiClient.get(`/packaging/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching packaging ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new packaging type
   * @param {Object} packagingData - Packaging data
   * @returns {Promise<Object>} Created packaging
   */
  async createPackaging(packagingData) {
    try {
      const data = await apiClient.post('/packaging', packagingData);
      return data;
    } catch (error) {
      console.error('Error creating packaging:', error);
      throw error;
    }
  },

  /**
   * Update a packaging type
   * @param {number} id - Packaging ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated packaging
   */
  async updatePackaging(id, updates) {
    try {
      const data = await apiClient.put(`/packaging/${id}`, updates);
      return data;
    } catch (error) {
      console.error(`Error updating packaging ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete (soft delete) a packaging type
   * @param {number} id - Packaging ID
   * @returns {Promise<Object>} Deleted packaging
   */
  async deletePackaging(id) {
    try {
      const data = await apiClient.delete(`/packaging/${id}`);
      return data;
    } catch (error) {
      console.error(`Error deleting packaging ${id}:`, error);
      throw error;
    }
  },
};

export default packagingService;
