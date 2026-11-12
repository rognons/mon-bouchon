// Vocabulaire de la phrase de recherche : comment chaque critère se dit, ses
// valeurs possibles, et comment décrire un critère qui manque à un bouchon.
// « Je cherche un bouchon lyonnais qui a un menu à 30 € max,
//   et qui se trouve à la Croix-Rousse. »

import { ARRONDISSEMENTS_LYON, COMMUNES, TYPES_BOUCHON } from '../data/referentiel';
import {
  type Bouchon,
  type Critere,
  lieuDe,
  type Moment,
  momentsRemplis,
  type PalierDePrix,
  type Service,
} from './regles';

export type TypeDeCritere = Critere['type'];

// Ordre, nom affiché sur les pastilles et formulation des critères principaux.
export const TYPES_DE_CRITERE: {
  type: TypeDeCritere;
  nom: string;
  verbe: string;
  negation: string;
}[] = [
  { type: 'prix', nom: 'Prix', verbe: 'a un menu à', negation: 'n’a pas de menu à' },
  { type: 'lieu', nom: 'Lieu', verbe: 'se trouve', negation: 'ne se trouve pas' },
  { type: 'moment', nom: 'Jour et service', verbe: 'est ouvert', negation: 'n’est pas ouvert' },
  {
    type: 'typeBouchon',
    nom: 'Type de bouchon',
    verbe: 'est un bouchon',
    negation: 'n’est pas un bouchon',
  },
  {
    type: 'vegetarien',
    nom: 'Option végé',
    verbe: 'propose une option végétarienne',
    negation: 'ne propose pas d’option végétarienne',
  },
];

export const nomDuCritere = (type: TypeDeCritere): string =>
  TYPES_DE_CRITERE.find((t) => t.type === type)?.nom ?? type;

export const PALIERS: { value: PalierDePrix; label: string }[] = [
  // Espaces insécables : « 30 € max » ne se coupe jamais en fin de ligne.
  { value: 'max-30', label: '30 € max' },
  { value: 'max-35', label: '35 € max' },
  { value: 'max-40', label: '40 € max' },
  { value: 'max-45', label: '45 € max' },
];

const ordinal = (n: number) => (n === 1 ? '1er' : `${n}e`);

// Tous les lieux possibles, dans l'ordre des pastilles : les quartiers, puis
// les arrondissements, puis les communes. label : dans une phrase ; court :
// sur une pastille.
export const LIEUX: { value: string; label: string; court: string }[] = [
  { value: 'presquile', label: 'sur la Presqu’île', court: 'Presqu’île' },
  { value: 'vieux-lyon', label: 'dans le Vieux-Lyon', court: 'Vieux-Lyon' },
  { value: 'croix-rousse', label: 'à la Croix-Rousse', court: 'Croix-Rousse' },
  ...ARRONDISSEMENTS_LYON.map((cp) => {
    const n = ordinal(Number(cp.slice(3)));
    return { value: cp as string, label: `dans le ${n}`, court: n };
  }),
  // Les Chères se présente comme le Beaujolais, plus parlant pour le public.
  ...COMMUNES.map((c) =>
    c.code === 'les-cheres'
      ? { value: c.code as string, label: 'dans le Beaujolais', court: 'Beaujolais' }
      : { value: c.code as string, label: `à ${c.libelle}`, court: c.libelle }
  ),
];

// Les lieux proposés : seulement ceux où se trouve au moins un bouchon.
export function lieuxProposes(bouchons: Bouchon[]) {
  const occupes = new Set(bouchons.map(lieuDe));
  return LIEUX.filter((l) => occupes.has(l.value));
}

export const JOURS: { value: number; label: string }[] = [
  { value: 1, label: 'le lundi' },
  { value: 2, label: 'le mardi' },
  { value: 3, label: 'le mercredi' },
  { value: 4, label: 'le jeudi' },
  { value: 5, label: 'le vendredi' },
  { value: 6, label: 'le samedi' },
  { value: 0, label: 'le dimanche' },
];

// Indexé par numéro de jour (0 = dimanche).
const JOURS_COURTS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export const SERVICES: { value: Service; label: string }[] = [
  { value: 'machon', label: 'pour le mâchon (le matin)' },
  { value: 'midi', label: 'midi' },
  { value: 'soir', label: 'soir' },
];

