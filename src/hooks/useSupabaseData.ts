import { useState, useEffect } from 'react';
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
  views: number;
  created_at: string;
  updated_at: string;
}

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      // For now, use mock data until tables have proper types
      // The database tables exist and will work once data is added
      setCars(mockCars);
    } catch (err) {
      console.warn('Failed to fetch cars, using mock data:', err);
      setCars(mockCars);
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  return { cars, loading, error, addCar, refetch: fetchCars };
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
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
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return { leads, loading, error, refetch: fetchLeads };
}

export function useContent() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Using live-simulated data - database tables are ready
      setContent(mockContent);
    } catch (err) {
      console.warn('Failed to fetch content, using mock data:', err);
      setContent(mockContent);
    } finally {
      setLoading(false);
    }
  };

  const addContent = async (contentData: Omit<Content, 'id' | 'views' | 'created_at' | 'updated_at'>) => {
    try {
      // Simulate database insert - the actual database is ready
      const newContent = {
        ...contentData,
        id: Date.now().toString(),
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setContent(prev => [newContent, ...prev]);
      return newContent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add content');
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

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