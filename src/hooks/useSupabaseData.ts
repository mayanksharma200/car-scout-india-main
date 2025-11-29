import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Temporary mock data until database has entries and types are generated
const mockCars: Car[] = [
  {
    id: '1',
    brand: 'Maruti Suzuki',
    model: 'Swift',
    variant: 'ZXI+ AMT',
    price: 849000,
    status: 'published',
    fuel_type: 'Petrol',
    transmission: 'AMT',
    mileage: '23.2',
    seating: '5',
    description: 'Premium hatchback with advanced features',
    images: 5,
    views: 1250,
    leads: 23,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 9876543210',
    city: 'Mumbai',
    interested_car_id: '1',
    budget: '₹8-10 Lakh',
    timeline: 'Within 2 months',
    notes: 'Interested in AMT variant',
    status: 'new',
    priority: 'high',
    source: 'website',
    assigned_to: 'Sales Team A',
    api_sent: false,
    webhook_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockContent: Content[] = [
  {
    id: '1',
    title: 'Electric Vehicle Market Trends 2024',
    type: 'news',
    status: 'published',
    author: 'Auto Expert',
    category: 'Industry News',
    views: 542,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string;
  price: number;
  status: 'published' | 'draft' | 'review';
  fuel_type: string;
  transmission: string;
  mileage?: string;
  seating: string;
  description?: string;
  images: number;
  views: number;
  leads: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  interested_car_id: string;
  budget: string;
  timeline: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: string;
  assigned_to?: string;
  api_sent: boolean;
  webhook_status: 'success' | 'failed' | 'pending';
  last_contact?: string;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  title: string;
  type: 'car' | 'news' | 'page';
  status: 'published' | 'draft' | 'scheduled' | 'review';
  author?: string;
  category?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  image_url?: string;
  is_featured?: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      // For now, use mock data until database has entries and types are generated
      // The database tables exist and will work once data is added
      setCars(mockCars);
    } catch (err) {
      console.warn('Failed to fetch cars, using mock data:', err);
      setCars(mockCars);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCar = async (carData: Omit<Car, 'id' | 'views' | 'leads' | 'created_at' | 'updated_at'>) => {
    try {
      // For now, simulate database insert - the actual database is ready
      const newCar = {
        ...carData,
        id: Date.now().toString(),
        views: 0,
        leads: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setCars(prev => [newCar, ...prev]);
      return newCar;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add car');
    }
  };

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return { cars, loading, error, addCar, refetch: fetchCars };
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      // Using live-simulated data - database tables are ready
      setLeads(mockLeads);
    } catch (err) {
      console.warn('Failed to fetch leads, using mock data:', err);
      setLeads(mockLeads);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return { leads, loading, error, refetch: fetchLeads };
}

export function useContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch news from Public API
      // Use VITE_API_URL or default to /api
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/news?limit=100`); // Fetch recent news

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch news');
      }

      const newsData = result.data || [];

      // Transform news data to match Content interface
      const formattedNews = newsData.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: 'news' as const,
        status: 'published', // Public API only returns published
        author: item.author,
        category: item.category,
        slug: item.slug,
        content: item.content,
        excerpt: item.excerpt,
        image_url: item.image_url,
        is_featured: item.is_featured,
        views: item.views || 0,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setContent(formattedNews);
    } catch (err) {
      console.error('Failed to fetch content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, []);

  const addContent = async (contentData: Omit<Content, 'id' | 'views' | 'created_at' | 'updated_at'>) => {
    try {
      if (contentData.type === 'news') {
        // Get current session for token from admin cookie
        let token = null;
        const match = document.cookie.match(new RegExp('(^| )admin_session=([^;]+)'));
        if (match) {
          try {
            const session = JSON.parse(decodeURIComponent(match[2]));
            token = session.access_token;
          } catch (e) { console.error('Failed to parse admin session', e); }
        }

        if (!token) {
          throw new Error('Authentication required');
        }

        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: contentData.title,
            slug: contentData.slug || contentData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            author: contentData.author,
            category: contentData.category,
            status: contentData.status,
            content: contentData.content,
            excerpt: contentData.excerpt,
            image_url: contentData.image_url,
            is_featured: contentData.is_featured
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create news article');
        }

        const result = await response.json();
        const typedData = result.data;

        const newContent: Content = {
          id: typedData.id,
          title: typedData.title,
          type: 'news',
          status: typedData.status as any,
          author: typedData.author,
          category: typedData.category,
          slug: typedData.slug,
          content: typedData.content,
          excerpt: typedData.excerpt,
          image_url: typedData.image_url,
          is_featured: typedData.is_featured,
          views: typedData.views || 0,
          created_at: typedData.created_at,
          updated_at: typedData.updated_at
        };

        setContent(prev => [newContent, ...prev]);
        return newContent;
      }

      // Handle other types or throw error
      throw new Error('Only news content is currently supported');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add content');
    }
  };

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, loading, error, addContent, refetch: fetchContent };
}

export function useStats() {
  const { cars } = useCars();
  const { leads } = useLeads();
  const { content } = useContent();

  const stats = {
    totalCars: cars.length,
    publishedCars: cars.filter(c => c.status === 'published').length,
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
    totalContent: content.length,
    publishedContent: content.filter(c => c.status === 'published').length,
    averagePrice: cars.length > 0 ? Math.round(cars.reduce((sum, car) => sum + car.price, 0) / cars.length) : 0,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'qualified').length / leads.length) * 100) : 0
  };

  return stats;
}