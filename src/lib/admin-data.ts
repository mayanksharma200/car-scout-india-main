// Shared data management for admin modules
export interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string;
  price: number;
  status: 'published' | 'draft' | 'review';
  lastUpdated: string;
  views: number;
  leads: number;
  images: number;
  fuelType?: string;
  transmission?: string;
  mileage?: string;
  seating?: string;
  description?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  interestedCar: {
    brand: string;
    model: string;
    variant: string;
  };
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'lost';
  source: string;
  priority: 'high' | 'medium' | 'low';
  budget: string;
  timeline: string;
  assignedTo: string;
  createdAt: string;
  lastContact: string | null;
  notes: string;
  apiSent: boolean;
  webhookStatus: 'success' | 'failed' | 'pending';
}

export interface Content {
  id: number;
  title: string;
  type: 'car' | 'news' | 'page';
  status: 'published' | 'draft' | 'scheduled' | 'review';
  lastModified: string;
  views: number;
  price?: string;
  images?: number;
  source?: string;
  author?: string;
  category?: string;
  slug?: string;
}

// Shared car inventory - used by both Car Management and Content Management
let carsData: Car[] = [
  {
    id: "1",
    brand: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXI+ AMT",
    price: 849000,
    status: "published",
    lastUpdated: "2024-01-20",
    views: 2847,
    leads: 45,
    images: 8,
    fuelType: "Petrol",
    transmission: "AMT",
    mileage: "23.2",
    seating: "5"
  },
  {
    id: "2",
    brand: "Hyundai",
    model: "Creta",
    variant: "SX(O) Turbo DCT",
    price: 1999000,
    status: "published",
    lastUpdated: "2024-01-18",
    views: 5632,
    leads: 89,
    images: 12,
    fuelType: "Petrol",
    transmission: "DCT",
    mileage: "16.8",
    seating: "5"
  },
  {
    id: "3",
    brand: "Tata",
    model: "Nexon EV",
    variant: "Max XZ+ Lux",
    price: 1799000,
    status: "draft",
    lastUpdated: "2024-01-15",
    views: 0,
    leads: 0,
    images: 5,
    fuelType: "Electric",
    transmission: "Automatic",
    mileage: "312",
    seating: "5"
  },
  {
    id: "4",
    brand: "Mahindra",
    model: "XUV700",
    variant: "AX7 Diesel AT",
    price: 2399000,
    status: "published",
    lastUpdated: "2024-01-12",
    views: 3421,
    leads: 67,
    images: 15,
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: "16.5",
    seating: "7"
  },
  {
    id: "5",
    brand: "Honda",
    model: "City",
    variant: "ZX CVT",
    price: 1599000,
    status: "review",
    lastUpdated: "2024-01-10",
    views: 1234,
    leads: 23,
    images: 9,
    fuelType: "Petrol",
    transmission: "CVT",
    mileage: "17.8",
    seating: "5"
  }
];

