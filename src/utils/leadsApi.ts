// utils/leadsApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const leadsApi = {
  async create(leadData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if user is logged in
          ...(localStorage.getItem('accessToken') && {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          })
        },
        body: JSON.stringify(leadData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Leads API error:', error);
      throw error;
    }
  }
};