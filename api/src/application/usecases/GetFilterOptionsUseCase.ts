import type { BouchonRepository } from "../../domain/ports/BouchonRepository.ts";

export interface FilterOptions {
  arrondissements: string[];
  neighborhoods: string[];
  portionSizes: string[];
  eaterTypes: string[];
  atmosphereTypes: string[];
  bouchonTypes: string[];
}

// Use Case for getting all available filter options
export class GetFilterOptionsUseCase {
  constructor(private readonly bouchonRepository: BouchonRepository) {}

  async execute(): Promise<FilterOptions> {
    const allBouchons = await this.bouchonRepository.findAll();

    // Extract unique values for each filter type
    const neighborhoods = new Set<string>();
    const portionSizes = new Set<string>();
    const eaterTypes = new Set<string>();
    const atmosphereTypes = new Set<string>();
    const bouchonTypes = new Set<string>();

    for (const bouchon of allBouchons) {
      if (bouchon.address.neighborhood) {
        neighborhoods.add(bouchon.address.neighborhood);
      }
      if (bouchon.menuInfo.portionSize) {
        portionSizes.add(bouchon.menuInfo.portionSize);
      }
      if (bouchon.characteristics.eaterType) {
        eaterTypes.add(bouchon.characteristics.eaterType);
      }
      if (bouchon.characteristics.atmosphereType) {
        atmosphereTypes.add(bouchon.characteristics.atmosphereType);
      }
      if (bouchon.characteristics.bouchonType) {
        bouchonTypes.add(bouchon.characteristics.bouchonType);
      }
    }

    // Fixed list of arrondissements
    const arrondissements = [
      "69001",
      "69002",
      "69003",
      "69004",
      "69005",
      "69006",
      "69007",
      "69008",
      "69009",
    ];

    return {
      arrondissements,
      neighborhoods: Array.from(neighborhoods).sort(),
      portionSizes: Array.from(portionSizes).sort(),
      eaterTypes: Array.from(eaterTypes).sort(),
      atmosphereTypes: Array.from(atmosphereTypes).sort(),
      bouchonTypes: Array.from(bouchonTypes).sort(),
    };
  }
}
