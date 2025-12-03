// Search criteria as Value Object
export class SearchCriteria {
  constructor(
    public readonly priceLevel?: number,
    public readonly postalCode?: string | string[],
    public readonly neighborhood?: string | string[],
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
    public readonly day?: number,
    public readonly time?: string,
  ) {}

  isValidPostalCode(): boolean {
    if (!this.postalCode) return true;
    const validPostalCodes = [
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
    const postalCodes = Array.isArray(this.postalCode)
      ? this.postalCode
      : [this.postalCode];
    return postalCodes.every((d) => validPostalCodes.includes(d));
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
  | "price";
export type SortOrder = "asc" | "desc";

// Factory to create SearchCriteria from HTTP parameters
export class SearchCriteriaFactory {
  static fromUrlParams(params: Record<string, string>): SearchCriteria {
    const parseMultiValue = (value?: string): string | string[] | undefined => {
      if (!value) return undefined;
      const values = value.split(",").map((v) => v.trim()).filter((v) => v);

      return values.length === 1 ? values[0] : values;
    };

    return new SearchCriteria(
      params.priceLevel ? Number(params.priceLevel) : undefined,
      parseMultiValue(params.postalCode),
      parseMultiValue(params.neighborhood),
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
      params.day ? Number(params.day) : undefined,
      params.time || undefined,
    );
  }
}
