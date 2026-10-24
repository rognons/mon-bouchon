import { describe, expect, it } from 'vitest';
import bouchonsJson from '../data/bouchons.json';
import {
  AMBIANCES,
  PORTIONS,
  PROFILS_MANGEUR,
  QUARTIERS,
  TYPES_BOUCHON,
} from '../data/referentiel';
import {
  type Bouchon,
  type Critere,
  type PhraseDeRecherche,
  PhraseInvalideError,
  afficherAUnCriterePres,
  evaluer,
  rechercher,
} from './regles';

// Un bouchon de test : ouvert du mardi au samedi, midi et soir, 30 €.
function unBouchon(id: string, autres: Partial<Bouchon> = {}): Bouchon {
  const jours = [2, 3, 4, 5, 6];
  return {
    id,
    name: id,
    menuPrice: 30,
    postalCode: '69002',
    commune: 'lyon',
    neighborhood: 'presquile',
    portionSize: 'genereuses',
    eaterType: 'amateur',
    atmosphereType: 'convivial',
    bouchonType: 'traditionnel',
    vegetarianOption: false,
    machonOption: false,
    terrace: false,
    remarkableDecoration: false,
    remarkableTeam: false,
    reservation: false,
    compagnieFavorite: false,
    wineFavorite: false,
    bouchonLyonnaisLabel: false,
    authenticSelection: false,
    rating: 4.5,
    openingHours: jours.flatMap((day) => [
      { day, open: '1200', close: '1400' },
      { day, open: '1930', close: '2200' },
    ]),
    ...autres,
  };
}

const phrase = (principal: Critere, ...complementaires: Critere[]): PhraseDeRecherche => ({
  principal,
  complementaires,
});
const ids = (bouchons: Bouchon[]) => bouchons.map((b) => b.id);

const moinsDe32: Critere = { type: 'prix', palier: 'moins-de-32' };
const dansLe2e: Critere = { type: 'arrondissement', valeurs: ['69002'] };
const vegetarien: Critere = { type: 'vegetarien' };

describe('Phrase de recherche', () => {
  it('un résultat exact remplit tous les critères', () => {
    const bouchons = [unBouchon('bon'), unBouchon('trop-cher', { menuPrice: 40 })];
    const r = rechercher(bouchons, phrase(moinsDe32, dansLe2e));
    expect(ids(r.exacts)).toEqual(['bon']);
  });

  it("le critère principal n'est jamais relâché", () => {
    const bouchons = [unBouchon('trop-cher', { menuPrice: 40 })];
    const r = rechercher(bouchons, phrase(moinsDe32, dansLe2e));
    expect(r.exacts).toEqual([]);
    expect(r.aUnCriterePres).toEqual([]);
  });

  it('« À un critère près » : il manque un seul critère complémentaire, que l’on nomme', () => {
    const bouchons = [unBouchon('dans-le-5e', { postalCode: '69005' })];
    const r = rechercher(bouchons, phrase(moinsDe32, dansLe2e, vegetarien));
    expect(r.exacts).toEqual([]);
    expect(r.aUnCriterePres).toEqual([]);

    const r2 = rechercher(
      [unBouchon('dans-le-5e', { postalCode: '69005', vegetarianOption: true })],
      phrase(moinsDe32, dansLe2e, vegetarien)
    );
    expect(r2.aUnCriterePres).toHaveLength(1);
    expect(r2.aUnCriterePres[0].critereManquant).toEqual(dansLe2e);
    expect(r2.aUnCriterePres[0].raison).toBe('non');
  });

  it("un bouchon à qui il manque deux critères complémentaires n'apparaît nulle part", () => {
    const bouchons = [unBouchon('loin', { postalCode: '69005' })];
    const r = rechercher(bouchons, phrase(moinsDe32, dansLe2e, vegetarien));
    expect(r.exacts).toEqual([]);
    expect(r.aUnCriterePres).toEqual([]);
  });

  it('accepte au plus trois critères complémentaires', () => {
    const quatre = phrase(
      moinsDe32,
      dansLe2e,
      vegetarien,
      { type: 'profil', profil: 'puriste' },
      { type: 'portions', minimum: 'genereuses' }
    );
    expect(() => rechercher([], quatre)).toThrow(PhraseInvalideError);
    expect(() =>
      rechercher([], { ...quatre, complementaires: quatre.complementaires.slice(0, 3) })
    ).not.toThrow();
  });

  it('refuse le même critère deux fois dans la phrase', () => {
    expect(() =>
      rechercher([], phrase(moinsDe32, { type: 'prix', palier: 'moins-de-38' }))
    ).toThrow(PhraseInvalideError);
  });
});