// Leads data that references actual cars
let leadsData: Lead[] = [
  {
    id: "L001",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    city: "Mumbai",
    interestedCar: {
      brand: "Maruti Suzuki",
      model: "Swift",
      variant: "ZXI+ AMT"
    },
    status: "new",
    source: "website",
    priority: "high",
    budget: "₹8-10 Lakh",
    timeline: "Within 1 month",
    assignedTo: "Sales Team A",
    createdAt: "2024-01-20T10:30:00Z",
    lastContact: null,
    notes: "Interested in automatic transmission. First time buyer.",
    apiSent: true,
    webhookStatus: "success"
  },
  {
    id: "L002",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 87654 32109",
    city: "Delhi",
    interestedCar: {
      brand: "Hyundai",
      model: "Creta",
      variant: "SX(O)"
    },
    status: "contacted",
    source: "comparison",
    priority: "medium",
    budget: "₹15-20 Lakh",
    timeline: "Within 2 months",
    assignedTo: "Sales Team B",
    createdAt: "2024-01-19T14:20:00Z",
    lastContact: "2024-01-20T09:15:00Z",
    notes: "Looking for family SUV. Comparing with other brands.",
    apiSent: true,
    webhookStatus: "success"
  },
  {
    id: "L003",
    name: "Amit Patel",
    email: "amit.patel@email.com",
    phone: "+91 76543 21098",
    city: "Bangalore",
    interestedCar: {
      brand: "Tata",
      model: "Nexon EV",
      variant: "Max XZ+"
    },
    status: "qualified",
    source: "emi_calculator",
    priority: "high",
    budget: "₹18-22 Lakh",
    timeline: "Within 3 weeks",
    assignedTo: "EV Specialist",
    createdAt: "2024-01-18T11:45:00Z",
    lastContact: "2024-01-19T16:30:00Z",
    notes: "Very interested in electric vehicles. Ready to book.",
    apiSent: false,
    webhookStatus: "pending"
  },
  {
    id: "L004",
    name: "Sunita Reddy",
    email: "sunita.reddy@email.com",
    phone: "+91 65432 10987",
    city: "Hyderabad",
    interestedCar: {
      brand: "Mahindra",
      model: "XUV700",
      variant: "AX7"
    },
    status: "proposal_sent",
    source: "loan_application",
    priority: "medium",
    budget: "₹22-25 Lakh",
    timeline: "Within 6 weeks",
    assignedTo: "Premium Team",
    createdAt: "2024-01-17T16:20:00Z",
    lastContact: "2024-01-19T11:00:00Z",
    notes: "Interested in 7-seater SUV. Loan approved.",
    apiSent: true,
    webhookStatus: "success"
  },
  {
    id: "L005",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 54321 09876",
    city: "Pune",
    interestedCar: {
      brand: "Honda",
      model: "City",
      variant: "ZX CVT"
    },
    status: "lost",
    source: "reviews",
    priority: "low",
    budget: "₹12-15 Lakh",
    timeline: "Delayed",
    assignedTo: "Sales Team A",
    createdAt: "2024-01-15T13:10:00Z",
    lastContact: "2024-01-17T10:45:00Z",
    notes: "Decided to postpone purchase due to personal reasons.",
    apiSent: true,
    webhookStatus: "failed"
  }
];

// Content data that syncs with car inventory
let contentData: Content[] = [];

// Initialize content data from cars
const initializeContentData = () => {
  const carContent = carsData.map(car => ({
    id: parseInt(car.id),
    title: `${car.brand} ${car.model} ${car.variant}`,
    type: 'car' as const,
    status: car.status,
    lastModified: car.lastUpdated,
    views: car.views,
    price: formatPrice(car.price),
    images: car.images,
    source: "manual"
  }));

  const newsContent = [
    {
      id: 100,
      title: "Electric Vehicle Market Trends 2024",
      type: 'news' as const,
      status: 'published' as const,
      lastModified: "2024-01-16",
      views: 850,
      author: "Auto Expert",
      category: "Industry News"
    },
    {
      id: 101,
      title: "New Safety Regulations for Cars",
      type: 'news' as const,
      status: 'scheduled' as const,
      lastModified: "2024-01-15",
      views: 0,
      author: "Safety Team",
      category: "Regulations"
    }
  ];

  const pageContent = [
    {
      id: 200,
      title: "About Us",
      type: 'page' as const,
      status: 'published' as const,
      lastModified: "2024-01-10",
      views: 2100,
      slug: "/about"
    },
    {
      id: 201,
      title: "Privacy Policy",
      type: 'page' as const,
      status: 'published' as const,
      lastModified: "2024-01-08",
      views: 430,
      slug: "/privacy"
    }
  ];

  contentData = [...carContent, ...newsContent, ...pageContent];
};

