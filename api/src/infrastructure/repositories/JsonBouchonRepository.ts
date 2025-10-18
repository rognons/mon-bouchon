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
  id: number;
  nom: string;
  adresse: string;
  arrondissement: string;
  quartier: string;
  telephone: string;
  note: number;
  prixMenuBase?: string;
  ouvertures?: string;
  quantite?: string;
  specialites?: string[];
  typeMangeur?: string;
  typeAmbiance?: string;
  typeTablee?: string;
  typeBouchon?: string;
  optionVegetariens?: boolean;
  optionMachon?: boolean;
  decorationRemarquable?: boolean;
  coupDeCoeurCompagnie?: boolean;
  coupDeCoeurVins?: boolean;
  labelBouchonsLyonnais?: boolean;
  selectionAuthentiques?: boolean;
  description?: string;
  imageUrl?: string;
  reservation?: boolean;
  terrasse?: boolean;
  capacite?: number;
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
    return new Bouchon(
      new BouchonId(json.id),
      json.nom,
      new Address(json.adresse, json.arrondissement, json.quartier),
      new Contact(json.telephone),
      new Rating(json.note),
      new MenuInfo(json.prixMenuBase, json.quantite, json.specialites),
      new Characteristics(
        json.typeBouchon,
        json.typeMangeur,
        json.typeAmbiance,
        json.typeTablee,
        json.decorationRemarquable,
      ),
      new Services(
        json.ouvertures,
        json.optionVegetariens,
        json.optionMachon,
        json.reservation,
        json.terrasse,
        json.capacite,
      ),
      new Labels(
        json.coupDeCoeurCompagnie,
        json.coupDeCoeurVins,
        json.labelBouchonsLyonnais,
        json.selectionAuthentiques,
      ),
      json.description,
      json.imageUrl,
    );
  }
}
