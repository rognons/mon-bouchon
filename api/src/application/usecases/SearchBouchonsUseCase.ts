import type { BouchonRepository } from "../../domain/ports/BouchonRepository.ts";
import type { Bouchon } from "../../domain/entities/Bouchon.ts";
import type { SearchCriteria } from "../../domain/entities/SearchCriteria.ts";
import {
  BouchonDomainService,
  InvalidSearchCriteriaError,
} from "../../domain/services/BouchonDomainService.ts";

export interface PaginatedResult {
  data: Bouchon[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Use Case for bouchons search
export class SearchBouchonsUseCase {
  constructor(private readonly bouchonRepository: BouchonRepository) {}

  async execute(
    criteria: SearchCriteria,
    page: number = 1,
  ): Promise<PaginatedResult> {
    // Criteria validation

    if (!criteria.isValidPostalCode()) {
      throw new InvalidSearchCriteriaError("Invalid postal code");
    }

    // Get all bouchons
    const allBouchons = await this.bouchonRepository.findAll();

    // Apply business filters
    let filteredBouchons: Bouchon[];
    if (!criteria.hasAnyCriteria()) {
      filteredBouchons = allBouchons;
    } else {
      filteredBouchons = BouchonDomainService.filterBouchons(
        allBouchons,
        criteria,
      );
    }

    // Apply sorting
    const sortedBouchons = BouchonDomainService.sortBouchons(
      filteredBouchons,
      criteria,
    );

    // Apply pagination (always 6 items per page)
    const pageSize = 6;
    const totalItems = sortedBouchons.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = sortedBouchons.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
}
