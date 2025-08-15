// Backend health check utility

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend health check passed:', data);
      return true;
    } else {
      console.warn('⚠️ Backend responded but with error status:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('❌ Backend health check failed:', error.message);
    return false;
  }
};

export const logBackendStatus = async () => {
  console.log('🔍 Checking backend status...');
  const isHealthy = await checkBackendHealth();
  
  if (isHealthy) {
    console.log('✅ Backend is running and accessible');
  } else {
    console.log('❌ Backend is not accessible - using Supabase fallback');
    console.log('💡 To start the backend server, run: cd backend && npm start');
  }
  
  return isHealthy;
};
