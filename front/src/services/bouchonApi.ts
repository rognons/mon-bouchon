// API service for fetching bouchons data
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://mon-bouchon-api.rognons.fr';

export interface BouchonData {
  id: number;
  name: string;
  address: string;
  district: string;
  neighborhood: string;
  phone: string;
  rating: number;
  baseMenuPrice?: string;
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
  compagnieFavorite?: boolean;
  wineFavorite?: boolean;
  bouchonLyonnaisLabel?: boolean;
  authenticSelection?: boolean;
  description?: string;
  imageUrl?: string;
  reservation?: boolean;
  terrace?: boolean;
  capacity?: number;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  data: BouchonData[];
}

export class BouchonApiService {
  static async getAllBouchons(): Promise<BouchonData[]> {
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

  static async searchBouchons(filters: Record<string, string>): Promise<BouchonData[]> {
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


}