describe('Affichage de « À un critère près »', () => {
  const proche = (id: string) => ({
    bouchon: unBouchon(id),
    critereManquant: dansLe2e,
    raison: 'non' as const,
  });

  it("s'affiche quand il y a moins de 3 résultats exacts", () => {
    expect(afficherAUnCriterePres({ exacts: [], aUnCriterePres: [proche('a')] })).toBe(true);
    expect(
      afficherAUnCriterePres({
        exacts: [unBouchon('1'), unBouchon('2')],
        aUnCriterePres: [proche('a')],
      })
    ).toBe(true);
  });

  it("ne s'affiche pas à partir de 3 résultats exacts, ni quand il n'y a aucun bouchon proche", () => {
    const trois = [unBouchon('1'), unBouchon('2'), unBouchon('3')];
    expect(afficherAUnCriterePres({ exacts: trois, aUnCriterePres: [proche('a')] })).toBe(false);
    expect(afficherAUnCriterePres({ exacts: [], aUnCriterePres: [] })).toBe(false);
  });
});

describe('Affinage', () => {
  it('retire les bouchons qui ne le remplissent pas des résultats exacts', () => {
    const bouchons = [unBouchon('terrasse', { terrace: true }), unBouchon('sans-terrasse')];
    const r = rechercher(bouchons, phrase(moinsDe32), { terrasse: true });
    expect(ids(r.exacts)).toEqual(['terrasse']);
  });

  it('retire aussi de « À un critère près », et n’est jamais relâché', () => {
    const bouchons = [unBouchon('dans-le-5e', { postalCode: '69005' })];
    const sansAffinage = rechercher(bouchons, phrase(moinsDe32, dansLe2e));
    expect(sansAffinage.aUnCriterePres).toHaveLength(1);
    const avecAffinage = rechercher(bouchons, phrase(moinsDe32, dansLe2e), { terrasse: true });
    expect(avecAffinage.aUnCriterePres).toEqual([]);
  });

  it("filtre aussi par type de bouchon et par ambiance (l'un ou l'autre des types cochés)", () => {
    const bouchons = [
      unBouchon('moderne-calme', { bouchonType: 'moderne', atmosphereType: 'calme' }),
      unBouchon('moderne-anime', { bouchonType: 'moderne', atmosphereType: 'anime' }),
      unBouchon('bourgeois-calme', { bouchonType: 'bourgeois', atmosphereType: 'calme' }),
      unBouchon('traditionnel-calme', { atmosphereType: 'calme' }),
    ];
    const r = rechercher(bouchons, phrase(moinsDe32), {
      typesBouchon: ['moderne', 'bourgeois'],
      ambiances: ['calme'],
    });
    expect(ids(r.exacts).sort()).toEqual(['bourgeois-calme', 'moderne-calme']);
  });
});

describe('Profil de mangeur (cascade vers le plus doux)', () => {
  const bouchons = [
    unBouchon('pour-decouvreur', { eaterType: 'decouvreur' }),
    unBouchon('pour-amateur', { eaterType: 'amateur' }),
    unBouchon('pour-puriste', { eaterType: 'puriste' }),
  ];

  it('un puriste voit les bouchons puristes, amateurs et découvreurs', () => {
    const r = rechercher(bouchons, phrase({ type: 'profil', profil: 'puriste' }));
    expect(ids(r.exacts).sort()).toEqual(['pour-amateur', 'pour-decouvreur', 'pour-puriste']);
  });

  it('un amateur voit les bouchons amateurs et découvreurs', () => {
    const r = rechercher(bouchons, phrase({ type: 'profil', profil: 'amateur' }));
    expect(ids(r.exacts).sort()).toEqual(['pour-amateur', 'pour-decouvreur']);
  });

  it('un découvreur ne voit que les bouchons pour découvreurs', () => {
    const r = rechercher(bouchons, phrase({ type: 'profil', profil: 'decouvreur' }));
    expect(ids(r.exacts)).toEqual(['pour-decouvreur']);
  });
});

