import type { SearchBouchonsUseCase } from "../../application/usecases/SearchBouchonsUseCase.ts";
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

      const criteria = SearchCriteriaFactory.fromUrlParams(params);
      const results = await this.searchBouchonsUseCase.execute(criteria);

      // Sérialisation pour la réponse HTTP
      const responseData = results.map(this.serializeBouchon);

      context.response.body = {
        success: true,
        count: results.length,
        data: responseData,
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
    // Mapping domain -> DTO for HTTP response
    return {
      id: bouchon.id.value,
      nom: bouchon.name,
      adresse: bouchon.address.street,
      arrondissement: bouchon.address.district,
      quartier: bouchon.address.neighborhood,
      telephone: bouchon.contact.phone,
      note: bouchon.rating.score,
      prixMenuBase: bouchon.menuInfo.baseMenuPrice,
      ouvertures: bouchon.services.openingHours,
      quantite: bouchon.menuInfo.portionSize,
      specialites: bouchon.menuInfo.specialties,
      typeMangeur: bouchon.characteristics.eaterType,
      typeAmbiance: bouchon.characteristics.atmosphereType,
      typeTablee: bouchon.characteristics.tableType,
      typeBouchon: bouchon.characteristics.bouchonType,
      optionVegetariens: bouchon.services.vegetarianOption,
      optionMachon: bouchon.services.machonOption,
      decorationRemarquable: bouchon.characteristics.remarkableDecoration,
      coupDeCoeurCompagnie: bouchon.labels.compagnieFavorite,
      coupDeCoeurVins: bouchon.labels.wineFavorite,
      labelBouchonsLyonnais: bouchon.labels.bouchonLyonnaisLabel,
      selectionAuthentiques: bouchon.labels.authenticSelection,
      description: bouchon.description,
      imageUrl: bouchon.imageUrl,
      reservation: bouchon.services.reservation,
      terrasse: bouchon.services.terrace,
      capacite: bouchon.services.capacity,
    };
  }
}
