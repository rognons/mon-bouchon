// API service for fetching bouchons data
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

export interface BouchonData {
  name: string;
  address: string;
  neighborhood: string;
  postalCode?: string;
  phone?: string;
  rating?: number;
  openingHours?: string;
  portionSize?: string;
  specialties?: string[];
  eaterType?: string;
  atmosphereType?: string;
  tableType?: string;
  bouchonType?: string;
  vegetarianOption?: boolean;
  machonOption?: boolean;
  remarkableDecoration?: boolean;
  remarkableTeam?: boolean;
  compagnieFavorite?: boolean;
  wineFavorite?: boolean;
  bouchonLyonnaisLabel?: boolean;
  authenticSelection?: boolean;
  description?: string;
  imageUrl?: string;
  reservation?: boolean;
  terrace?: boolean;
  capacity?: number;
  dateFriendly?: boolean;
  businessMeal?: boolean;
  menuPrice?: number;
  mapsUrl?: string;
  articleUrl?: string;
  menuUrl?: string;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  data: BouchonData[];
}

export async function getAllBouchons(): Promise<BouchonData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/bouchons`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error('API returned error response');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to fetch bouchons from API:', error);

    // No fallback - we want to use API only
    console.error('API is not available, cannot fetch bouchons data');
    throw new Error('API is not available');
  }
}

export async function searchBouchons(filters: Record<string, string>): Promise<BouchonData[]> {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/bouchons?${params}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error('API returned error response');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to search bouchons from API:', error);
    throw error;
  }
}
