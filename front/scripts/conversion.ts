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

// Les colonnes du Sheet sont retrouvées par leur titre (2e ligne du Sheet),
// pas par leur lettre : on peut donc ajouter, retirer ou déplacer des colonnes
// sans casser l'import. Seul le nom du bouchon doit rester en colonne A.
// Chaque champ indique un morceau de titre (sans accents ni majuscules) qui
// doit se trouver dans le titre d'une seule colonne.
export const COLONNES = {
  menuPrice: 'prix du menu',
  neighborhood: 'quartier',
  portionSize: 'quantite',
  eaterType: 'mangeur',
  atmosphereType: 'ambiance',
  bouchonType: 'type de bouchon',
  vegetarianOption: 'vegetarien',
  terrace: 'terrasse',
  machonOption: 'machon',
  remarkableDecoration: 'decoration',
  remarkableTeam: 'equipe',
  compagnieFavorite: 'coup de coeur compagnie',
  wineFavorite: 'selection vins',
  bouchonLyonnaisLabel: 'label',
  authenticSelection: 'authentiques',
  description: 'description',
  articleUrl: 'url article',
  menuUrl: 'url menu',
  bookingUrl: 'reservation',
  phone: 'telephone',
  pointCle1: 'coup de coeur 1',
  pointCle2: 'coup de coeur 2',
  pointCle3: 'coup de coeur 3',
} as const;

export type Colonne = keyof typeof COLONNES;
export type PositionsColonnes = Record<Colonne, number>;

// « Coup de cœur Compagnie » → « coup de coeur compagnie ».
export function titreSimplifie(titre: string): string {
  return titre
    .replace(/œ/gi, 'oe')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Trouve la position de chaque colonne à partir de la ligne des titres.
// S'arrête avec un message clair si une colonne manque ou est en double,
// pour ne jamais remplir le site avec la mauvaise colonne.
export function positionsDesColonnes(titres: string[]): PositionsColonnes {
  const simplifies = titres.map((t) => titreSimplifie(t ?? ''));
  const erreurs: string[] = [];
  const positions = {} as PositionsColonnes;
  for (const [champ, morceau] of Object.entries(COLONNES) as [Colonne, string][]) {
    const trouvees = simplifies.map((t, i) => (t.includes(morceau) ? i : -1)).filter((i) => i > 0);
    if (trouvees.length === 0)
      erreurs.push(`Aucune colonne du Sheet n'a un titre contenant « ${morceau} »`);
    else if (trouvees.length > 1)
      erreurs.push(
        `Plusieurs colonnes du Sheet ont un titre contenant « ${morceau} » : ${trouvees
          .map((i) => titres[i])
          .join(', ')}`
      );
    else positions[champ] = trouvees[0];
  }
  if (erreurs.length) throw new ValeurInconnueError(erreurs.join('\n'));
  return positions;
}

// Disposition actuelle du Sheet (depuis le 27/11/2026, sans les colonnes
// Arrondissement, En amoureux, Repas pro, Excellent rapport qualité-prix et
// Plats à la carte). Sert de valeur par défaut et dans les tests.
export const TITRES_SHEET = [
  '',
  'Prix du menu de base (hors menu du jour)',
  'Quartier',
  'Quantité',
  'Idéal pour tel type de mangeur',
  "Type d'ambiance et de confort",
  'Type de bouchons',
  'Option Végétariens',
  'Terrasse',
  'Option Mâchon',
  'Décoration remarquable',
  'Patron ou équipe remarquable',
  'Coup de cœur Compagnie du Rognon',
  'Sélection Vins',
  'Label "Les Bouchons Lyonnais"',
  'Sélection "Authentiques Bouchons Lyonnais"',
  'Description',
  'URL article',
  'URL menu',
  'Réservation',
  'Téléphone (data Google)',
  'Coup de cœur 1',
  'Coup de cœur 2',
  'Coup de cœur 3',
];

// Convertit une ligne du Sheet en bouchon codé. Le nom est en colonne A ; les
// autres colonnes sont lues à la position trouvée grâce à leur titre.
export function ligneVersBouchon(
  ligne: string[],
  erreurs: string[] = [],
  colonnes: PositionsColonnes = positionsDesColonnes(TITRES_SHEET)
): BouchonJson {
  const nom = ligne[0].trim();
  const cellule = (champ: Colonne) => ligne[colonnes[champ]];
  const coder = <Code extends string>(valeurs: Valeur<Code>[], champ: Colonne, libelle: string) => {
    const t = texte(cellule(champ));
    if (!t) return null;
    const code = codeDepuisSheet(valeurs, t);
    if (!code)
      erreurs.push(`${nom} : ${libelle} inconnu « ${t} » (à ajouter dans src/data/referentiel.ts)`);
    return code ?? null;
  };
  return {
    id: identifiant(nom),
    name: nom,
    menuPrice: prix(cellule('menuPrice')),
    neighborhood: coder(QUARTIERS, 'neighborhood', 'quartier'),
    portionSize: coder(PORTIONS, 'portionSize', 'portions'),
    eaterType: coder(PROFILS_MANGEUR, 'eaterType', 'profil de mangeur'),
    atmosphereType: coder(AMBIANCES, 'atmosphereType', 'ambiance'),
    bouchonType: coder(TYPES_BOUCHON, 'bouchonType', 'type de bouchon'),
    vegetarianOption: booleen(cellule('vegetarianOption')),
    terrace: booleen(cellule('terrace')),
    machonOption: booleen(cellule('machonOption')),
    remarkableDecoration: booleen(cellule('remarkableDecoration')),
    remarkableTeam: booleen(cellule('remarkableTeam')),
    compagnieFavorite: booleen(cellule('compagnieFavorite')),
    wineFavorite: booleen(cellule('wineFavorite')),
    bouchonLyonnaisLabel: booleen(cellule('bouchonLyonnaisLabel')),
    authenticSelection: booleen(cellule('authenticSelection')),
    description: cellule('description'),
    articleUrl: cellule('articleUrl'),
    menuUrl: cellule('menuUrl'),
    // On réserve par ce lien, ou à défaut par le téléphone.
    bookingUrl: cellule('bookingUrl'),
    // Le téléphone du Sheet fait foi ; Google ne sert qu'à défaut.
    phone: texte(cellule('phone')),
    // Les 3 coups de cœur de la Compagnie, tirés de l'article.
    pointsCles: (['pointCle1', 'pointCle2', 'pointCle3'] as const)
      .map((champ) => texte(cellule(champ)))
      .filter((t): t is string => Boolean(t)),
  };
}

// Convertit tout le Sheet (ligne 1 : groupes de colonnes, ligne 2 : titres des
// colonnes, puis un bouchon par ligne jusqu'à la première ligne sans nom), en
// gardant les champs Google des bouchons déjà connus.
export function sheetVersBouchons(lignes: string[][], anciens: BouchonJson[]): BouchonJson[] {
  if (!lignes || lignes.length < 3) throw new Error('Pas assez de lignes dans le Google Sheet');
  const colonnes = positionsDesColonnes(lignes[1]);
  const erreurs: string[] = [];
  const bouchons: BouchonJson[] = [];
  for (const ligne of lignes.slice(2)) {
    if (!ligne[0] || ligne[0].trim() === '') break;
    const bouchon = ligneVersBouchon(ligne, erreurs, colonnes);
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
