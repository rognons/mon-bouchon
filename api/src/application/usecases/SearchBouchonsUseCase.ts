import type { BouchonRepository } from "../../domain/ports/BouchonRepository.ts";
import type { Bouchon } from "../../domain/entities/Bouchon.ts";
import type { SearchCriteria } from "../../domain/entities/SearchCriteria.ts";
import {
  BouchonDomainService,
  InvalidSearchCriteriaError,
} from "../../domain/services/BouchonDomainService.ts";

// Use Case for bouchons search
export class SearchBouchonsUseCase {
  constructor(private readonly bouchonRepository: BouchonRepository) {}

  async execute(criteria: SearchCriteria): Promise<Bouchon[]> {
    // Criteria validation

    if (!criteria.isValidDistrict()) {
      throw new InvalidSearchCriteriaError("Invalid district");
    }

    // If no criteria, return all bouchons
    if (!criteria.hasAnyCriteria()) {
      return await this.bouchonRepository.findAll();
    }

    // Get all bouchons
    const allBouchons = await this.bouchonRepository.findAll();

    // Apply business filters
    const filteredBouchons = BouchonDomainService.filterBouchons(
      allBouchons,
      criteria,
    );

    // Apply sorting
    const sortedBouchons = BouchonDomainService.sortBouchons(
      filteredBouchons,
      criteria,
    );

    return sortedBouchons;
  }
}
