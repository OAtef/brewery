/**
 * Ingredient Service
 * Handles all ingredient and packaging-related API calls
 */

import apiClient from '../api/client';

const ingredientService = {
  /**
   * Get all ingredients with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} List of ingredients
   */
  async getAllIngredients(filters = {}) {
    try {
      const data = await apiClient.get('/ingredient', filters);
      return data;
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      throw error;
    }
  },

  /**
   * Get a single ingredient by ID
   * @param {number} id - Ingredient ID
   * @returns {Promise<Object>} Ingredient details
   */
  async getIngredientById(id) {
    try {
      const data = await apiClient.get(`/ingredient/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching ingredient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new ingredient
   * @param {Object} ingredientData - Ingredient data
   * @returns {Promise<Object>} Created ingredient
   */
  async createIngredient(ingredientData) {
    try {
      const data = await apiClient.post('/ingredient', ingredientData);
      return data;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  },

  /**
   * Update an ingredient
   * @param {number} id - Ingredient ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated ingredient
   */
  async updateIngredient(id, updates) {
    try {
      const data = await apiClient.put(`/ingredient/${id}`, updates);
      return data;
    } catch (error) {
      console.error(`Error updating ingredient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete (soft delete) an ingredient
   * @param {number} id - Ingredient ID
   * @returns {Promise<Object>} Deleted ingredient
   */
  async deleteIngredient(id) {
    try {
      const data = await apiClient.delete(`/ingredient/${id}`);
      return data;
    } catch (error) {
      console.error(`Error deleting ingredient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Check if ingredient name is available
   * @param {string} name - Ingredient name
   * @returns {Promise<Object>} Availability status
   */
  async checkNameAvailability(name) {
    try {
      const data = await apiClient.get('/ingredient/checkName', { name });
      return data;
    } catch (error) {
      console.error('Error checking ingredient name:', error);
      throw error;
    }
  },

  /**
   * Update ingredient stock level
   * @param {number} id - Ingredient ID
   * @param {number} change - Stock change amount (positive or negative)
   * @param {string} reason - Reason for change
   * @returns {Promise<Object>} Updated ingredient
   */
  async updateStock(id, change, reason) {
    try {
      const data = await apiClient.patch(`/ingredient/${id}`, {
        stockChange: change,
        reason,
      });
      return data;
    } catch (error) {
      console.error(`Error updating stock for ingredient ${id}:`, error);
      throw error;
    }
  },
};

export default ingredientService;
