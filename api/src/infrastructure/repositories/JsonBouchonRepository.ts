import type { BouchonRepository } from "../../domain/ports/BouchonRepository.ts";
import {
  Address,
  Bouchon,
  BouchonId,
  Characteristics,
  Contact,
  Labels,
  MenuInfo,
  Rating,
  Services,
} from "../../domain/entities/Bouchon.ts";

// DTO for JSON -> Domain mapping
interface BouchonJson {
  id?: number;
  name: string;
  address: string;
  neighborhood: string;
  postalCode?: string;
  mapsUrl?: string;
  phone?: string;
  rating?: number;
  openingHours?: string;
  portionSize?: string;
  specialties?: string[];
  eaterType?: string;
  atmosphereType?: string;
  tableType?: string;
  bouchonType?: string;
  vegetarianOption?: boolean;
  machonOption?: boolean;
  remarkableDecoration?: boolean;
  remarkableTeam?: boolean;
  compagnieFavorite?: boolean;
  wineFavorite?: boolean;
  bouchonLyonnaisLabel?: boolean;
  authenticSelection?: boolean;
  description?: string;
  imageUrl?: string;
  reservation?: boolean;
  terrace?: boolean;
  capacity?: number;
  dateFriendly?: boolean;
  businessMeal?: boolean;
  priceLevel?: number;
  articleUrl?: string;
  menuUrl?: string;
}

// Implémentation du repository avec fichier JSON
export class JsonBouchonRepository implements BouchonRepository {
  private bouchons: Bouchon[] | null = null;

  constructor(private readonly dataFilePath: string) {}

  async findAll(): Promise<Bouchon[]> {
    if (!this.bouchons) {
      await this.loadBouchons();
    }
    return this.bouchons || [];
  }

  private async loadBouchons(): Promise<void> {
    try {
      const data = await Deno.readTextFile(this.dataFilePath);
      const bouchonsJson: BouchonJson[] = JSON.parse(data);
      this.bouchons = bouchonsJson.map(this.mapJsonToDomain);
    } catch (error) {
      console.error("Erreur lors du chargement des bouchons:", error);
      throw new Error("Impossible de charger les données des bouchons");
    }
  }

  private mapJsonToDomain(json: BouchonJson): Bouchon {
    // Generate a numeric ID if missing (e.g., by hash or index in array, not shown here)
    const id = json.id ?? Math.floor(Math.random() * 1000000);
    return new Bouchon(
      new BouchonId(id),
      json.name,
      new Address(
        json.address,
        json.neighborhood,
        json.postalCode,
        json.mapsUrl,
      ),
      new Contact(json.phone ?? ""),
      new Rating(json.rating ?? 0),
      new MenuInfo(json.portionSize, json.specialties, json.priceLevel),
      new Characteristics(
        json.bouchonType,
        json.eaterType,
        json.atmosphereType,
        json.tableType,
        json.remarkableDecoration,
      ),
      new Services(
        json.openingHours,
        json.vegetarianOption,
        json.machonOption,
        json.reservation,
        json.terrace,
        json.capacity,
      ),
      new Labels(
        json.compagnieFavorite,
        json.wineFavorite,
        json.bouchonLyonnaisLabel,
        json.authenticSelection,
      ),
      json.description,
      json.imageUrl,
      json.articleUrl,
      json.menuUrl,
    );
  }
}
