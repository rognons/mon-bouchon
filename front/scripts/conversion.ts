// Conversion des données du Google Sheet et de Google Places vers
// src/data/bouchons.json. Fonctions sans accès au réseau, testées dans
// conversion.test.ts.

import {
  AMBIANCES,
  COMMUNES,
  codeDepuisSheet,
  PORTIONS,
  PROFILS_MANGEUR,
  QUARTIERS,
  TYPES_BOUCHON,
  type Valeur,
} from '../src/data/referentiel.ts';
import type { DetailsGoogle } from './google.ts';

export type BouchonJson = Record<string, unknown> & { id: string; name: string };

// Champs remplis par Google Places, conservés quand on relit le Sheet.
export const CHAMPS_GOOGLE = [
  'openingHours',
  'exceptionalOpeningHours',
  'rating',
  'phone',
  'postalCode',
  'commune',
  'mapsUrl',
  'address',
] as const;

export function identifiant(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const booleen = (texte?: string) => texte?.trim().toLowerCase() === 'true';
const texte = (t?: string) => t?.replace(/^["']|["']$/g, '').trim() || undefined;

function prix(t?: string): number | undefined {
  if (!t || t.trim() === '' || t.trim() === '-') return undefined;
  const n = Number.parseFloat(t.replace(/[€\s]/g, '').replace(',', '.'));
  return Number.isNaN(n) ? undefined : n;
}

// Erreur listant toutes les valeurs du Sheet que le référentiel ne connaît pas.
export class ValeurInconnueError extends Error {}

// Convertit une ligne du Sheet en bouchon codé. Le nom est en colonne A, la
// colonne C est ignorée. L'ancienne colonne N (« réservation ») a été retirée
// du Sheet le 28/10/2026 : on réserve par le lien de la colonne Y ou par le
// téléphone de la colonne Z. Les coups de cœur suivent, en AA, AB et AC.
export function ligneVersBouchon(ligne: string[], erreurs: string[] = []): BouchonJson {
  const nom = ligne[0].trim();
  const coder = <Code extends string>(
    valeurs: Valeur<Code>[],
    cellule: string | undefined,
    champ: string
  ) => {
    const t = texte(cellule);
    if (!t) return null;
    const code = codeDepuisSheet(valeurs, t);
    if (!code)
      erreurs.push(`${nom} : ${champ} inconnu « ${t} » (à ajouter dans src/data/referentiel.ts)`);
    return code ?? null;
  };
  const specialites = ligne[20]
    ? ligne[20]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  return {
    id: identifiant(nom),
    name: nom,
    menuPrice: prix(ligne[1]),
    neighborhood: coder(QUARTIERS, ligne[3], 'quartier'),
    portionSize: coder(PORTIONS, ligne[4], 'portions'),
    eaterType: coder(PROFILS_MANGEUR, ligne[5], 'profil de mangeur'),
    atmosphereType: coder(AMBIANCES, ligne[6], 'ambiance'),
    bouchonType: coder(TYPES_BOUCHON, ligne[7], 'type de bouchon'),
    vegetarianOption: booleen(ligne[8]),
    terrace: booleen(ligne[9]),
    machonOption: booleen(ligne[10]),
    remarkableDecoration: booleen(ligne[11]),
    remarkableTeam: booleen(ligne[12]),
    dateFriendly: booleen(ligne[13]),
    businessMeal: booleen(ligne[14]),
    compagnieFavorite: booleen(ligne[15]),
    wineFavorite: booleen(ligne[16]),
    bouchonLyonnaisLabel: booleen(ligne[17]),
    authenticSelection: booleen(ligne[18]),
    valueForMoney: booleen(ligne[19]),
    specialties: specialites,
    description: ligne[21],
    articleUrl: ligne[22],
    menuUrl: ligne[23],
    bookingUrl: ligne[24],
    // Le téléphone du Sheet fait foi ; Google ne sert qu'à défaut.
    phone: texte(ligne[25]),
    // Les 3 coups de cœur de la Compagnie (colonnes AA à AC), tirés de l'article.
    pointsCles: ligne
      .slice(26, 29)
      .map((t) => texte(t))
      .filter((t): t is string => Boolean(t)),
  };
}

// Convertit tout le Sheet (ligne 1 : titres, ligne 2 : noms de champs, puis
// un bouchon par ligne jusqu'à la première ligne sans nom), en gardant les
// champs Google des bouchons déjà connus.
export function sheetVersBouchons(lignes: string[][], anciens: BouchonJson[]): BouchonJson[] {
  if (!lignes || lignes.length < 3) throw new Error('Pas assez de lignes dans le Google Sheet');
  const erreurs: string[] = [];
  const bouchons: BouchonJson[] = [];
  for (const ligne of lignes.slice(2)) {
    if (!ligne[0] || ligne[0].trim() === '') break;
    const bouchon = ligneVersBouchon(ligne, erreurs);
    const ancien = anciens.find((a) => a.id === bouchon.id);
    if (ancien)
      for (const champ of CHAMPS_GOOGLE) {
        if (champ === 'phone' && bouchon.phone) continue;
        if (champ in ancien) bouchon[champ] = ancien[champ];
      }
    bouchons.push(bouchon);
  }
  const ids = bouchons.map((b) => b.id);
  const doublons = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (doublons.length) erreurs.push(`Noms en double : ${[...new Set(doublons)].join(', ')}`);
  if (erreurs.length) throw new ValeurInconnueError(erreurs.join('\n'));
  return bouchons;
}

// Lyon pour 69001 à 69009, sinon une commune connue du référentiel.
export function communeDepuisCodePostal(codePostal: string | null | undefined): string {
  if (codePostal && /^6900[1-9]$/.test(codePostal)) return 'lyon';
  const commune = COMMUNES.find((c) => c.codePostal === codePostal);
  if (!commune) {
    throw new ValeurInconnueError(
      `Code postal ${codePostal ?? 'absent'} hors de Lyon et inconnu : ajouter la commune dans COMMUNES (src/data/referentiel.ts)`
    );
  }
  return commune.code;
}

// Ajoute à un bouchon les informations Google Places.
export function enrichir(bouchon: BouchonJson, details: DetailsGoogle): BouchonJson {
  const periodes = details.opening_hours?.periods;
  const openingHours = Array.isArray(periodes)
    ? periodes
        .filter((p) => typeof p.open?.day === 'number')
        .map((p) => ({
          day: p.open?.day,
          open: p.open?.time ?? null,
          close: p.close?.time ?? null,
        }))
    : null;

  // Les fermetures exceptionnelles, quand Google les donne.
  let exceptionalOpeningHours:
    | { date: string; open: string | null; close: string | null }[]
    | null = null;
  const special = Object.entries(details.opening_hours ?? {}).find(
    ([cle, valeur]) => cle.toLowerCase().includes('special') && Array.isArray(valeur)
  )?.[1] as
    | { date: string; exceptional_hours?: { open_time?: string; close_time?: string }[] }[]
    | undefined;
  if (special) {
    exceptionalOpeningHours = special.flatMap((jour) =>
      Array.isArray(jour.exceptional_hours)
        ? jour.exceptional_hours.map((h) => ({
            date: jour.date,
            open: h.open_time ?? null,
            close: h.close_time ?? null,
          }))
        : [{ date: jour.date, open: null, close: null }]
    );
  }

  const postalCode =
    details.address_components?.find((c) => c.types.includes('postal_code'))?.short_name ?? null;
  return {
    ...bouchon,
    openingHours,
    exceptionalOpeningHours,
    rating: details.rating ?? null,
    phone: (bouchon.phone as string | undefined) ?? details.formatted_phone_number ?? null,
    postalCode,
    commune: communeDepuisCodePostal(postalCode),
    mapsUrl: details.url ?? null,
    address: details.formatted_address ?? '',
  };
}
