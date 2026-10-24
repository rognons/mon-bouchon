import { describe, expect, it } from 'vitest';
import { critereParDefaut, decrire, decrireManque, TYPES_DE_CRITERE } from './phrase';

describe('Formulation de la phrase de recherche', () => {
  it('décrit chaque critère comme une fin de phrase après « qui »', () => {
    expect(decrire({ type: 'prix', palier: 'moins-de-32' })).toBe('a un menu à moins de 32 €');
    expect(decrire({ type: 'arrondissement', valeurs: ['69001', '69002'] })).toBe(
      'se trouve dans le 1er ou dans le 2e'
    );
    expect(decrire({ type: 'arrondissement', valeurs: ['villeurbanne'] })).toBe(
      'se trouve à Villeurbanne'
    );
    expect(decrire({ type: 'quartier', valeurs: ['croix-rousse'] })).toBe(
      'se trouve dans le quartier Croix-Rousse'
    );
    expect(decrire({ type: 'moment', jour: 6, service: 'midi' })).toBe('est ouvert le samedi midi');
    expect(decrire({ type: 'profil', profil: 'puriste' })).toBe('convient à un puriste canaille');
    expect(decrire({ type: 'portions', minimum: 'genereuses' })).toBe(
      'sert des portions au moins généreuses'
    );
    expect(decrire({ type: 'vegetarien' })).toBe('propose une option végétarienne');
  });

  it('dit ce qui manque à un bouchon « à un critère près »', () => {
    expect(decrireManque({ type: 'arrondissement', valeurs: ['69002'] }, 'non')).toBe(
      'Mais il ne se trouve pas dans le 2e.'
    );
    expect(decrireManque({ type: 'prix', palier: 'moins-de-32' }, 'inconnu')).toBe(
      'Prix non renseigné.'
    );
  });

  it('propose les sept critères de la phrase, et un critère valide par défaut pour chacun', () => {
    expect(TYPES_DE_CRITERE.map((t) => t.type)).toEqual([
      'prix',
      'arrondissement',
      'quartier',
      'moment',
      'profil',
      'portions',
      'vegetarien',
    ]);
    for (const { type } of TYPES_DE_CRITERE) {
      expect(critereParDefaut(type).type).toBe(type);
    }
  });

  it("n'utilise jamais un critère d'affinage", () => {
    // Les critères d'affinage (terrasse, ambiance…) n'existent pas dans la phrase.
    const types = TYPES_DE_CRITERE.map((t) => t.type as string);
    for (const affinage of ['terrasse', 'ambiance', 'typeBouchon', 'distinction']) {
      expect(types).not.toContain(affinage);
    }
  });
});
