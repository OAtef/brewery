/**
 * API Client
 * Centralized HTTP client for all API requests
 * Provides consistent error handling, request/response formatting
 */

class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  /**
   * Generic request handler
   * @private
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
          errorData.error ||
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      // Network errors or other issues
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional fetch options
   */
  async get(endpoint, params = {}, options = {}) {
    // Build query string from params
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Additional fetch options
   */
  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

// Export singleton instance
const apiClient = new ApiClient('/api');

export default apiClient;
