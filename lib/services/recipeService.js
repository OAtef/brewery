/**
 * Recipe Service
 * Handles all product and recipe-related API calls
 */

import apiClient from '../api/client';

const recipeService = {
  // ========== PRODUCTS ==========

  /**
   * Get all products with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} List of products
   */
  async getAllProducts(filters = {}) {
    try {
      const data = await apiClient.get('/products', filters);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID (includes recipes)
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product details with recipes
   */
  async getProductById(id) {
    try {
      const data = await apiClient.get(`/products/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData) {
    try {
      const data = await apiClient.post('/products', productData);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Update a product
   * @param {number} id - Product ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(id, updates) {
    try {
      const data = await apiClient.put(`/products/${id}`, updates);
      return data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product
   * @param {number} id - Product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(id) {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // ========== RECIPES ==========

  /**
   * Get all recipes
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>} List of recipes
   */
  async getAllRecipes(filters = {}) {
    try {
      const data = await apiClient.get('/recipes', filters);
      return data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  /**
   * Get a single recipe by ID
   * @param {number} id - Recipe ID
   * @returns {Promise<Object>} Recipe details
   */
  async getRecipeById(id) {
    try {
      const data = await apiClient.get(`/recipes/${id}`);
      return data;
    } catch (error) {
      console.error(`Error fetching recipe ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new recipe (variant)
   * @param {Object} recipeData - Recipe data including productId
   * @returns {Promise<Object>} Created recipe
   */
  async createRecipe(recipeData) {
    try {
      const data = await apiClient.post('/recipes', recipeData);
      return data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  /**
   * Update a recipe
   * @param {number} id - Recipe ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated recipe
   */
  async updateRecipe(id, updates) {
    try {
      const data = await apiClient.put(`/recipes/${id}`, updates);
      return data;
    } catch (error) {
      console.error(`Error updating recipe ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a recipe
   * @param {number} id - Recipe ID
   * @returns {Promise<void>}
   */
  async deleteRecipe(id) {
    try {
      await apiClient.delete(`/recipes/${id}`);
    } catch (error) {
      console.error(`Error deleting recipe ${id}:`, error);
      throw error;
    }
  },
};

export default recipeService;
