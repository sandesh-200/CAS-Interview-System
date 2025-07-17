// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  // If we have a base URL, use it, otherwise use relative path
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return endpoint;
};

const config = {
  API_BASE_URL,
  getApiUrl
};

export default config; 