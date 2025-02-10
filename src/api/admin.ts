import { apiClient } from "./apiClient";
import paths from "./paths";

export interface AnalyticsData {
  period: string;
  count: number;
  change: string;
}

export interface Analytic {
  [key: string]: AnalyticsData[]; // Allow dynamic keys
  booking: AnalyticsData[];
  agent: AnalyticsData[];
  customer: AnalyticsData[];
  superagent: AnalyticsData[];
  yacht: AnalyticsData[];
  earnings: AnalyticsData[];
}

export interface BookingFilters {
    status: 'all' | 'today' | 'previous' | 'upcoming';
    bookedBy: 'all' | 'agent' | 'customer';
    searchName?: string;
}

export interface YachtFilters {
    status: 'all' | 'recent' | 'requested' | 'denied' ;
    searchName?: string;
}
  
export interface BookingData {
  _id: string;
  name: string;
  capacity: number;
  startingPrice: string;
  imageUrl: string;
  yacht: string;
  status: string;
  bookedBy: string;
  listStatus: string;
}

export interface BookingsResponse {
    bookings: BookingData[];
}

// customer
export interface CustomerData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    bookings: string[];
    isVerified: boolean;
    createdAt: string;
  }
  
  export interface CustomerFilters {
    type: 'all' | 'withBookings' | 'withoutBookings';
    searchQuery?: string;
  }
  
  export interface CustomerResponse {
    customers: CustomerData[];
  }

// agent
export interface AgentData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    bookings: string[];
    isVerified: boolean;
    superagentName: string;
    createdAt: string;
  }
  
  export interface AgentFilters {
    type: 'all' | 'withBookings' | 'withoutBookings';
    searchQuery?: string;
  }
  
  export interface AgentResponse {
    agents: AgentData[];
  }

// super agent
export interface SuperAgentData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    agentCount: number;
    isVerified: boolean;
    createdAt: string;
  }
  
  export interface SuperAgentFilters {
    searchQuery?: string;
  }
  
  export interface SuperAgentResponse {
    superAgents: SuperAgentData[];
  }

// earnings
export interface PaymentData {
    totalBookings: number;
    totalEarnings: number;
  }
  
  export interface EarningsFilters {
    period: 'total' | 'today' | 'lastWeek' | 'lastMonth';
  }
  
  export interface PaymentResponse {
    payments: PaymentData[];
  }

// dashboard

export interface BookingDataPoint {
    month: string;
    totalBookings: number;
    customerBookings: number;
    agentBookings: number;
    year?: string; // for Overall filter
  }
  
  export interface EarningDataPoint {
    month: string;
    amount: number;
    year?: string; // for Overall filter
  }
  
  export interface DistributionData {
    customerPercentage: number;
    agentPercentage: number;
    customerValue: number;
    agentValue: number;
  }
  
  export interface DashboardFilters {
    bookingView: 'thisYear' | 'overall';
    earningView: 'thisYear' | 'overall';
    distributionView: 'thisYear' | 'thisMonth';
  }
  
  export interface DashboardResponse {
    bookings: {
      data: BookingDataPoint[];
      total: number;
      byCustomer: number;
      byAgent: number;
    };
    earnings: {
      data: EarningDataPoint[];
      total: number;
    };
    distribution: {
      bookings: DistributionData;
      earnings: DistributionData;
    };
  }


export const adminAPI = {
  getAnalytics: async (route: string): Promise<Analytic> => {
    const response = await apiClient.get(`${paths.getAnalytics}?route=${route}`);
    return response.data;
  },

  getBookings: async (filters: BookingFilters): Promise<BookingsResponse[]> => {
    const response = await apiClient.post(paths.getAllBookings, filters);
    return response.data;
  },

  getYachts: async (filters: YachtFilters): Promise<BookingsResponse[]> => {
    const response = await apiClient.post(paths.getAllYatchs, filters);
    return response.data;
  },
  getCustomers: async (filters: CustomerFilters): Promise<CustomerResponse> => {
    const response = await apiClient.post(paths.getAllCustomers, filters);
    return response.data;
  },
  getAgents: async (filters: AgentFilters): Promise<AgentResponse> => {
    const response = await apiClient.post(paths.getAllAgents, filters);
    return response.data;
  },
  getSuperAgents: async (filters: SuperAgentFilters): Promise<SuperAgentResponse> => {
    const response = await apiClient.post(paths.getAllSuperAgents, filters);
    return response.data;
  },
  getPayments: async (filters: EarningsFilters): Promise<PaymentResponse> => {
    const response = await apiClient.post(paths.getAllPayments, filters);
    return response.data;
  },
  getDashboardData: async (filters: DashboardFilters): Promise<DashboardResponse> => {
    const response = await apiClient.post(paths.getDashboardData, filters);
    return response.data;
  },
};