/**
 * useInventory Hook
 * Custom hook for managing ingredients and packaging
 */

import { useState, useEffect, useCallback } from 'react';
import ingredientService from '../services/ingredientService';
import packagingService from '../services/packagingService';

export function useInventory(type = 'ingredients') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const service = type === 'ingredients' ? ingredientService : packagingService;

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = type === 'ingredients'
        ? await ingredientService.getAllIngredients()
        : await packagingService.getAllPackaging();

      setItems(data);
    } catch (err) {
      setError(err.message || `Failed to fetch ${type}`);
      console.error(`useInventory (${type}) error:`, err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Create item
  const createItem = async (itemData) => {
    try {
      const newItem = type === 'ingredients'
        ? await ingredientService.createIngredient(itemData)
        : await packagingService.createPackaging(itemData);

      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err.message || `Failed to create ${type.slice(0, -1)}`);
      throw err;
    }
  };

  // Update item
  const updateItem = async (id, updates) => {
    try {
      const updated = type === 'ingredients'
        ? await ingredientService.updateIngredient(id, updates)
        : await packagingService.updatePackaging(id, updates);

      setItems(prev =>
        prev.map(item => (item.id === id ? updated : item))
      );
      return updated;
    } catch (err) {
      setError(err.message || `Failed to update ${type.slice(0, -1)}`);
      throw err;
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    try {
      type === 'ingredients'
        ? await ingredientService.deleteIngredient(id)
        : await packagingService.deletePackaging(id);

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message || `Failed to delete ${type.slice(0, -1)}`);
      throw err;
    }
  };

  // Refresh data
  const refresh = () => {
    fetchItems();
  };

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh,
  };
}

// Specific hooks for convenience
export function useIngredients() {
  return useInventory('ingredients');
}

export function usePackaging() {
  return useInventory('packaging');
}
