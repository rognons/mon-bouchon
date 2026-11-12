import { describe, expect, it } from 'vitest';
import { BOUCHONS } from '../data/bouchons';
import type { Bouchon } from './regles';
import {
  etiquette,
  prixEnEuros,
  chapeauAUnCriterePres,
  critereParDefaut,
  decrire,
  decrireManque,
  lieuCourt,
  lieuxProposes,
  resumer,
  TYPES_DE_CRITERE,
} from './phrase';

describe('Formulation de la phrase de recherche', () => {
  it('décrit chaque critère comme une fin de phrase après « qui »', () => {
    expect(decrire({ type: 'prix', palier: 'max-30' })).toBe('a un menu à 30 € max');
    expect(decrire({ type: 'lieu', valeurs: ['presquile', '69003'] })).toBe(
      'se trouve sur la Presqu’île ou dans le 3e'
    );
    expect(decrire({ type: 'lieu', valeurs: ['villeurbanne'] })).toBe('se trouve à Villeurbanne');
    expect(decrire({ type: 'lieu', valeurs: ['croix-rousse'] })).toBe(
      'se trouve à la Croix-Rousse'
    );
    expect(decrire({ type: 'moment', jours: [6], services: ['midi'] })).toBe(
      'est ouvert le samedi midi'
    );
    expect(decrire({ type: 'typeBouchon', valeurs: ['traditionnel', 'moderne'] })).toBe(
      'est un bouchon traditionnel ou moderne'
    );
    expect(decrire({ type: 'vegetarien' })).toBe('propose une option végétarienne');
  });

  it('dit ce qui manque à un bouchon « à un critère près »', () => {
    expect(decrireManque({ type: 'lieu', valeurs: ['vieux-lyon'] }, 'non')).toBe(
      'Mais il ne se trouve pas dans le Vieux-Lyon.'
    );
    expect(decrireManque({ type: 'prix', palier: 'max-30' }, 'inconnu')).toBe(
      'Prix non renseigné.'
    );
    expect(decrireManque({ type: 'typeBouchon', valeurs: ['moderne'] }, 'inconnu')).toBe(
      'Type de bouchon non renseigné.'
    );
  });

  it('nomme le critère complémentaire dans le chapeau de « À un critère près »', () => {
    expect(chapeauAUnCriterePres({ type: 'vegetarien' }, 0)).toBe(
      'Aucun bouchon ne remplit vos deux critères. Ceux-ci remplissent votre critère n°1, mais pas « Option végé ».'
    );
    expect(chapeauAUnCriterePres({ type: 'lieu', valeurs: ['vieux-lyon'] }, 2)).toBe(
      'Peu de bouchons remplissent vos deux critères. Ceux-ci remplissent votre critère n°1, mais pas « Lieu : Vieux-Lyon ».'
    );
  });

  it('propose les cinq critères principaux, et un critère valide par défaut pour chacun', () => {
    expect(TYPES_DE_CRITERE.map((t) => t.type)).toEqual([
      'prix',
      'lieu',
      'moment',
      'typeBouchon',
      'vegetarien',
    ]);
    for (const { type } of TYPES_DE_CRITERE) {
      expect(critereParDefaut(type).type).toBe(type);
    }
  });

  it('résume chaque critère pour le rappel des choix', () => {
    expect(resumer({ type: 'prix', palier: 'max-35' })).toBe('Prix : 35 € max');
    expect(resumer({ type: 'lieu', valeurs: ['presquile', '69003'] })).toBe(
      'Lieu : Presqu’île ou 3e'
    );
    expect(resumer({ type: 'lieu', valeurs: ['les-cheres'] })).toBe('Lieu : Beaujolais');
    expect(resumer({ type: 'moment', jours: [6], services: ['machon'] })).toBe(
      'Jour et service : samedi, mâchon'
    );
    expect(resumer({ type: 'typeBouchon', valeurs: ['bourgeois'] })).toBe(
      'Type de bouchon : bourgeois'
    );
    expect(resumer({ type: 'vegetarien' })).toBe('Option végé');
  });

  it('décrit plusieurs jours et services', () => {
    const critere = {
      type: 'moment' as const,
      jours: [0, 6],
      services: ['soir' as const, 'midi' as const],
    };
    expect(decrire(critere)).toBe('est ouvert le samedi ou le dimanche, midi ou soir');
    expect(resumer(critere)).toBe('Jour et service : samedi ou dimanche, midi ou soir');
  });

  it('étiquette seulement les créneaux choisis où le bouchon est ouvert', () => {
    const b = {
      machonOption: false,
      openingHours: [
        { day: 6, open: '1200', close: '1400' },
        { day: 6, open: '1930', close: '2300' },
        { day: 0, open: '1200', close: '1400' },
      ],
    } as Bouchon;
    expect(etiquette({ type: 'moment', jours: [5, 6, 0], services: ['midi', 'soir'] }, b)).toBe(
      'Ouvert samedi midi et soir, dimanche midi'
    );
    const tousLesJours = {
      ...b,
      openingHours: [1, 2, 3].map((day) => ({ day, open: '1200', close: '1400' })),
    };
    expect(etiquette({ type: 'moment', jours: [1, 2, 3], services: ['midi'] }, tousLesJours)).toBe(
      'Ouvert sur 3 de vos créneaux'
    );
  });

  it('écrit les prix à la française', () => {
    expect(prixEnEuros(27)).toBe('27 €');
    expect(prixEnEuros(37.5)).toBe('37,50 €');
  });

  it('étiquette ce que le bouchon remplit', () => {
    const b = {
      menuPrice: 31,
      postalCode: '69002',
      commune: 'lyon',
      neighborhood: 'presquile',
      bouchonType: 'traditionnel',
      terrace: true,
      remarkableDecoration: false,
      remarkableTeam: false,
      wineFavorite: false,
      bouchonLyonnaisLabel: true,
      authenticSelection: false,
    } as Bouchon;
    expect(etiquette({ type: 'prix', palier: 'max-35' }, b)).toBe('Menu à 31 €');
    expect(etiquette({ type: 'lieu', valeurs: ['presquile'] }, b)).toBe('Sur la Presqu’île');
    expect(etiquette({ type: 'moment', jours: [6], services: ['soir'] }, b)).toBe(
      'Ouvert samedi soir'
    );
    expect(etiquette({ type: 'moment', jours: [0], services: ['machon'] }, b)).toBe(
      'Mâchon le dimanche'
    );
    expect(etiquette({ type: 'typeBouchon', valeurs: ['traditionnel'] }, b)).toBe(
      'Bouchon traditionnel'
    );
    expect(etiquette({ type: 'vegetarien' }, b)).toBe('Option végé');
  });

  it('nomme un lieu sans préposition', () => {
    expect(lieuCourt('vieux-lyon')).toBe('Vieux-Lyon');
    expect(lieuCourt('69009')).toBe('9e');
    expect(lieuCourt('villeurbanne')).toBe('Villeurbanne');
  });

  it('ne propose que les lieux où se trouve au moins un bouchon', () => {
    expect(lieuxProposes(BOUCHONS).map((l) => l.court)).toEqual([
      'Presqu’île',
      'Vieux-Lyon',
      'Croix-Rousse',
      '3e',
      '6e',
      '9e',
      'Villeurbanne',
      'Beaujolais',
    ]);
  });

  it('ne propose jamais un critère secondaire', () => {
    // Les critères secondaires (terrasse, profil…) se cochent dans l'affinage.
    const types = TYPES_DE_CRITERE.map((t) => t.type as string);
    for (const affinage of ['terrasse', 'ambiance', 'profil', 'portions', 'distinction']) {
      expect(types).not.toContain(affinage);
    }
  });
});
