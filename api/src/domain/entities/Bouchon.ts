// Business entity representing a Lyon bouchon restaurant

export class Bouchon {
  constructor(
    public readonly id: BouchonId,
    public readonly name: string,
    public readonly address: Address,
    public readonly contact: Contact,
    public readonly rating: Rating,
    public readonly menuInfo: MenuInfo,
    public readonly characteristics: Characteristics,
    public readonly services: Services,
    public readonly labels: Labels,
    public readonly description?: string,
    public readonly imageUrl?: string,
    public readonly articleUrl?: string,
    public readonly menuUrl?: string,
  ) {}

  // Business methods
  isOpenAt(day: number, time?: string): boolean {
    if (
      !this.services.openingHours || !Array.isArray(this.services.openingHours)
    ) {
      return false;
    }

    if (!time) {
      // Only day selected: any slot for that day
      return this.services.openingHours.some((slot: OpeningHoursSlot) =>
        slot.day === day
      );
    }

    // Both day and time selected
    const t = time.replace(":", "");
    return this.services.openingHours.some((slot: OpeningHoursSlot) => {
      return slot.day === day && slot.open <= t && t < slot.close;
    });
  }

  acceptsVegetarians(): boolean {
    return this.services.vegetarianOption || false;
  }

  isCoupDeCoeur(): boolean {
    return this.labels.compagnieFavorite || false;
  }

  getPriceLevel(): number | undefined {
    if (typeof this.menuInfo.menuPrice !== "number") return undefined;
    if (this.menuInfo.menuPrice <= 32) return 1;
    if (this.menuInfo.menuPrice <= 38) return 2;
    return 3;
  }
}

// Value Objects
export class BouchonId {
  constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error("Bouchon ID must be positive");
    }
  }
}

export class Address {
  constructor(
    public readonly street: string,
    public readonly neighborhood: string,
    public readonly postalCode?: string,
    public readonly mapsUrl?: string,
  ) {}
}

export class Contact {
  constructor(
    public readonly phone: string,
  ) {}
}

export class Rating {
  constructor(
    public readonly score: number,
  ) {
    if (score < 0 || score > 5) {
      throw new Error("Rating must be between 0 and 5");
    }
  }
}

export class MenuInfo {
  constructor(
    public readonly portionSize?: string,
    public readonly specialties?: string[],
    public readonly menuPrice?: number,
  ) {}
}

export class Characteristics {
  constructor(
    public readonly bouchonType?: string,
    public readonly eaterType?: string,
    public readonly atmosphereType?: string,
    public readonly tableType?: string,
    public readonly remarkableDecoration?: boolean,
    public readonly remarkableTeam?: boolean,
  ) {}
}

export class Services {
  constructor(
    public readonly openingHours?: OpeningHoursSlot[],
    public readonly vegetarianOption?: boolean,
    public readonly machonOption?: boolean,
    public readonly reservation?: boolean,
    public readonly terrace?: boolean,
    public readonly capacity?: number,
  ) {}
}

export class Labels {
  constructor(
    public readonly compagnieFavorite?: boolean,
    public readonly wineFavorite?: boolean,
    public readonly bouchonLyonnaisLabel?: boolean,
    public readonly authenticSelection?: boolean,
  ) {}
}

export interface OpeningHoursSlot {
  day: number;
  open: string;
  close: string;
}
