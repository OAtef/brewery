import { useState, useCallback } from 'react';
import customerService from '../services/customerService';

/**
 * Custom hook for managing customers/clients
 * @returns {Object} Customer operations, loading state, and error handling
 */
export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Search for customers by query (name, phone, email)
   */
  const searchCustomers = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setCustomers([]);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const data = await customerService.searchCustomers(query);
      setCustomers(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to search customers');
      setCustomers([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get customer by ID with full details
   */
  const getCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomerById(id);
      setCurrentCustomer(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch customer');
      setCurrentCustomer(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new customer
   */
  const createCustomer = useCallback(async (customerData) => {
    setLoading(true);
    setError(null);
    try {
      const newCustomer = await customerService.createCustomer(customerData);
      setCustomers((prev) => [newCustomer, ...prev]);
      setCurrentCustomer(newCustomer);
      return newCustomer;
    } catch (err) {
      setError(err.message || 'Failed to create customer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing customer
   */
  const updateCustomer = useCallback(async (id, customerData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await customerService.updateCustomer(id, customerData);
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === id ? updated : customer))
      );
      if (currentCustomer?.id === id) {
        setCurrentCustomer(updated);
      }
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update customer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentCustomer]);

  /**
   * Get customer's order history
   */
  const getCustomerOrders = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const orders = await customerService.getCustomerOrders(id);
      return orders;
    } catch (err) {
      setError(err.message || 'Failed to fetch customer orders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear current customer
   */
  const clearCustomer = useCallback(() => {
    setCurrentCustomer(null);
    setError(null);
  }, []);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setCustomers([]);
    setError(null);
  }, []);

  return {
    // State
    customers,
    currentCustomer,
    loading,
    error,

    // Operations
    searchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    getCustomerOrders,

    // Utilities
    clearCustomer,
    clearSearch,
  };
}

export default useCustomers;
