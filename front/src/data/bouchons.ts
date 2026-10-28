// Les bouchons, inclus dans le site au moment de sa fabrication.
import type { Bouchon } from '../recherche/regles';
import donnees from './bouchons.json';

// Un bouchon avec, en plus des champs utiles à la recherche, ceux qu'affiche
// sa carte.
export interface BouchonComplet extends Bouchon {
  address: string;
  phone?: string;
  mapsUrl?: string;
  description?: string;
  articleUrl?: string;
  menuUrl?: string;
  bookingUrl?: string;
  specialties?: string[];
  // Les trois points-clés de la Compagnie (CONTEXT.md).
  pointsCles?: string[];
}

export const BOUCHONS = donnees as BouchonComplet[];
