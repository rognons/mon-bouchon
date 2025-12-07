import type { Bouchon } from "../entities/Bouchon.ts";
import type { SearchCriteria } from "../entities/SearchCriteria.ts";

// Business exception
export class InvalidSearchCriteriaError extends Error {
  constructor(message: string) {
    super(`Invalid search criteria: ${message}`);
    this.name = "InvalidSearchCriteriaError";
  }
}

// Domain service for business filtering rules
export class BouchonDomainService {
  // Filter bouchons according to business criteria
  static filterBouchons(
    bouchons: Bouchon[],
    criteria: SearchCriteria,
  ): Bouchon[] {
    return bouchons.filter((bouchon) =>
      this.matchesCriteria(bouchon, criteria)
    );
  }

  // Sort bouchons according to criteria
  static sortBouchons(
    bouchons: Bouchon[],
    criteria: SearchCriteria,
  ): Bouchon[] {
    if (!criteria.sortBy || criteria.sortBy === "default") {
      return bouchons;
    }

    return [...bouchons].sort((a, b) => {
      let compareValue = 0;

      switch (criteria.sortBy) {
        case "rating": {
          compareValue = a.rating.score - b.rating.score;
          break;
        }
        case "price": {
          const priceA = a.menuInfo.menuPrice ?? 0;
          const priceB = b.menuInfo.menuPrice ?? 0;
          compareValue = priceA - priceB;
          break;
        }
        default:
          return 0;
      }

      return criteria.sortOrder === "desc" ? -compareValue : compareValue;
    });
  }

  private static matchesCriteria(
    bouchon: Bouchon,
    criteria: SearchCriteria,
  ): boolean {
    // PriceLevel - now uses menuPrice-based calculation
    if (
      typeof criteria.priceLevel === "number"
    ) {
      const bouchonPriceLevel = bouchon.getPriceLevel();
      if (bouchonPriceLevel !== criteria.priceLevel) {
        return false;
      }
    }

    // Location
    if (criteria.postalCode) {
      const postalCodes = Array.isArray(criteria.postalCode)
        ? criteria.postalCode
        : [criteria.postalCode];
      if (
        bouchon.address.postalCode &&
        !postalCodes.includes(bouchon.address.postalCode)
      ) {
        return false;
      }
    }
    if (criteria.neighborhood) {
      const neighborhoods = Array.isArray(criteria.neighborhood)
        ? criteria.neighborhood
        : [criteria.neighborhood];
      if (!neighborhoods.includes(bouchon.address.neighborhood)) {
        return false;
      }
    }

    // Services
    if (
      criteria.day !== undefined &&
      !bouchon.isOpenAt(criteria.day, criteria.time)
    ) {
      return false;
    }
    if (
      criteria.portionSize &&
      bouchon.menuInfo.portionSize !== criteria.portionSize
    ) {
      return false;
    }

    // Characteristics
    if (
      criteria.eaterType &&
      bouchon.characteristics.eaterType !== criteria.eaterType
    ) {
      return false;
    }
    if (
      criteria.atmosphereType &&
      bouchon.characteristics.atmosphereType !== criteria.atmosphereType
    ) {
      return false;
    }
    if (
      criteria.tableType &&
      bouchon.characteristics.tableType !== criteria.tableType
    ) {
      return false;
    }
    if (
      criteria.bouchonType &&
      bouchon.characteristics.bouchonType !== criteria.bouchonType
    ) {
      return false;
    }

    // Boolean options
    if (criteria.vegetarianOption && !bouchon.acceptsVegetarians()) {
      return false;
    }
    if (criteria.machonOption && !bouchon.services.machonOption) {
      return false;
    }
    if (
      criteria.remarkableDecoration &&
      !bouchon.characteristics.remarkableDecoration
    ) {
      return false;
    }
    if (criteria.terrace && !bouchon.services.terrace) {
      return false;
    }
    if (criteria.remarkableTeam && !bouchon.characteristics.remarkableTeam) {
      return false;
    }

    // Labels
    if (criteria.compagnieFavorite && !bouchon.labels.compagnieFavorite) {
      return false;
    }
    if (criteria.wineFavorite && !bouchon.labels.wineFavorite) {
      return false;
    }
    if (criteria.bouchonLyonnaisLabel && !bouchon.labels.bouchonLyonnaisLabel) {
      return false;
    }
    if (criteria.authenticSelection && !bouchon.labels.authenticSelection) {
      return false;
    }

    // Minimum rating
    if (criteria.minRating && bouchon.rating.score < criteria.minRating) {
      return false;
    }

    return true;
  }
}
