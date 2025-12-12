import type { SearchBouchonsUseCase } from "../../application/usecases/SearchBouchonsUseCase.ts";
import type { GetFilterOptionsUseCase } from "../../application/usecases/GetFilterOptionsUseCase.ts";
import { SearchCriteriaFactory } from "../../domain/entities/SearchCriteria.ts";
import { InvalidSearchCriteriaError } from "../../domain/services/BouchonDomainService.ts";
import type { Bouchon } from "../../domain/entities/Bouchon.ts";

// Context type for Oak framework
interface Context {
  request: {
    url: URL;
  };
  response: {
    body?: unknown;
    status?: number;
  };
}

// Controller HTTP pour les endpoints bouchons
export class BouchonController {
  constructor(
    private readonly searchBouchonsUseCase: SearchBouchonsUseCase,
    private readonly getFilterOptionsUseCase: GetFilterOptionsUseCase,
  ) {}

  // GET /bouchons (avec critères optionnels)
  async getBouchons(context: Context): Promise<void> {
    try {
      const url = context.request.url;
      const searchParams = url.searchParams;

      // Conversion des URLSearchParams en Record<string, string>
      const params: Record<string, string> = {};
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      // Extract pagination parameter (pageSize is always 6)
      const page = parseInt(params.page || "1", 10);

      // Validate pagination parameter
      if (page < 1) {
        context.response.status = 400;
        context.response.body = {
          success: false,
          error: "Invalid page parameter",
        };
        return;
      }

      const criteria = SearchCriteriaFactory.fromUrlParams(params);
      const result = await this.searchBouchonsUseCase.execute(
        criteria,
        page,
      );

      // Sérialisation pour la réponse HTTP
      const responseData = result.data.map(this.serializeBouchon);

      context.response.body = {
        success: true,
        count: result.data.length,
        data: responseData,
        pagination: result.pagination,
      };
    } catch (error) {
      this.handleError(context, error as Error);
    }
  }

  // GET /filters
  async getFilterOptions(context: Context): Promise<void> {
    try {
      const options = await this.getFilterOptionsUseCase.execute();

      context.response.body = {
        success: true,
        data: options,
      };
    } catch (error) {
      this.handleError(context, error as Error);
    }
  }

  // GET /health
  health(context: Context): void {
    context.response.body = {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Mon Bouchon API",
    };
  }

  private handleError(context: Context, error: Error): void {
    console.error("Erreur dans le controller:", error);

    if (error instanceof InvalidSearchCriteriaError) {
      context.response.status = 400;
      context.response.body = {
        success: false,
        error: error.message,
      };
    } else {
      context.response.status = 500;
      context.response.body = {
        success: false,
        error: "Erreur interne du serveur",
      };
    }
  }

  private serializeBouchon(bouchon: Bouchon): Record<string, unknown> {
    // Mapping domain -> DTO for HTTP response with English field names
    return {
      id: bouchon.id.value,
      name: bouchon.name,
      address: bouchon.address.street,
      neighborhood: bouchon.address.neighborhood,
      postalCode: bouchon.address.postalCode,
      phone: bouchon.contact.phone,
      rating: bouchon.rating.score,
      menuPrice: bouchon.menuInfo.menuPrice,
      openingHours: bouchon.services.openingHours,
      portionSize: bouchon.menuInfo.portionSize,
      specialties: bouchon.menuInfo.specialties,
      eaterType: bouchon.characteristics.eaterType,
      atmosphereType: bouchon.characteristics.atmosphereType,
      tableType: bouchon.characteristics.tableType,
      bouchonType: bouchon.characteristics.bouchonType,
      vegetarianOption: bouchon.services.vegetarianOption,
      machonOption: bouchon.services.machonOption,
      remarkableDecoration: bouchon.characteristics.remarkableDecoration,
      compagnieFavorite: bouchon.labels.compagnieFavorite,
      wineFavorite: bouchon.labels.wineFavorite,
      bouchonLyonnaisLabel: bouchon.labels.bouchonLyonnaisLabel,
      authenticSelection: bouchon.labels.authenticSelection,
      description: bouchon.description,
      imageUrl: bouchon.imageUrl,
      reservation: bouchon.services.reservation,
      terrace: bouchon.services.terrace,
      capacity: bouchon.services.capacity,
      mapsUrl: bouchon.address.mapsUrl,
      articleUrl: bouchon.articleUrl,
      menuUrl: bouchon.menuUrl,
    };
  }
}
