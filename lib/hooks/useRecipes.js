import { useState, useEffect, useCallback, useMemo } from 'react';
import recipeService from '../services/recipeService';

/**
 * Custom hook for managing products and recipes
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch data automatically on mount
 * @param {Object} options.filters - Filter options for products
 * @returns {Object} Products data, loading state, error, and CRUD functions
 */
export function useRecipes(options = {}) {
  // Use useMemo to ensure filters object is stable if not provided or if stable reference passed
  const { autoFetch = true, filters: providedFilters } = options;
  const filters = useMemo(() => providedFilters || {}, [providedFilters]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all products with their recipes
   */
  const fetchProducts = useCallback(async (customFilters = {}) => {
    console.log('[useRecipes] Fetching products...');
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.getAllProducts({ ...filters, ...customFilters });
      setProducts(data);
      return data;
    } catch (err) {
      console.error('[useRecipes] Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Get a single product by ID
   */
  const getProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.getProductById(id);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new product
   */
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await recipeService.createProduct(productData);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err.message || 'Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing product
   */
  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await recipeService.updateProduct(id, productData);
      setProducts((prev) =>
        prev.map((product) => (product.id === id ? updated : product))
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a product
   */
  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await recipeService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a recipe variant for a product
   */
  const createRecipe = useCallback(async (productId, recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const newRecipe = await recipeService.createRecipe(productId, recipeData);
      // Update the product in the list to include the new recipe
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId
            ? { ...product, recipes: [...(product.recipes || []), newRecipe] }
            : product
        )
      );
      return newRecipe;
    } catch (err) {
      setError(err.message || 'Failed to create recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a recipe variant
   */
  const updateRecipe = useCallback(async (id, recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await recipeService.updateRecipe(id, recipeData);
      // Update the recipe in the product's recipes array
      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          recipes: product.recipes?.map((recipe) =>
            recipe.id === id ? updated : recipe
          ),
        }))
      );
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a recipe variant
   */
  const deleteRecipe = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await recipeService.deleteRecipe(id);
      // Remove the recipe from the product's recipes array
      setProducts((prev) =>
        prev.map((product) => ({
          ...product,
          recipes: product.recipes?.filter((recipe) => recipe.id !== id),
        }))
      );
    } catch (err) {
      setError(err.message || 'Failed to delete recipe');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh products data
   */
  const refresh = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  return {
    products,
    loading,
    error,

    // Product operations
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,

    // Recipe operations
    createRecipe,
    updateRecipe,
    deleteRecipe,

    // Utilities
    refresh,
  };
}

export default useRecipes;
