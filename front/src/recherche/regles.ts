// Règles de recherche du générateur (voir CONTEXT.md et docs/adr/0001).
// Ce module ne dépend pas de l'affichage : il reçoit les bouchons, une phrase
// de recherche, un affinage et un tri, et renvoie les résultats exacts et
// ceux « à un critère près ».

import {
  type Ambiance,
  type Commune,
  type Portions,
  type ProfilMangeur,
  type Quartier,
  type TypeBouchon,
  PORTIONS,
  PROFILS_MANGEUR,
  TOP_10_COMPAGNIE,
} from '../data/referentiel';

// --- Les bouchons ----------------------------------------------------------

export interface Creneau {
  day: number; // 0 = dimanche … 6 = samedi
  open: string; // « HHMM »
  close: string; // « HHMM », éventuellement après minuit
}

export interface Bouchon {
  id: string;
  name: string;
  menuPrice?: number | null;
  postalCode: string;
  commune: Commune;
  neighborhood: Quartier | null;
  portionSize: Portions | null;
  eaterType: ProfilMangeur | null;
  atmosphereType: Ambiance | null;
  bouchonType: TypeBouchon | null;
  vegetarianOption: boolean;
  machonOption: boolean;
  terrace: boolean;
  remarkableDecoration: boolean;
  remarkableTeam: boolean;
  compagnieFavorite: boolean;
  wineFavorite: boolean;
  bouchonLyonnaisLabel: boolean;
  authenticSelection: boolean;
  rating: number;
  openingHours: Creneau[] | null;
}

// --- La phrase de recherche -------------------------------------------------

export type PalierDePrix = 'max-30' | 'max-35' | 'max-40' | 'max-45';
export type Service = 'machon' | 'midi' | 'soir';

// Valeur du critère lieu (docs/adr/0004) : un quartier (« presquile »…), ou,
// pour un bouchon sans quartier, un code postal de Lyon (« 69003 »…) ou une
// commune hors de Lyon (« villeurbanne »…).
export type Lieu = string;

export type Critere =
  | { type: 'prix'; palier: PalierDePrix }
  | { type: 'lieu'; valeurs: Lieu[] }
  // Plusieurs jours et services possibles : le bouchon doit être ouvert sur
  // au moins une des combinaisons (samedi midi, ou samedi soir, ou dimanche midi…).
  | { type: 'moment'; jours: number[]; services: Service[] }
  | { type: 'typeBouchon'; valeurs: TypeBouchon[] }
  | { type: 'vegetarien' }
  // « Autre critère » : une seule valeur d'un critère secondaire (ambiance,
  // profil de mangeur, portions, distinction ou option), choisie comme
  // critère n°1.
  | { type: 'autre'; famille: FamilleAutre; valeur: string };

// Les critères secondaires proposables comme « Autre critère ».
export type FamilleAutre = 'ambiance' | 'profil' | 'portions' | 'distinction' | 'option';

// Les distinctions et options : chacune lue dans un champ oui/non du bouchon.
export const DRAPEAUX: Record<string, keyof Bouchon> = {
  coupDeCoeurCompagnie: 'compagnieFavorite',
  coupDeCoeurVins: 'wineFavorite',
  labelBouchonsLyonnais: 'bouchonLyonnaisLabel',
  selectionAuthentiques: 'authenticSelection',
  terrasse: 'terrace',
  decorationRemarquable: 'remarkableDecoration',
  equipeRemarquable: 'remarkableTeam',
};

export interface PhraseDeRecherche {
  principal: Critere;
  complementaires: Critere[];
}

// Une phrase compte deux critères au plus : le principal et un complémentaire
// (docs/adr/0003).
export const MAX_CRITERES_COMPLEMENTAIRES = 1;

// --- L'affinage ---------------------------------------------------------------