describe('Palier de prix (budget maximum)', () => {
  const bouchons = [
    unBouchon('a-30', { menuPrice: 30 }),
    unBouchon('a-32', { menuPrice: 32 }),
    unBouchon('a-36', { menuPrice: 36 }),
    unBouchon('a-45', { menuPrice: 45 }),
    unBouchon('prix-inconnu', { menuPrice: undefined }),
  ];

  it('un palier inclut tous les bouchons moins chers, seuil compris', () => {
    const r = rechercher(bouchons, phrase({ type: 'prix', palier: 'moins-de-38' }));
    expect(ids(r.exacts).sort()).toEqual(['a-30', 'a-32', 'a-36']);
    const r32 = rechercher(bouchons, phrase(moinsDe32));
    expect(ids(r32.exacts).sort()).toEqual(['a-30', 'a-32']);
  });

  it('« sans limite » montre tous les bouchons, y compris sans prix', () => {
    const r = rechercher(bouchons, phrase({ type: 'prix', palier: 'sans-limite' }));
    expect(r.exacts).toHaveLength(5);
  });

  it("un prix non renseigné n'est jamais un résultat exact, mais compte « à un critère près » en complémentaire", () => {
    const r = rechercher(bouchons, phrase(dansLe2e, moinsDe32));
    expect(ids(r.exacts)).not.toContain('prix-inconnu');
    const pres = r.aUnCriterePres.find((p) => p.bouchon.id === 'prix-inconnu');
    expect(pres?.raison).toBe('inconnu');
    expect(pres?.critereManquant).toEqual(moinsDe32);
  });

  it("un prix non renseigné n'apparaît nulle part quand le prix est le critère principal", () => {
    const r = rechercher(bouchons, phrase(moinsDe32, dansLe2e));
    expect(ids(r.exacts)).not.toContain('prix-inconnu');
    expect(r.aUnCriterePres.map((p) => p.bouchon.id)).not.toContain('prix-inconnu');
  });
});

describe('Portions (minimum)', () => {
  it('« au moins généreuses » montre les généreuses et les gargantuesques', () => {
    const bouchons = [
      unBouchon('raisonnables', { portionSize: 'raisonnables' }),
      unBouchon('genereuses', { portionSize: 'genereuses' }),
      unBouchon('gargantuesques', { portionSize: 'gargantuesques' }),
    ];
    const r = rechercher(bouchons, phrase({ type: 'portions', minimum: 'genereuses' }));
    expect(ids(r.exacts).sort()).toEqual(['gargantuesques', 'genereuses']);
  });
});

describe('Jour et service', () => {
  const samediMidi: Critere = { type: 'moment', jour: 6, service: 'midi' };
  const samediSoir: Critere = { type: 'moment', jour: 6, service: 'soir' };

  it('trouve un bouchon ouvert ce jour-là pour ce service', () => {
    expect(evaluer(unBouchon('ouvert'), samediMidi)).toBe('oui');
    expect(evaluer(unBouchon('ouvert'), samediSoir)).toBe('oui');
  });

  it('écarte un bouchon fermé ce jour-là', () => {
    expect(evaluer(unBouchon('ouvert'), { type: 'moment', jour: 0, service: 'midi' })).toBe('non');
  });

  it('écarte un bouchon ouvert ce jour-là mais pas pour ce service', () => {
    const midiSeulement = unBouchon('midi-seulement', {
      openingHours: [{ day: 6, open: '1145', close: '1530' }],
    });
    expect(evaluer(midiSeulement, samediMidi)).toBe('oui');
    expect(evaluer(midiSeulement, samediSoir)).toBe('non');
  });

  it('compte un créneau qui ferme à minuit pour le soir', () => {
    const tard = unBouchon('tard', { openingHours: [{ day: 6, open: '1930', close: '0000' }] });
    expect(evaluer(tard, samediSoir)).toBe('oui');
  });

  it('mâchon (règle provisoire) : le bouchon sert le mâchon et il est ouvert ce jour-là', () => {
    const samediMachon: Critere = { type: 'moment', jour: 6, service: 'machon' };
    expect(evaluer(unBouchon('machon', { machonOption: true }), samediMachon)).toBe('oui');
    expect(evaluer(unBouchon('sans-machon'), samediMachon)).toBe('non');
    expect(evaluer(unBouchon('machon', { machonOption: true }), { ...samediMachon, jour: 0 })).toBe(
      'non'
    );
  });
});