// Le critère proposé quand l'utilisateur choisit un type dans la phrase.
export function critereParDefaut(type: TypeDeCritere): Critere {
  switch (type) {
    case 'prix':
      return { type, palier: 'max-30' };
    case 'lieu':
      return { type, valeurs: ['presquile'] };
    case 'moment':
      return { type, jours: [6], services: ['midi'] };
    case 'typeBouchon':
      return { type, valeurs: ['traditionnel'] };
    case 'vegetarien':
      return { type };
  }
}

const typeCourt = (code: string) => TYPES_BOUCHON.find((t) => t.code === code)?.court ?? code;

const libelleDe = <T>(liste: { value: T; label: string }[], value: T) =>
  liste.find((x) => x.value === value)?.label ?? String(value);

const ouEntre = (mots: string[]) =>
  mots.length <= 1 ? (mots[0] ?? '') : `${mots.slice(0, -1).join(', ')} ou ${mots.at(-1)}`;

// Les jours dans l'ordre de la semaine (lundi d'abord), les services dans
// l'ordre de la journée (mâchon, midi, soir), quel que soit l'ordre des clics.
const ORDRE_SERVICES: Service[] = ['machon', 'midi', 'soir'];
const dansLOrdre = <T>(ordre: T[], valeurs: T[]) => ordre.filter((v) => valeurs.includes(v));
const joursDansLOrdre = (jours: number[]) =>
  dansLOrdre(
    JOURS.map((j) => j.value),
    jours
  );
const serviceCourt = (s: Service) => (s === 'machon' ? 'mâchon' : s);

// « le samedi midi », « le samedi ou le dimanche, midi ou soir ».
function joursEtServices(jours: string[], services: string[]): string {
  return `${ouEntre(jours)}${jours.length > 1 ? ',' : ''} ${ouEntre(services)}`;
}

// La fin de phrase d'un critère : « a un menu à 30 € max ». Avec
// negatif, la même à la forme négative : « n’a pas de menu à 30 € max ».
export function decrire(critere: Critere, negatif = false): string {
  const t = TYPES_DE_CRITERE.find((x) => x.type === critere.type);
  const verbe = (negatif ? t?.negation : t?.verbe) ?? '';
  switch (critere.type) {
    case 'prix':
      return `${verbe} ${libelleDe(PALIERS, critere.palier)}`;
    case 'lieu':
      return `${verbe} ${ouEntre(critere.valeurs.map((v) => libelleDe(LIEUX, v)))}`;
    case 'moment':
      return `${verbe} ${joursEtServices(
        joursDansLOrdre(critere.jours).map((j) => libelleDe(JOURS, j)),
        dansLOrdre(ORDRE_SERVICES, critere.services).map((sv) => libelleDe(SERVICES, sv))
      )}`;
    case 'typeBouchon':
      return `${verbe} ${ouEntre(critere.valeurs.map(typeCourt))}`;
    case 'vegetarien':
      return verbe;
  }
}

// Un lieu sans préposition, pour une pastille : « Presqu’île », « 3e ».
export function lieuCourt(value: string): string {
  return LIEUX.find((l) => l.value === value)?.court ?? value;
}

// Un critère en quelques mots, pour le rappel des choix au-dessus des
// résultats : « Prix : 30 € max », « Lieu : Presqu’île ou 3e ».
export function resumer(critere: Critere): string {
  const nom = nomDuCritere(critere.type);
  switch (critere.type) {
    case 'prix':
      return `${nom} : ${libelleDe(PALIERS, critere.palier)}`;
    case 'lieu':
      return `${nom} : ${ouEntre(critere.valeurs.map(lieuCourt))}`;
    case 'moment':
      return `${nom} : ${ouEntre(
        joursDansLOrdre(critere.jours).map((j) => JOURS_COURTS[j])
      )}, ${ouEntre(dansLOrdre(ORDRE_SERVICES, critere.services).map(serviceCourt))}`;
    case 'typeBouchon':
      return `${nom} : ${ouEntre(critere.valeurs.map(typeCourt))}`;
    case 'vegetarien':
      return nom;
  }
}

// L'information qui peut manquer pour un critère (le lieu et l'option
// végétarienne sont toujours renseignés).
const NON_RENSEIGNE: Record<TypeDeCritere, string> = {
  prix: 'Prix non renseigné.',
  lieu: 'Lieu non renseigné.',
  moment: 'Horaires non renseignés.',
  typeBouchon: 'Type de bouchon non renseigné.',
  vegetarien: 'Option végétarienne non renseignée.',
};