// Les critères secondaires, et les critères principaux absents de la
// recherche (docs/adr/0003). Rien n'y est jamais relâché.
export interface Affinage {
  // Critères principaux non choisis dans la recherche, chacun exigé.
  principaux?: Critere[];
  terrasse?: boolean;
  decorationRemarquable?: boolean;
  equipeRemarquable?: boolean;
  coupDeCoeurCompagnie?: boolean;
  coupDeCoeurVins?: boolean;
  labelBouchonsLyonnais?: boolean;
  selectionAuthentiques?: boolean;
  typesBouchon?: TypeBouchon[];
  ambiances?: Ambiance[];
  // Le profil de la tablée : on voit les bouchons de ce profil et des profils
  // plus prudents (le profil d'un bouchon est le minimum pour l'apprécier).
  profil?: ProfilMangeur;
  // Des portions au moins de ce niveau.
  portionsMinimum?: Portions;
}

// --- Le tri -------------------------------------------------------------------

// « defaut » : le top 10 de la Compagnie dans l'ordre, puis la note Google,
// puis le prix.
export type Tri = 'defaut' | 'note' | 'prix';

// --- Évaluer un critère -------------------------------------------------------

// « inconnu » : l'information manque pour ce bouchon (prix non renseigné…).
export type Verdict = 'oui' | 'non' | 'inconnu';

const PLAFONDS: Record<PalierDePrix, number> = {
  'max-30': 30,
  'max-35': 35,
  'max-40': 40,
  'max-45': 45,
};

// Plages horaires qu'un créneau doit chevaucher pour compter comme un service.
const PLAGES_SERVICE: Record<'midi' | 'soir', [number, number]> = {
  midi: [1200, 1400],
  soir: [1930, 2130],
};

function enMinutes(hhmm: string): number {
  const n = Number(hhmm);
  return Math.floor(n / 100) * 60 + (n % 100);
}

function chevauche(creneau: Creneau, [debut, fin]: [number, number]): boolean {
  const ouverture = enMinutes(creneau.open);
  let fermeture = enMinutes(creneau.close);
  if (fermeture <= ouverture) fermeture += 24 * 60; // ferme après minuit
  return ouverture < enMinutes(String(fin)) && fermeture > enMinutes(String(debut));
}

// Le lieu d'un bouchon : son quartier s'il en a un, sinon son arrondissement
// ou sa commune. Chaque bouchon a un seul lieu.
export function lieuDe(bouchon: Bouchon): Lieu {
  if (bouchon.neighborhood !== null) return bouchon.neighborhood;
  return bouchon.commune === 'lyon' ? bouchon.postalCode : bouchon.commune;
}

function rang<Code extends string>(valeurs: { code: Code }[], code: Code): number {
  return valeurs.findIndex((v) => v.code === code);
}

export interface Moment {
  jour: number;
  service: Service;
}

// Est-ce que le bouchon est ouvert ce jour-là pour ce service ?
function ouvertA(bouchon: Bouchon, { jour, service }: Moment): boolean {
  const creneaux = (bouchon.openingHours ?? []).filter((c) => c.day === jour);
  if (service === 'machon') {
    // Le mâchon se sert sur réservation, en dehors des horaires, mais
    // seulement les jours où le bouchon est ouvert (décidé le 28/10/2026).
    return bouchon.machonOption && creneaux.length > 0;
  }
  const plage = PLAGES_SERVICE[service];
  return creneaux.some((c) => chevauche(c, plage));
}

// Les combinaisons jour + service choisies où le bouchon est ouvert.
export function momentsRemplis(
  bouchon: Bouchon,
  critere: Extract<Critere, { type: 'moment' }>
): Moment[] {
  return critere.jours.flatMap((jour) =>
    critere.services.map((service) => ({ jour, service })).filter((m) => ouvertA(bouchon, m))
  );
}

