// Référentiel des valeurs codées de bouchons.json.
// Chaque valeur a un code court et stable (ce que stocke bouchons.json),
// le texte tel qu'il est saisi dans le Google Sheet (pour convertir le Sheet
// en codes), et le libellé affiché sur le site.
// L'ordre des listes ordonnées compte : du plus prudent au plus aventureux
// pour les profils, du moins au plus copieux pour les portions.

export interface Valeur<Code extends string> {
  code: Code;
  texteSheet: string;
  libelle: string;
  // Forme courte, pour la phrase de recherche (« un puriste canaille »…)
  court?: string;
}

export type ProfilMangeur = 'decouvreur' | 'amateur' | 'puriste';

export const PROFILS_MANGEUR: Valeur<ProfilMangeur>[] = [
  {
    code: 'decouvreur',
    texteSheet: "Découvreur curieux : je veux m'initier en douceur aux classiques lyonnais.",
    libelle: "Découvreur curieux : je veux m'initier en douceur aux classiques lyonnais.",
    court: 'un découvreur curieux',
  },
  {
    code: 'amateur',
    texteSheet:
      "Amateur averti : j'aime les bouchons, mais pas les plats trop rustiques (abats, etc.)",
    libelle:
      "Amateur averti : j'aime les bouchons, mais pas les plats trop rustiques (abats, etc.)",
    court: 'un amateur averti',
  },
  {
    code: 'puriste',
    texteSheet: "Puriste canaille : j'adore les lyonnaiseries en tout genre, sans aucun interdit.",
    libelle: "Puriste canaille : j'adore les lyonnaiseries en tout genre, sans aucun interdit.",
    court: 'un puriste canaille',
  },
];

export type Portions = 'raisonnables' | 'genereuses' | 'gargantuesques';

export const PORTIONS: Valeur<Portions>[] = [
  {
    code: 'raisonnables',
    texteSheet: '🐷 Portions raisonnables',
    libelle: '🐷 Portions raisonnables',
    court: 'raisonnables',
  },
  {
    code: 'genereuses',
    texteSheet: '🐷🐷 Portions généreuses',
    libelle: '🐷🐷 Portions généreuses',
    court: 'généreuses',
  },
  {
    code: 'gargantuesques',
    texteSheet: '🐷🐷🐷 Portions gargantuesques',
    libelle: '🐷🐷🐷 Portions gargantuesques',
    court: 'gargantuesques',
  },
];

export type TypeBouchon = 'traditionnel' | 'moderne' | 'bourgeois';

export const TYPES_BOUCHON: Valeur<TypeBouchon>[] = [
  {
    code: 'traditionnel',
    texteSheet: 'Bouchon traditionnel : resté dans son jus, 100% authentique.',
    libelle: 'Bouchon traditionnel : resté dans son jus, 100% authentique.',
    court: 'tradi',
  },
  {
    code: 'moderne',
    texteSheet: 'Bouchon moderne : perpétue la tradition, tout en la renouvelant.',
    libelle: 'Bouchon moderne : perpétue la tradition, tout en la renouvelant.',
    court: 'moderne',
  },
  {
    code: 'bourgeois',
    texteSheet: 'Bouchon bourgeois : gastronomique, hommage aux bouchons.',
    libelle: 'Bouchon bourgeois : gastronomique, hommage aux bouchons.',
    court: 'bourgeois',
  },
];

export type Ambiance = 'calme' | 'convivial' | 'anime';

export const AMBIANCES: Valeur<Ambiance>[] = [
  {
    code: 'calme',
    texteSheet: 'Calme & spacieux : un cadre tranquille et des tables espacées',
    libelle: 'Calme & spacieux : un cadre tranquille et des tables espacées',
  },
  {
    code: 'convivial',
    texteSheet: "Convivial & vivant : un peu d'animation et une proximité agréable",
    libelle: "Convivial & vivant : un peu d'animation et une proximité agréable",
  },
  {
    code: 'anime',
    texteSheet: 'Chaleureux & animé : les uns sur les autres, dans le bruit et les rires',
    libelle: 'Chaleureux & animé : les uns sur les autres, dans le bruit et les rires',
  },
];

export type Quartier = 'presquile' | 'vieux-lyon' | 'croix-rousse';

export const QUARTIERS: Valeur<Quartier>[] = [
  { code: 'presquile', texteSheet: "Presqu'Île", libelle: "Presqu'île" },
  { code: 'vieux-lyon', texteSheet: 'Vieux-Lyon', libelle: 'Vieux-Lyon' },
  { code: 'croix-rousse', texteSheet: 'Croix-Rousse', libelle: 'Croix-Rousse' },
];

// Communes : Lyon est découpée en arrondissements (par code postal) ; les
// autres communes forment chacune une valeur du critère arrondissement.
export type Commune = 'lyon' | 'villeurbanne' | 'les-cheres';

export const COMMUNES: { code: Commune; codePostal: string; libelle: string }[] = [
  { code: 'villeurbanne', codePostal: '69100', libelle: 'Villeurbanne' },
  { code: 'les-cheres', codePostal: '69380', libelle: 'Les Chères' },
];

export const ARRONDISSEMENTS_LYON = [
  '69001',
  '69002',
  '69003',
  '69004',
  '69005',
  '69006',
  '69007',
  '69008',
  '69009',
] as const;

// Retrouve le code d'une valeur à partir du texte saisi dans le Google Sheet.
// Renvoie undefined si le texte est vide ou inconnu.
export function codeDepuisSheet<Code extends string>(
  valeurs: Valeur<Code>[],
  texte: string | undefined | null
): Code | undefined {
  if (!texte) return undefined;
  const normalise = texte.trim();
  return valeurs.find((v) => v.texteSheet === normalise)?.code;
}

export function libelle<Code extends string>(valeurs: Valeur<Code>[], code: Code): string {
  return valeurs.find((v) => v.code === code)?.libelle ?? code;
}

// Le top 10 de la Compagnie, du n°1 au n°10 (identifiants de bouchons.json).
// Provisoire : à reprendre dans le Google Sheet (le rang à la place de « oui »
// dans la colonne coup de cœur), pour que la Compagnie le tienne à jour.
export const TOP_10_COMPAGNIE = [
  'chez-hugon',
  'les-4g',
  'le-bouchon-des-artistes',
  'le-garet',
  'le-bouchon-sully',
  'a-ma-vigne',
  'meuniere',
  'l-auberge-des-canuts',
  'cafe-lobut',
  'bistrot-du-marche-chez-nenette',
];
