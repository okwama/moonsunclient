// Centralized API Configuration
export const API_CONFIG = {
  // Base URL - using HTTP for Digital Ocean server
  BASE_URL: 'http://64.226.66.235/api',
  
  // Socket URL for real-time features
  SOCKET_URL: 'http://64.226.66.235',
  
  // Timeout configuration
  TIMEOUT: 10000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint.slice(1) 
    : endpoint;
  
  return `${baseUrl}/${cleanEndpoint}`;
};

// Helper function to get socket URL
export const getSocketUrl = (): string => {
  return API_CONFIG.SOCKET_URL;
};

export default API_CONFIG; 