export function evaluer(bouchon: Bouchon, critere: Critere): Verdict {
  switch (critere.type) {
    case 'prix': {
      if (typeof bouchon.menuPrice !== 'number') return 'inconnu';
      return bouchon.menuPrice <= PLAFONDS[critere.palier] ? 'oui' : 'non';
    }
    case 'lieu':
      return critere.valeurs.includes(lieuDe(bouchon)) ? 'oui' : 'non';
    case 'moment': {
      if (!bouchon.openingHours || bouchon.openingHours.length === 0) return 'inconnu';
      return momentsRemplis(bouchon, critere).length > 0 ? 'oui' : 'non';
    }
    case 'typeBouchon':
      if (!bouchon.bouchonType) return 'inconnu';
      return critere.valeurs.includes(bouchon.bouchonType) ? 'oui' : 'non';
    case 'vegetarien':
      return bouchon.vegetarianOption ? 'oui' : 'non';
    case 'autre':
      return evaluerAutre(bouchon, critere);
  }
}

// Mêmes règles que dans l'affinage : le profil laisse voir les profils plus
// prudents, les portions sont un minimum.
function evaluerAutre(
  bouchon: Bouchon,
  { famille, valeur }: Extract<Critere, { type: 'autre' }>
): Verdict {
  switch (famille) {
    case 'ambiance':
      if (!bouchon.atmosphereType) return 'inconnu';
      return bouchon.atmosphereType === valeur ? 'oui' : 'non';
    case 'profil':
      if (!bouchon.eaterType) return 'inconnu';
      return rang(PROFILS_MANGEUR, bouchon.eaterType) <=
        rang(PROFILS_MANGEUR, valeur as ProfilMangeur)
        ? 'oui'
        : 'non';
    case 'portions':
      if (!bouchon.portionSize) return 'inconnu';
      return rang(PORTIONS, bouchon.portionSize) >= rang(PORTIONS, valeur as Portions)
        ? 'oui'
        : 'non';
    case 'distinction':
    case 'option':
      return bouchon[DRAPEAUX[valeur]] === true ? 'oui' : 'non';
  }
}

// --- Affinage -----------------------------------------------------------------

export function passeAffinage(bouchon: Bouchon, affinage: Affinage): boolean {
  // Un critère principal en affinage est exigé (information manquante comprise).
  if (affinage.principaux?.some((c) => evaluer(bouchon, c) !== 'oui')) return false;
  const exigences: [boolean | undefined, boolean][] = [
    [affinage.terrasse, bouchon.terrace],
    [affinage.decorationRemarquable, bouchon.remarkableDecoration],
    [affinage.equipeRemarquable, bouchon.remarkableTeam],
    [affinage.coupDeCoeurCompagnie, bouchon.compagnieFavorite],
    [affinage.coupDeCoeurVins, bouchon.wineFavorite],
    [affinage.labelBouchonsLyonnais, bouchon.bouchonLyonnaisLabel],
    [affinage.selectionAuthentiques, bouchon.authenticSelection],
  ];
  if (exigences.some(([exige, a]) => exige && !a)) return false;
  if (
    affinage.typesBouchon?.length &&
    (!bouchon.bouchonType || !affinage.typesBouchon.includes(bouchon.bouchonType))
  ) {
    return false;
  }
  if (
    affinage.ambiances?.length &&
    (!bouchon.atmosphereType || !affinage.ambiances.includes(bouchon.atmosphereType))
  ) {
    return false;
  }
  if (
    affinage.profil &&
    (!bouchon.eaterType ||
      rang(PROFILS_MANGEUR, bouchon.eaterType) > rang(PROFILS_MANGEUR, affinage.profil))
  ) {
    return false;
  }
  if (
    affinage.portionsMinimum &&
    (!bouchon.portionSize ||
      rang(PORTIONS, bouchon.portionSize) < rang(PORTIONS, affinage.portionsMinimum))
  ) {
    return false;
  }
  return true;
}

// --- Tri ----------------------------------------------------------------------

// Le rang d'un bouchon dans le top 10 de la Compagnie (1 à 10), ou null.
export function rangTop10(bouchon: Bouchon): number | null {
  const i = TOP_10_COMPAGNIE.indexOf(bouchon.id);
  return i < 0 ? null : i + 1;
}