const formatPrice = (price: number) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)} Lakh`;
  }
  return `₹${price.toLocaleString()}`;
};

// Initialize content data
initializeContentData();

// Data access functions
export const getCars = (): Car[] => carsData;
export const getLeads = (): Lead[] => leadsData;
export const getContent = (): Content[] => contentData;

// Car management functions
export const addCar = (car: Omit<Car, 'id' | 'views' | 'leads' | 'lastUpdated'>): Car => {
  const newCar: Car = {
    ...car,
    id: (Math.max(...carsData.map(c => parseInt(c.id))) + 1).toString(),
    views: 0,
    leads: 0,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  
  carsData.push(newCar);
  
  // Also add to content data
  const newContent: Content = {
    id: parseInt(newCar.id),
    title: `${newCar.brand} ${newCar.model} ${newCar.variant}`,
    type: 'car',
    status: newCar.status,
    lastModified: newCar.lastUpdated,
    views: newCar.views,
    price: formatPrice(newCar.price),
    images: newCar.images,
    source: "manual"
  };
  
  contentData.push(newContent);
  
  return newCar;
};

export const updateCar = (id: string, updates: Partial<Car>): Car | null => {
  const index = carsData.findIndex(car => car.id === id);
  if (index === -1) return null;
  
  carsData[index] = { ...carsData[index], ...updates, lastUpdated: new Date().toISOString().split('T')[0] };
  
  // Update corresponding content
  const contentIndex = contentData.findIndex(content => content.id === parseInt(id) && content.type === 'car');
  if (contentIndex !== -1) {
    contentData[contentIndex] = {
      ...contentData[contentIndex],
      title: `${carsData[index].brand} ${carsData[index].model} ${carsData[index].variant}`,
      status: carsData[index].status,
      lastModified: carsData[index].lastUpdated,
      views: carsData[index].views,
      price: formatPrice(carsData[index].price),
      images: carsData[index].images
    };
  }
  
  return carsData[index];
};

export const deleteCar = (id: string): boolean => {
  const index = carsData.findIndex(car => car.id === id);
  if (index === -1) return false;
  
  carsData.splice(index, 1);
  
  // Remove from content data
  const contentIndex = contentData.findIndex(content => content.id === parseInt(id) && content.type === 'car');
  if (contentIndex !== -1) {
    contentData.splice(contentIndex, 1);
  }
  
  return true;
};

// Lead management functions
export const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>): Lead => {
  const newLead: Lead = {
    ...lead,
    id: `L${(Math.max(...leadsData.map(l => parseInt(l.id.slice(1)))) + 1).toString().padStart(3, '0')}`,
    createdAt: new Date().toISOString()
  };
  
  leadsData.push(newLead);
  
  // Update lead count for the interested car
  const car = carsData.find(c => 
    c.brand === newLead.interestedCar.brand && 
    c.model === newLead.interestedCar.model
  );
  if (car) {
    updateCar(car.id, { leads: car.leads + 1 });
  }
  
  return newLead;
};

export const updateLead = (id: string, updates: Partial<Lead>): Lead | null => {
  const index = leadsData.findIndex(lead => lead.id === id);
  if (index === -1) return null;
  
  leadsData[index] = { ...leadsData[index], ...updates };
  return leadsData[index];
};

// Content management functions
export const addContent = (content: Omit<Content, 'id' | 'views' | 'lastModified'>): Content => {
  const newContent: Content = {
    ...content,
    id: Math.max(...contentData.map(c => c.id)) + 1,
    views: 0,
    lastModified: new Date().toISOString().split('T')[0]
  };
  
  contentData.push(newContent);
  return newContent;
};

export const updateContent = (id: number, updates: Partial<Content>): Content | null => {
  const index = contentData.findIndex(content => content.id === id);
  if (index === -1) return null;
  
  contentData[index] = { ...contentData[index], ...updates, lastModified: new Date().toISOString().split('T')[0] };
  return contentData[index];
};

export const deleteContent = (id: number): boolean => {
  const index = contentData.findIndex(content => content.id === id);
  if (index === -1) return false;
  
  // Don't allow deleting car content that comes from car inventory
  const content = contentData[index];
  if (content.type === 'car') {
    return false; // Car content should be managed through Car Management
  }
  
  contentData.splice(index, 1);
  return true;
};

// Analytics functions
export const getCarsByBrand = () => {
  const brands = carsData.reduce((acc, car) => {
    acc[car.brand] = (acc[car.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(brands).map(([brand, count]) => ({ brand, count }));
};

export const getLeadsByStatus = () => {
  const statuses = leadsData.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(statuses).map(([status, count]) => ({ status, count }));
};

export const getTopPerformingCars = () => {
  return carsData
    .filter(car => car.status === 'published')
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 5);
};