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
  reservation: boolean;
  compagnieFavorite: boolean;
  wineFavorite: boolean;
  bouchonLyonnaisLabel: boolean;
  authenticSelection: boolean;
  rating: number;
  openingHours: Creneau[] | null;
}

// --- La phrase de recherche -------------------------------------------------

export type PalierDePrix = 'moins-de-32' | 'moins-de-38' | 'sans-limite';
export type Service = 'machon' | 'midi' | 'soir';

// Valeur du critère arrondissement : un code postal de Lyon (« 69001 »…)
// ou une commune hors de Lyon (« villeurbanne »…).
export type ValeurArrondissement = string;

export type Critere =
  | { type: 'prix'; palier: PalierDePrix }
  | { type: 'arrondissement'; valeurs: ValeurArrondissement[] }
  | { type: 'quartier'; valeurs: Quartier[] }
  | { type: 'moment'; jour: number; service: Service }
  | { type: 'profil'; profil: ProfilMangeur }
  | { type: 'portions'; minimum: Portions }
  | { type: 'vegetarien' };

export interface PhraseDeRecherche {
  principal: Critere;
  complementaires: Critere[];
}

export const MAX_CRITERES_COMPLEMENTAIRES = 3;

// --- L'affinage ---------------------------------------------------------------

// Uniquement des conditions qui ne sont pas des critères de la phrase.
export interface Affinage {
  terrasse?: boolean;
  decorationRemarquable?: boolean;
  equipeRemarquable?: boolean;
  reservation?: boolean;
  coupDeCoeurCompagnie?: boolean;
  coupDeCoeurVins?: boolean;
  labelBouchonsLyonnais?: boolean;
  selectionAuthentiques?: boolean;
  typesBouchon?: TypeBouchon[];
  ambiances?: Ambiance[];
}

// --- Le tri -------------------------------------------------------------------

// « defaut » : coups de cœur de la Compagnie d'abord, puis la note Google.
export type Tri = 'defaut' | 'note' | 'prix';

// --- Évaluer un critère -------------------------------------------------------

// « inconnu » : l'information manque pour ce bouchon (prix non renseigné…).
export type Verdict = 'oui' | 'non' | 'inconnu';

const PLAFONDS: Record<PalierDePrix, number> = {
  'moins-de-32': 32,
  'moins-de-38': 38,
  'sans-limite': Number.POSITIVE_INFINITY,
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

export function valeurArrondissement(bouchon: Bouchon): ValeurArrondissement {
  return bouchon.commune === 'lyon' ? bouchon.postalCode : bouchon.commune;
}

function rang<Code extends string>(valeurs: { code: Code }[], code: Code): number {
  return valeurs.findIndex((v) => v.code === code);
}

export function evaluer(bouchon: Bouchon, critere: Critere): Verdict {
  switch (critere.type) {
    case 'prix': {
      if (critere.palier === 'sans-limite') return 'oui';
      if (typeof bouchon.menuPrice !== 'number') return 'inconnu';
      return bouchon.menuPrice <= PLAFONDS[critere.palier] ? 'oui' : 'non';
    }
    case 'arrondissement':
      return critere.valeurs.includes(valeurArrondissement(bouchon)) ? 'oui' : 'non';
    case 'quartier':
      // Un bouchon sans quartier n'est dans aucun des quartiers : « non ».
      return bouchon.neighborhood !== null && critere.valeurs.includes(bouchon.neighborhood)
        ? 'oui'
        : 'non';
    case 'moment': {
      if (!bouchon.openingHours || bouchon.openingHours.length === 0) return 'inconnu';
      const creneaux = bouchon.openingHours.filter((c) => c.day === critere.jour);
      if (critere.service === 'machon') {
        // Règle provisoire : les jours de mâchon ne sont pas renseignés ; un
        // bouchon qui sert le mâchon le sert les jours où il est ouvert.
        return bouchon.machonOption && creneaux.length > 0 ? 'oui' : 'non';
      }
      const plage = PLAGES_SERVICE[critere.service];
      return creneaux.some((c) => chevauche(c, plage)) ? 'oui' : 'non';
    }
    case 'profil': {
      // Le profil d'un bouchon est le profil minimum pour l'apprécier.
      if (!bouchon.eaterType) return 'inconnu';
      return rang(PROFILS_MANGEUR, bouchon.eaterType) <= rang(PROFILS_MANGEUR, critere.profil)
        ? 'oui'
        : 'non';
    }
    case 'portions': {
      // Les portions demandées sont un minimum.
      if (!bouchon.portionSize) return 'inconnu';
      return rang(PORTIONS, bouchon.portionSize) >= rang(PORTIONS, critere.minimum) ? 'oui' : 'non';
    }
    case 'vegetarien':
      return bouchon.vegetarianOption ? 'oui' : 'non';
  }
}

// --- Affinage -----------------------------------------------------------------

export function passeAffinage(bouchon: Bouchon, affinage: Affinage): boolean {
  const exigences: [boolean | undefined, boolean][] = [
    [affinage.terrasse, bouchon.terrace],
    [affinage.decorationRemarquable, bouchon.remarkableDecoration],
    [affinage.equipeRemarquable, bouchon.remarkableTeam],
    [affinage.reservation, bouchon.reservation],
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
  return true;
}

// --- Tri ----------------------------------------------------------------------

export function trier<B extends Bouchon>(bouchons: B[], tri: Tri): B[] {
  const parNote = (a: Bouchon, b: Bouchon) => b.rating - a.rating;
  return [...bouchons].sort((a, b) => {
    if (tri === 'prix') {
      const pa = a.menuPrice;
      const pb = b.menuPrice;
      // Les prix non renseignés vont à la fin.
      if (typeof pa !== 'number' || typeof pb !== 'number') {
        if (typeof pa === typeof pb) return parNote(a, b);
        return typeof pa === 'number' ? -1 : 1;
      }
      return pa - pb || parNote(a, b);
    }
    if (tri === 'defaut' && a.compagnieFavorite !== b.compagnieFavorite) {
      return a.compagnieFavorite ? -1 : 1;
    }
    return parNote(a, b);
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
