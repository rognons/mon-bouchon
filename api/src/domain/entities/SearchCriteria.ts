// Search criteria as Value Object
export class SearchCriteria {
  constructor(
    public readonly priceLevel?: number,
    public readonly district?: string,
    public readonly neighborhood?: string,
    public readonly openingHours?: string,
    public readonly portionSize?: string,
    public readonly eaterType?: string,
    public readonly atmosphereType?: string,
    public readonly tableType?: string,
    public readonly bouchonType?: string,
    public readonly vegetarianOption?: boolean,
    public readonly machonOption?: boolean,
    public readonly remarkableDecoration?: boolean,
    public readonly compagnieFavorite?: boolean,
    public readonly wineFavorite?: boolean,
    public readonly bouchonLyonnaisLabel?: boolean,
    public readonly authenticSelection?: boolean,
    public readonly minRating?: number,
    public readonly sortBy?: SortBy,
    public readonly sortOrder?: SortOrder,
  ) {}

  isValidDistrict(): boolean {
    if (!this.district) return true;
    const validDistricts = [
      "1er",
      "2ème",
      "3ème",
      "4ème",
      "5ème",
      "6ème",
      "7ème",
      "8ème",
      "9ème",
    ];
    return validDistricts.includes(this.district);
  }

  hasAnyCriteria(): boolean {
    return Object.values(this).some((value) =>
      value !== undefined && value !== null
    );
  }
}

// Types for sorting
export type SortBy =
  | "default"
  | "rating"
  | "price"
  | "name"
  | "district"
  | "favorite";
export type SortOrder = "asc" | "desc";

// Factory to create SearchCriteria from HTTP parameters
export class SearchCriteriaFactory {
  static fromUrlParams(params: Record<string, string>): SearchCriteria {
    return new SearchCriteria(
      params.priceLevel ? Number(params.priceLevel) : undefined,
      params.district || params.arrondissement,
      params.neighborhood || params.quartier,
      params.openingHours || params.ouvertures,
      params.portionSize || params.quantite,
      params.eaterType || params.typeMangeur,
      params.atmosphereType || params.typeAmbiance,
      params.tableType || params.typeTablee,
      params.bouchonType || params.typeBouchon,
      (params.vegetarianOption || params.optionVegetariens) === "true",
      (params.machonOption || params.optionMachon) === "true",
      (params.remarkableDecoration || params.decorationRemarquable) === "true",
      (params.compagnieFavorite || params.coupDeCoeurCompagnie) === "true",
      (params.wineFavorite || params.coupDeCoeurVins) === "true",
      (params.bouchonLyonnaisLabel || params.labelBouchonsLyonnais) === "true",
      (params.authenticSelection || params.selectionAuthentiques) === "true",
      params.minRating || params.minNote
        ? Number.parseFloat(params.minRating || params.minNote)
        : undefined,
      params.sortBy as SortBy,
      params.sortOrder as SortOrder,
    );
  }
}
