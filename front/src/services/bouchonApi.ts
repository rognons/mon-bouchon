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

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  data: BouchonData[];
  pagination?: PaginationInfo;
}

export interface PaginatedResponse {
  data: BouchonData[];
  pagination: PaginationInfo;
}

export interface FilterOptions {
  arrondissements: string[];
  neighborhoods: string[];
  portionSizes: string[];
  eaterTypes: string[];
  atmosphereTypes: string[];
  bouchonTypes: string[];
}

export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    const response = await fetch(`${API_BASE_URL}/filters`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result: { success: boolean; data: FilterOptions } = await response.json();

    if (!result.success) {
      throw new Error('API returned error response');
    }

    return result.data;
  } catch (error) {
    console.error('Failed to fetch filter options from API:', error);
    throw new Error('API is not available');
  }
}

export async function searchBouchons(
  filters: Record<string, string>,
  page: number = 1
): Promise<PaginatedResponse> {
  try {
    const params = new URLSearchParams({
      ...filters,
      page: String(page),
    });
    const response = await fetch(`${API_BASE_URL}/bouchons?${params}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error('API returned error response');
    }

    return {
      data: result.data,
      pagination: result.pagination || {
        page: 1,
        pageSize: result.data.length,
        totalItems: result.data.length,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error('Failed to search bouchons from API:', error);
    throw error;
  }
}
