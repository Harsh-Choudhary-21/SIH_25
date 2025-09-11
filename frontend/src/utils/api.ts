// Dynamic API URL resolution for different environments
const getApiBaseUrl = () => {
  // Environment variable override (highest priority)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  
  // Replit cloud environment - handle port prefix pattern
  const hostname = window.location.hostname;
  const replitMatch = hostname.match(/^(\d+)-(.+)$/);
  if (replitMatch) {
    const [, , replSlug] = replitMatch;
    return `https://8000-${replSlug}`;
  }
  
  // Fallback for other cloud environments
  return `${window.location.protocol}//${hostname}:8000`;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔗 API Base URL:', API_BASE_URL); // Debug log

export const api = {
  uploadFile: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },

  getClaims: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/claims/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch claims');
    }
    
    return response.json();
  },

  getMapData: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/map/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch map data');
    }
    
    return response.json();
  },

  getRecommendations: async (claimId: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/recommend/${claimId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    return response.json();
  },
};