describe('Lieu', () => {
  const bouchons = [
    unBouchon('dans-le-1er', { postalCode: '69001' }),
    unBouchon('dans-le-2e', { postalCode: '69002' }),
    unBouchon('dans-le-5e', { postalCode: '69005', neighborhood: 'vieux-lyon' }),
    unBouchon('villeurbanne', { postalCode: '69100', commune: 'villeurbanne', neighborhood: null }),
  ];

  it("accepte plusieurs arrondissements (l'un ou l'autre)", () => {
    const r = rechercher(bouchons, phrase({ type: 'arrondissement', valeurs: ['69001', '69002'] }));
    expect(ids(r.exacts).sort()).toEqual(['dans-le-1er', 'dans-le-2e']);
  });

  it('trouve un bouchon hors de Lyon par sa commune, et seulement par elle', () => {
    const r = rechercher(bouchons, phrase({ type: 'arrondissement', valeurs: ['villeurbanne'] }));
    expect(ids(r.exacts)).toEqual(['villeurbanne']);
    const r1 = rechercher(bouchons, phrase({ type: 'arrondissement', valeurs: ['69001'] }));
    expect(ids(r1.exacts)).not.toContain('villeurbanne');
  });

  it("un bouchon sans quartier n'est dans aucun quartier", () => {
    const r = rechercher(
      bouchons,
      phrase({ type: 'quartier', valeurs: ['presquile', 'vieux-lyon'] })
    );
    expect(ids(r.exacts).sort()).toEqual(['dans-le-1er', 'dans-le-2e', 'dans-le-5e']);
  });
});

describe('Option végétarienne', () => {
  it('ne garde que les bouchons avec une option végétarienne', () => {
    const bouchons = [unBouchon('vege', { vegetarianOption: true }), unBouchon('pas-vege')];
    expect(ids(rechercher(bouchons, phrase(vegetarien)).exacts)).toEqual(['vege']);
  });
});

describe('Tri', () => {
  const bouchons = [
    unBouchon('note-48', { rating: 4.8, menuPrice: 36 }),
    unBouchon('coup-de-coeur-44', { rating: 4.4, compagnieFavorite: true, menuPrice: 30 }),
    unBouchon('note-46', { rating: 4.6, menuPrice: undefined }),
    unBouchon('coup-de-coeur-47', { rating: 4.7, compagnieFavorite: true, menuPrice: 32 }),
  ];
  const tout = phrase({ type: 'prix', palier: 'sans-limite' });

  it('par défaut : coups de cœur de la Compagnie d’abord, puis la note Google', () => {
    expect(ids(rechercher(bouchons, tout).exacts)).toEqual([
      'coup-de-coeur-47',
      'coup-de-coeur-44',
      'note-48',
      'note-46',
    ]);
  });

  it('par note Google, sans tenir compte des coups de cœur', () => {
    expect(ids(rechercher(bouchons, tout, {}, 'note').exacts)).toEqual([
      'note-48',
      'coup-de-coeur-47',
      'note-46',
      'coup-de-coeur-44',
    ]);
  });

  it('par prix croissant, les prix non renseignés à la fin', () => {
    expect(ids(rechercher(bouchons, tout, {}, 'prix').exacts)).toEqual([
      'coup-de-coeur-44',
      'coup-de-coeur-47',
      'note-48',
      'note-46',
    ]);
  });
});

describe('Données réelles (bouchons.json)', () => {
  const bouchons = bouchonsJson as Bouchon[];
  const codes = (valeurs: { code: string }[]) => valeurs.map((v) => v.code);

  it('toutes les valeurs codées sont connues du référentiel', () => {
    for (const b of bouchons) {
      expect(codes(PROFILS_MANGEUR)).toContain(b.eaterType);
      expect(codes(PORTIONS)).toContain(b.portionSize);
      expect(codes(TYPES_BOUCHON)).toContain(b.bouchonType);
      expect(codes(AMBIANCES)).toContain(b.atmosphereType);
      if (b.neighborhood !== null) expect(codes(QUARTIERS)).toContain(b.neighborhood);
    }
  });

  it('chaque bouchon a un identifiant unique', () => {
    expect(new Set(ids(bouchons)).size).toBe(bouchons.length);
  });

  it('le Café Lobut se trouve en cherchant Villeurbanne', () => {
    const r = rechercher(bouchons, phrase({ type: 'arrondissement', valeurs: ['villeurbanne'] }));
    expect(r.exacts.map((b) => b.name)).toEqual(['Café Lobut']);
  });
});