// Ce qui manque à un bouchon « à un critère près », dit à l'utilisateur.
export function decrireManque(critere: Critere, raison: 'non' | 'inconnu'): string {
  if (raison === 'inconnu') return NON_RENSEIGNE[critere.type];
  return `Mais il ${decrire(critere, true)}.`;
}

// --- Les cartes ---------------------------------------------------------------

// Un prix à la française : « 27 € », « 37,50 € » (espace insécable).
export function prixEnEuros(prix: number): string {
  const montant = Number.isInteger(prix) ? String(prix) : prix.toFixed(2).replace('.', ',');
  return `${montant} €`;
}

// Au-delà de deux jours, l'étiquette compte les créneaux au lieu de les citer,
// pour rester courte sur la carte.
const MAX_JOURS_ETIQUETTE = 2;

// « Ouvert samedi soir », « Mâchon le dimanche », « Ouvert samedi midi et
// soir, dimanche midi » : seulement les créneaux choisis où le bouchon est
// ouvert (tous les créneaux choisis si ses horaires manquent).
function etiquetteMoment(critere: Extract<Critere, { type: 'moment' }>, bouchon: Bouchon): string {
  const remplis: Moment[] = bouchon.openingHours?.length
    ? momentsRemplis(bouchon, critere)
    : critere.jours.flatMap((jour) => critere.services.map((service) => ({ jour, service })));
  if (remplis.length === 1 && remplis[0].service === 'machon') {
    return `Mâchon le ${JOURS_COURTS[remplis[0].jour]}`;
  }
  const jours = joursDansLOrdre(remplis.map((m) => m.jour));
  if (jours.length > MAX_JOURS_ETIQUETTE) {
    return `Ouvert sur ${remplis.length} de vos créneaux`;
  }
  const parJour = jours.map((jour) => {
    const services = remplis.filter((m) => m.jour === jour).map((m) => m.service);
    return `${JOURS_COURTS[jour]} ${dansLOrdre(ORDRE_SERVICES, services).map(serviceCourt).join(' et ')}`;
  });
  return `Ouvert ${parJour.join(', ')}`;
}

// L'étiquette d'un critère rempli par un bouchon, sur sa carte :
// « Menu à 27 € », « Sur la Presqu’île », « Ouvert samedi soir »…
export function etiquette(critere: Critere, bouchon: Bouchon): string {
  switch (critere.type) {
    case 'prix':
      return typeof bouchon.menuPrice === 'number'
        ? `Menu à ${prixEnEuros(bouchon.menuPrice)}`
        : nomDuCritere('prix');
    case 'lieu': {
      const label = libelleDe(LIEUX, lieuDe(bouchon));
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    case 'moment':
      return etiquetteMoment(critere, bouchon);
    case 'typeBouchon':
      return `Bouchon ${typeCourt(bouchon.bouchonType ?? '')}`;
    case 'vegetarien':
      return nomDuCritere('vegetarien');
  }
}

// Les infos clés toujours montrées sur une carte, à la suite des étiquettes
// des critères remplis : prix, lieu, type de bouchon et option végé. On saute
// celles qu'une étiquette dit déjà (dejaDits) et celles qu'on ne connaît pas
// (prix ou type non renseigné, pas d'option végé).
const TYPES_INFOS_CLES: TypeDeCritere[] = ['prix', 'lieu', 'typeBouchon', 'vegetarien'];

export function infosCles(
  bouchon: Bouchon,
  dejaDits: TypeDeCritere[] = []
): { type: TypeDeCritere; texte: string }[] {
  const connue: Record<string, boolean> = {
    prix: typeof bouchon.menuPrice === 'number',
    lieu: true,
    typeBouchon: Boolean(bouchon.bouchonType),
    vegetarien: bouchon.vegetarianOption === true,
  };
  return TYPES_INFOS_CLES.filter((type) => connue[type] && !dejaDits.includes(type)).map(
    (type) => ({ type, texte: etiquette(critereParDefaut(type), bouchon) })
  );
}

// Le chapeau de « À un critère près ». Le critère principal n'est jamais
// relâché : ce qui manque est toujours le critère complémentaire, qu'on
// nomme. Texte provisoire, à faire valider par la Compagnie.
export function chapeauAUnCriterePres(critereManquant: Critere, nbExacts: number): string {
  const debut =
    nbExacts === 0
      ? 'Aucun bouchon ne remplit vos deux critères.'
      : 'Peu de bouchons remplissent vos deux critères.';
  return `${debut} Ceux-ci remplissent votre critère n°1, mais pas « ${resumer(critereManquant)} ».`;
}
