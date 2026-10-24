// Vocabulaire de la phrase de recherche : comment chaque critère se dit, ses
// valeurs possibles, et comment décrire un critère qui manque à un bouchon.
// « Je cherche un bouchon lyonnais qui a un menu à moins de 32 €,
//   et qui se trouve à la Croix-Rousse. »

import {
  ARRONDISSEMENTS_LYON,
  COMMUNES,
  PORTIONS,
  PROFILS_MANGEUR,
  QUARTIERS,
} from '../data/referentiel';
import type { Critere, PalierDePrix, Service } from './regles';

export type TypeDeCritere = Critere['type'];

// Ordre et formulation des critères proposés dans la phrase.
export const TYPES_DE_CRITERE: { type: TypeDeCritere; verbe: string; negation: string }[] = [
  { type: 'prix', verbe: 'a un menu à', negation: 'n’a pas de menu à' },
  { type: 'arrondissement', verbe: 'se trouve', negation: 'ne se trouve pas' },
  {
    type: 'quartier',
    verbe: 'se trouve dans le quartier',
    negation: 'ne se trouve pas dans le quartier',
  },
  { type: 'moment', verbe: 'est ouvert', negation: 'n’est pas ouvert' },
  { type: 'profil', verbe: 'convient à', negation: 'ne convient pas à' },
  {
    type: 'portions',
    verbe: 'sert des portions au moins',
    negation: 'ne sert pas de portions au moins',
  },
  {
    type: 'vegetarien',
    verbe: 'propose une option végétarienne',
    negation: 'ne propose pas d’option végétarienne',
  },
];

export const PALIERS: { value: PalierDePrix; label: string }[] = [
  { value: 'moins-de-32', label: 'moins de 32 €' },
  { value: 'moins-de-38', label: 'moins de 38 €' },
  { value: 'sans-limite', label: 'n’importe quel prix' },
];

const ordinal = (n: number) => (n === 1 ? '1er' : `${n}e`);

export const LIEUX: { value: string; label: string }[] = [
  ...ARRONDISSEMENTS_LYON.map((cp) => ({
    value: cp as string,
    label: `dans le ${ordinal(Number(cp.slice(3)))}`,
  })),
  ...COMMUNES.map((c) => ({
    value: c.code as string,
    label: c.code === 'les-cheres' ? `aux Chères` : `à ${c.libelle}`,
  })),
];

export const JOURS: { value: number; label: string }[] = [
  { value: 1, label: 'le lundi' },
  { value: 2, label: 'le mardi' },
  { value: 3, label: 'le mercredi' },
  { value: 4, label: 'le jeudi' },
  { value: 5, label: 'le vendredi' },
  { value: 6, label: 'le samedi' },
  { value: 0, label: 'le dimanche' },
];

export const SERVICES: { value: Service; label: string }[] = [
  { value: 'machon', label: 'pour le mâchon (le matin)' },
  { value: 'midi', label: 'midi' },
  { value: 'soir', label: 'soir' },
];

// Le critère proposé quand l'utilisateur choisit un type dans la phrase.
export function critereParDefaut(type: TypeDeCritere): Critere {
  switch (type) {
    case 'prix':
      return { type, palier: 'moins-de-32' };
    case 'arrondissement':
      return { type, valeurs: ['69001'] };
    case 'quartier':
      return { type, valeurs: ['presquile'] };
    case 'moment':
      return { type, jour: 6, service: 'midi' };
    case 'profil':
      return { type, profil: 'amateur' };
    case 'portions':
      return { type, minimum: 'genereuses' };
    case 'vegetarien':
      return { type };
  }
}

const libelleDe = <T>(liste: { value: T; label: string }[], value: T) =>
  liste.find((x) => x.value === value)?.label ?? String(value);

const ouEntre = (mots: string[]) =>
  mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} ou ${mots.at(-1)}`;

// La fin de phrase d'un critère : « a un menu à moins de 32 € ». Avec
// negatif, la même à la forme négative : « n’a pas de menu à moins de 32 € ».
export function decrire(critere: Critere, negatif = false): string {
  const t = TYPES_DE_CRITERE.find((x) => x.type === critere.type);
  const verbe = (negatif ? t?.negation : t?.verbe) ?? '';
  switch (critere.type) {
    case 'prix':
      return `${verbe} ${libelleDe(PALIERS, critere.palier)}`;
    case 'arrondissement':
      return `${verbe} ${ouEntre(critere.valeurs.map((v) => libelleDe(LIEUX, v)))}`;
    case 'quartier':
      return `${verbe} ${ouEntre(
        critere.valeurs.map((q) => QUARTIERS.find((x) => x.code === q)?.libelle ?? q)
      )}`;
    case 'moment':
      return `${verbe} ${libelleDe(JOURS, critere.jour)} ${libelleDe(SERVICES, critere.service)}`;
    case 'profil':
      return `${verbe} ${PROFILS_MANGEUR.find((p) => p.code === critere.profil)?.court}`;
    case 'portions':
      return `${verbe} ${PORTIONS.find((p) => p.code === critere.minimum)?.court}`;
    case 'vegetarien':
      return verbe;
  }
}

// Ce qui manque à un bouchon « à un critère près », dit à l'utilisateur.
export function decrireManque(critere: Critere, raison: 'non' | 'inconnu'): string {
  if (raison === 'inconnu') {
    return critere.type === 'prix' ? 'Prix non renseigné.' : 'Information non renseignée.';
  }
  return `Mais il ${decrire(critere, true)}.`;
}
