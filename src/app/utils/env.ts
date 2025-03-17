// Environment variable utilities

// API base URL with default fallback to localhost if not set
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:81';

// Helper function to get full API URL
export const getApiUrl = (path: string): string => {
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Remove trailing slash from base URL if it exists
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
    
  return `${baseUrl}/${cleanPath}`;
}; 