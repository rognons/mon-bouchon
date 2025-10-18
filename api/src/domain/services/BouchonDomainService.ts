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
          const priceA = this.extractPriceNumber(a.menuInfo.baseMenuPrice);
          const priceB = this.extractPriceNumber(b.menuInfo.baseMenuPrice);
          compareValue = priceA - priceB;
          break;
        }
        case "name": {
          compareValue = a.name.localeCompare(b.name);
          break;
        }
        case "district": {
          compareValue = a.address.district.localeCompare(b.address.district);
          break;
        }
        case "favorite": {
          compareValue = (a.isCoupDeCoeur() ? 1 : 0) -
            (b.isCoupDeCoeur() ? 1 : 0);
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
    // Price
    if (
      criteria.baseMenuPrice &&
      !this.matchesPriceRange(
        bouchon.menuInfo.baseMenuPrice,
        criteria.baseMenuPrice,
      )
    ) {
      return false;
    }

    // Location
    if (criteria.district && bouchon.address.district !== criteria.district) {
      return false;
    }
    if (
      criteria.neighborhood &&
      bouchon.address.neighborhood !== criteria.neighborhood
    ) {
      return false;
    }

    // Services
    if (criteria.openingHours && !bouchon.isOpenOn(criteria.openingHours)) {
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

  private static matchesPriceRange(
    bouchonPrice: string | undefined,
    priceFilter: string,
  ): boolean {
    if (!bouchonPrice || !priceFilter) return true;

    const price = Number.parseInt(bouchonPrice.replace("€", ""), 10);

    switch (priceFilter) {
      case "15-20€":
        return price >= 15 && price <= 20;
      case "20-25€":
        return price >= 20 && price <= 25;
      case "25-30€":
        return price >= 25 && price <= 30;
      case "30-35€":
        return price >= 30 && price <= 35;
      case "35€+":
        return price >= 35;
      default:
        return true;
    }
  }

  private static extractPriceNumber(price: string | undefined): number {
    if (!price) return 0;
    const match = price.match(/(\d+)/);
    return match ? Number.parseInt(match[1], 10) : 0;
  }
}
