export interface GooglePlacePeriodTime {
  day: number; // 0=Sunday, ..., 6=Saturday
  time: string; // "HHmm"
}

export interface GooglePlacePeriod {
  open: GooglePlacePeriodTime;
  close: GooglePlacePeriodTime;
}

export interface GooglePlaceOpeningHours {
  periods?: GooglePlacePeriod[];
  weekday_text?: string[];
  [key: string]: unknown;
}

export interface GooglePlaceDetails {
  opening_hours?: GooglePlaceOpeningHours;
  rating?: number;
  formatted_phone_number?: string;
  price_level?: number;
  address_components?: Array<
    { long_name: string; short_name: string; types: string[] }
  >;
  url?: string;
  [key: string]: unknown;
}

export class GooglePlacesService {
  private apiKey: string;

  constructor() {
    this.apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") ?? "";
    if (!this.apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY not set in environment");
    }
  }

  async getPlaceDetailsByName(
    query: string,
  ): Promise<GooglePlaceDetails | null> {
    // 1. Buscar el place_id por nombre y dirección
    const searchUrl =
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${
        encodeURIComponent(query)
      }&inputtype=textquery&fields=place_id&key=${this.apiKey}`;
    const searchResp = await fetch(searchUrl);
    const searchData = await searchResp.json();

    // console.log("Google Places API search response:", JSON.stringify(searchData, null, 2));

    if (!searchData.candidates || !searchData.candidates[0]?.place_id) {
      return null;
    }
    const placeId = searchData.candidates[0].place_id;

    // 2. Obtener detalles del lugar
    const detailsUrl =
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours,rating,formatted_phone_number,price_level,address_components,url&key=${this.apiKey}`;
    const detailsResp = await fetch(detailsUrl);
    const detailsData = await detailsResp.json();

    // console.log("Google Places API details response:", JSON.stringify(detailsData, null, 2));

    if (detailsData.status !== "OK") {
      return null;
    }
    return {
      opening_hours: detailsData.result.opening_hours,
      rating: detailsData.result.rating,
      formatted_phone_number: detailsData.result.formatted_phone_number,
      price_level: detailsData.result.price_level,
      address_components: detailsData.result.address_components,
      url: detailsData.result.url,
    };
  }
}