export function trier<B extends Bouchon>(bouchons: B[], tri: Tri): B[] {
  const parNote = (a: Bouchon, b: Bouchon) => b.rating - a.rating;
  // Les prix non renseignés vont à la fin.
  const parPrix = (a: Bouchon, b: Bouchon) => {
    const pa = typeof a.menuPrice === 'number' ? a.menuPrice : Number.POSITIVE_INFINITY;
    const pb = typeof b.menuPrice === 'number' ? b.menuPrice : Number.POSITIVE_INFINITY;
    return pa === pb ? 0 : pa - pb;
  };
  const parTop10 = (a: Bouchon, b: Bouchon) => (rangTop10(a) ?? 11) - (rangTop10(b) ?? 11);
  return [...bouchons].sort((a, b) => {
    if (tri === 'prix') return parPrix(a, b) || parNote(a, b);
    if (tri === 'note') return parNote(a, b) || parPrix(a, b);
    return parTop10(a, b) || parNote(a, b) || parPrix(a, b);
  });
}

// --- Recherche ----------------------------------------------------------------

export interface AUnCriterePres<B extends Bouchon = Bouchon> {
  bouchon: B;
  critereManquant: Critere;
  // « non » : le bouchon ne remplit pas le critère ; « inconnu » :
  // l'information manque (prix non renseigné…).
  raison: Exclude<Verdict, 'oui'>;
}

export interface ResultatsDeRecherche<B extends Bouchon = Bouchon> {
  exacts: B[];
  aUnCriterePres: AUnCriterePres<B>[];
}

// « À un critère près » ne s'affiche que s'il y a moins de résultats exacts
// que ce seuil.
export const SEUIL_A_UN_CRITERE_PRES = 3;

export function afficherAUnCriterePres(resultats: ResultatsDeRecherche): boolean {
  return resultats.exacts.length < SEUIL_A_UN_CRITERE_PRES && resultats.aUnCriterePres.length > 0;
}

export class PhraseInvalideError extends Error {}

export function verifierPhrase(phrase: PhraseDeRecherche): void {
  if (phrase.complementaires.length > MAX_CRITERES_COMPLEMENTAIRES) {
    throw new PhraseInvalideError(
      `Au plus ${MAX_CRITERES_COMPLEMENTAIRES} critères complémentaires`
    );
  }
  const types = [phrase.principal, ...phrase.complementaires].map((c) => c.type);
  if (new Set(types).size !== types.length) {
    throw new PhraseInvalideError('Un même critère ne peut figurer deux fois dans la phrase');
  }
}

export function rechercher<B extends Bouchon>(
  bouchons: B[],
  phrase: PhraseDeRecherche,
  affinage: Affinage = {},
  tri: Tri = 'defaut'
): ResultatsDeRecherche<B> {
  verifierPhrase(phrase);
  const exacts: B[] = [];
  const aUnCriterePres: AUnCriterePres<B>[] = [];

  for (const bouchon of bouchons) {
    // L'affinage retire partout et n'est jamais relâché.
    if (!passeAffinage(bouchon, affinage)) continue;
    // Le critère principal n'est jamais relâché (information manquante comprise).
    if (evaluer(bouchon, phrase.principal) !== 'oui') continue;

    const manques = phrase.complementaires
      .map((critere) => ({ critere, verdict: evaluer(bouchon, critere) }))
      .filter((r) => r.verdict !== 'oui');

    if (manques.length === 0) {
      exacts.push(bouchon);
    } else if (manques.length === 1) {
      const [{ critere, verdict }] = manques;
      aUnCriterePres.push({
        bouchon,
        critereManquant: critere,
        raison: verdict as Exclude<Verdict, 'oui'>,
      });
    }
  }

  const parBouchon = new Map(aUnCriterePres.map((r) => [r.bouchon.id, r]));
  return {
    exacts: trier(exacts, tri),
    aUnCriterePres: trier(
      aUnCriterePres.map((r) => r.bouchon),
      tri
    ).map((b) => parBouchon.get(b.id) as AUnCriterePres<B>),
  };
}
