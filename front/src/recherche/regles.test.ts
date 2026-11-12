import { describe, expect, it } from 'vitest';
import bouchonsJson from '../data/bouchons.json';
import {
  AMBIANCES,
  PORTIONS,
  PROFILS_MANGEUR,
  QUARTIERS,
  TOP_10_COMPAGNIE,
  TYPES_BOUCHON,
} from '../data/referentiel';
import {
  type Bouchon,
  type Critere,
  type PhraseDeRecherche,
  PhraseInvalideError,
  afficherAUnCriterePres,
  bouchonIdeal,
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

const moinsDe35: Critere = { type: 'prix', palier: 'max-35' };
const surLaPresquile: Critere = { type: 'lieu', valeurs: ['presquile'] };
const vegetarien: Critere = { type: 'vegetarien' };

describe('Phrase de recherche', () => {
  it('un résultat exact remplit tous les critères', () => {
    const bouchons = [unBouchon('bon'), unBouchon('trop-cher', { menuPrice: 40 })];
    const r = rechercher(bouchons, phrase(moinsDe35, surLaPresquile));
    expect(ids(r.exacts)).toEqual(['bon']);
  });

  it("le critère principal n'est jamais relâché", () => {
    const bouchons = [unBouchon('trop-cher', { menuPrice: 40 })];
    const r = rechercher(bouchons, phrase(moinsDe35, surLaPresquile));
    expect(r.exacts).toEqual([]);
    expect(r.aUnCriterePres).toEqual([]);
  });

  it('« À un critère près » : il manque le critère complémentaire, que l’on nomme', () => {
    const r = rechercher(
      [unBouchon('dans-le-5e', { postalCode: '69005', neighborhood: 'vieux-lyon' })],
      phrase(moinsDe35, surLaPresquile)
    );
    expect(r.exacts).toEqual([]);
    expect(r.aUnCriterePres).toHaveLength(1);
    expect(r.aUnCriterePres[0].critereManquant).toEqual(surLaPresquile);
    expect(r.aUnCriterePres[0].raison).toBe('non');
  });

  it('accepte au plus un critère complémentaire', () => {
    const trois = phrase(moinsDe35, surLaPresquile, vegetarien);
    expect(() => rechercher([], trois)).toThrow(PhraseInvalideError);
    expect(() =>
      rechercher([], { ...trois, complementaires: trois.complementaires.slice(0, 1) })
    ).not.toThrow();
  });

  it('refuse le même critère deux fois dans la phrase', () => {
    expect(() => rechercher([], phrase(moinsDe35, { type: 'prix', palier: 'max-40' }))).toThrow(
      PhraseInvalideError
    );
  });
});

describe('Affichage de « À un critère près »', () => {
  const proche = (id: string) => ({
    bouchon: unBouchon(id),
    critereManquant: surLaPresquile,
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
    const r = rechercher(bouchons, phrase(moinsDe35), { terrasse: true });
    expect(ids(r.exacts)).toEqual(['terrasse']);
  });

  it('retire aussi de « À un critère près », et n’est jamais relâché', () => {
    const bouchons = [unBouchon('dans-le-5e', { postalCode: '69005', neighborhood: 'vieux-lyon' })];
    const sansAffinage = rechercher(bouchons, phrase(moinsDe35, surLaPresquile));
    expect(sansAffinage.aUnCriterePres).toHaveLength(1);
    const avecAffinage = rechercher(bouchons, phrase(moinsDe35, surLaPresquile), {
      terrasse: true,
    });
    expect(avecAffinage.aUnCriterePres).toEqual([]);
  });

  it("filtre aussi par type de bouchon et par ambiance (l'un ou l'autre des types cochés)", () => {
    const bouchons = [
      unBouchon('moderne-calme', { bouchonType: 'moderne', atmosphereType: 'calme' }),
      unBouchon('moderne-anime', { bouchonType: 'moderne', atmosphereType: 'anime' }),
      unBouchon('bourgeois-calme', { bouchonType: 'bourgeois', atmosphereType: 'calme' }),
      unBouchon('traditionnel-calme', { atmosphereType: 'calme' }),
    ];
    const r = rechercher(bouchons, phrase(moinsDe35), {
      typesBouchon: ['moderne', 'bourgeois'],
      ambiances: ['calme'],
    });
    expect(ids(r.exacts).sort()).toEqual(['bourgeois-calme', 'moderne-calme']);
  });

  it('accepte les critères principaux absents de la recherche, exigés sans relâche', () => {
    const bouchons = [
      unBouchon('vege', { vegetarianOption: true }),
      unBouchon('pas-vege'),
      unBouchon('vege-vieux-lyon', {
        vegetarianOption: true,
        postalCode: '69005',
        neighborhood: 'vieux-lyon',
      }),
    ];
    const r = rechercher(bouchons, phrase(moinsDe35, surLaPresquile), {
      principaux: [vegetarien],
    });
    expect(ids(r.exacts)).toEqual(['vege']);
    // L'affinage retire aussi de « À un critère près ».
    expect(r.aUnCriterePres.map((p) => p.bouchon.id)).toEqual(['vege-vieux-lyon']);
  });
});

describe('Profil de mangeur, en affinage (cascade vers le plus doux)', () => {
  const bouchons = [
    unBouchon('pour-decouvreur', { eaterType: 'decouvreur' }),
    unBouchon('pour-amateur', { eaterType: 'amateur' }),
    unBouchon('pour-puriste', { eaterType: 'puriste' }),
    unBouchon('profil-inconnu', { eaterType: null }),
  ];

  it('un puriste voit les bouchons puristes, amateurs et découvreurs', () => {
    const r = rechercher(bouchons, phrase(moinsDe35), { profil: 'puriste' });
    expect(ids(r.exacts).sort()).toEqual(['pour-amateur', 'pour-decouvreur', 'pour-puriste']);
  });

  it('un amateur voit les bouchons amateurs et découvreurs', () => {
    const r = rechercher(bouchons, phrase(moinsDe35), { profil: 'amateur' });
    expect(ids(r.exacts).sort()).toEqual(['pour-amateur', 'pour-decouvreur']);
  });

  it('un découvreur ne voit que les bouchons pour découvreurs', () => {
    const r = rechercher(bouchons, phrase(moinsDe35), { profil: 'decouvreur' });
    expect(ids(r.exacts)).toEqual(['pour-decouvreur']);
  });
});

describe('Type de bouchon', () => {
  const bouchons = [
    unBouchon('traditionnel', { bouchonType: 'traditionnel' }),
    unBouchon('moderne', { bouchonType: 'moderne' }),
    unBouchon('bourgeois', { bouchonType: 'bourgeois' }),
    unBouchon('type-inconnu', { bouchonType: null }),
  ];

  it("accepte plusieurs types (l'un ou l'autre)", () => {
    const r = rechercher(
      bouchons,
      phrase({ type: 'typeBouchon', valeurs: ['moderne', 'bourgeois'] })
    );
    expect(ids(r.exacts).sort()).toEqual(['bourgeois', 'moderne']);
  });

  it('un type non renseigné compte « à un critère près » en complémentaire', () => {
    const r = rechercher(
      bouchons,
      phrase(moinsDe35, { type: 'typeBouchon', valeurs: ['traditionnel'] })
    );
    expect(r.aUnCriterePres.find((p) => p.bouchon.id === 'type-inconnu')?.raison).toBe('inconnu');
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
    const r45 = rechercher(bouchons, phrase({ type: 'prix', palier: 'max-45' }));
    expect(ids(r45.exacts).sort()).toEqual(['a-30', 'a-32', 'a-36', 'a-45']);
    const r40 = rechercher(bouchons, phrase({ type: 'prix', palier: 'max-40' }));
    expect(ids(r40.exacts).sort()).toEqual(['a-30', 'a-32', 'a-36']);
    const r35 = rechercher(bouchons, phrase(moinsDe35));
    expect(ids(r35.exacts).sort()).toEqual(['a-30', 'a-32']);
    const r30 = rechercher(bouchons, phrase({ type: 'prix', palier: 'max-30' }));
    expect(ids(r30.exacts).sort()).toEqual(['a-30']);
  });

  it("un prix non renseigné n'est jamais un résultat exact, mais compte « à un critère près » en complémentaire", () => {
    const r = rechercher(bouchons, phrase(surLaPresquile, moinsDe35));
    expect(ids(r.exacts)).not.toContain('prix-inconnu');
    const pres = r.aUnCriterePres.find((p) => p.bouchon.id === 'prix-inconnu');
    expect(pres?.raison).toBe('inconnu');
    expect(pres?.critereManquant).toEqual(moinsDe35);
  });

  it("un prix non renseigné n'apparaît nulle part quand le prix est le critère principal", () => {
    const r = rechercher(bouchons, phrase(moinsDe35, surLaPresquile));
    expect(ids(r.exacts)).not.toContain('prix-inconnu');
    expect(r.aUnCriterePres.map((p) => p.bouchon.id)).not.toContain('prix-inconnu');
  });
});

describe('Portions, en affinage (minimum)', () => {
  it('« au moins généreuses » montre les généreuses et les gargantuesques', () => {
    const bouchons = [
      unBouchon('raisonnables', { portionSize: 'raisonnables' }),
      unBouchon('genereuses', { portionSize: 'genereuses' }),
      unBouchon('gargantuesques', { portionSize: 'gargantuesques' }),
    ];
    const r = rechercher(bouchons, phrase(moinsDe35), { portionsMinimum: 'genereuses' });
    expect(ids(r.exacts).sort()).toEqual(['gargantuesques', 'genereuses']);
  });
});

describe('Jour et service', () => {
  const samediMidi: Critere = { type: 'moment', jours: [6], services: ['midi'] };
  const samediSoir: Critere = { type: 'moment', jours: [6], services: ['soir'] };

  it('trouve un bouchon ouvert ce jour-là pour ce service', () => {
    expect(evaluer(unBouchon('ouvert'), samediMidi)).toBe('oui');
    expect(evaluer(unBouchon('ouvert'), samediSoir)).toBe('oui');
  });

  it('écarte un bouchon fermé ce jour-là', () => {
    expect(evaluer(unBouchon('ouvert'), { type: 'moment', jours: [0], services: ['midi'] })).toBe(
      'non'
    );
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
    const samediMachon: Critere = { type: 'moment', jours: [6], services: ['machon'] };
    expect(evaluer(unBouchon('machon', { machonOption: true }), samediMachon)).toBe('oui');
    expect(evaluer(unBouchon('sans-machon'), samediMachon)).toBe('non');
    expect(
      evaluer(unBouchon('machon', { machonOption: true }), { ...samediMachon, jours: [0] })
    ).toBe('non');
  });
});

describe('Jour et service : plusieurs choix', () => {
  // Ouvert du mardi au samedi, midi et soir (voir unBouchon).
  it('garde un bouchon ouvert sur au moins une des combinaisons choisies', () => {
    const dimancheOuSamedi: Critere = { type: 'moment', jours: [0, 6], services: ['midi'] };
    expect(evaluer(unBouchon('ouvert'), dimancheOuSamedi)).toBe('oui');
  });

  it('écarte un bouchon fermé sur toutes les combinaisons choisies', () => {
    const dimancheOuLundi: Critere = { type: 'moment', jours: [0, 1], services: ['midi', 'soir'] };
    expect(evaluer(unBouchon('ouvert'), dimancheOuLundi)).toBe('non');
  });

  it('accepte le soir quand le bouchon n’est ouvert que le soir', () => {
    const soirSeulement = unBouchon('soir-seulement', {
      openingHours: [{ day: 5, open: '1900', close: '2300' }],
    });
    expect(evaluer(soirSeulement, { type: 'moment', jours: [5], services: ['midi', 'soir'] })).toBe(
      'oui'
    );
  });
});

describe('Lieu', () => {
  const bouchons = [
    unBouchon('dans-le-1er', { postalCode: '69001' }),
    unBouchon('dans-le-2e', { postalCode: '69002' }),
    unBouchon('dans-le-5e', { postalCode: '69005', neighborhood: 'vieux-lyon' }),
    unBouchon('dans-le-3e', { postalCode: '69003', neighborhood: null }),
    unBouchon('villeurbanne', { postalCode: '69100', commune: 'villeurbanne', neighborhood: null }),
  ];
  const lieu = (...valeurs: string[]): Critere => ({ type: 'lieu', valeurs });

  it('le lieu d’un bouchon est son quartier, quel que soit son arrondissement', () => {
    const r = rechercher(bouchons, phrase(lieu('presquile')));
    expect(ids(r.exacts).sort()).toEqual(['dans-le-1er', 'dans-le-2e']);
  });

  it('sans quartier, le lieu est l’arrondissement ou la commune', () => {
    const r = rechercher(bouchons, phrase(lieu('69003', 'villeurbanne')));
    expect(ids(r.exacts).sort()).toEqual(['dans-le-3e', 'villeurbanne']);
  });

  it("accepte plusieurs lieux (l'un ou l'autre)", () => {
    const r = rechercher(bouchons, phrase(lieu('vieux-lyon', '69003')));
    expect(ids(r.exacts).sort()).toEqual(['dans-le-3e', 'dans-le-5e']);
  });

  it('un bouchon qui a un quartier ne se trouve pas par son arrondissement', () => {
    const r = rechercher(bouchons, phrase(lieu('69001')));
    expect(r.exacts).toEqual([]);
  });
});

describe('Option végétarienne', () => {
  it('ne garde que les bouchons avec une option végétarienne', () => {
    const bouchons = [unBouchon('vege', { vegetarianOption: true }), unBouchon('pas-vege')];
    expect(ids(rechercher(bouchons, phrase(vegetarien)).exacts)).toEqual(['vege']);
  });
});

describe('Tri', () => {
  // chez-hugon et les-4g sont les n°1 et n°2 du top 10 de la Compagnie.
  const bouchons = [
    unBouchon('note-48', { rating: 4.8, menuPrice: 36 }),
    unBouchon('les-4g', { rating: 4.7, compagnieFavorite: true, menuPrice: 32 }),
    unBouchon('note-46', { rating: 4.6, menuPrice: undefined }),
    unBouchon('chez-hugon', { rating: 4.4, compagnieFavorite: true, menuPrice: 30 }),
  ];
  // Tous ces bouchons de test sont sur la Presqu'île.
  const tout = phrase(surLaPresquile);

  it('par défaut : le top 10 de la Compagnie dans l’ordre, puis la note Google', () => {
    expect(ids(rechercher(bouchons, tout).exacts)).toEqual([
      'chez-hugon',
      'les-4g',
      'note-48',
      'note-46',
    ]);
  });

  it('par défaut, à note Google égale, le moins cher d’abord', () => {
    const egaux = [
      unBouchon('cher', { rating: 4.5, menuPrice: 38 }),
      unBouchon('sans-prix', { rating: 4.5, menuPrice: undefined }),
      unBouchon('pas-cher', { rating: 4.5, menuPrice: 25 }),
    ];
    expect(ids(rechercher(egaux, tout).exacts)).toEqual(['pas-cher', 'cher', 'sans-prix']);
  });

  it('par note Google, sans tenir compte du top 10', () => {
    expect(ids(rechercher(bouchons, tout, {}, 'note').exacts)).toEqual([
      'note-48',
      'les-4g',
      'note-46',
      'chez-hugon',
    ]);
  });

  it('par prix croissant, les prix non renseignés à la fin', () => {
    expect(ids(rechercher(bouchons, tout, {}, 'prix').exacts)).toEqual([
      'chez-hugon',
      'les-4g',
      'note-48',
      'note-46',
    ]);
  });
});

describe('Données réelles (bouchons.json)', () => {
  const bouchons = bouchonsJson as Bouchon[];
  const codes = (valeurs: { code: string }[]) => valeurs.map((v) => v.code);

  it('le top 10 de la Compagnie désigne ses dix coups de cœur', () => {
    const coupsDeCoeur = bouchons.filter((b) => b.compagnieFavorite).map((b) => b.id);
    expect([...TOP_10_COMPAGNIE].sort()).toEqual([...coupsDeCoeur].sort());
  });

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
    const r = rechercher(bouchons, phrase({ type: 'lieu', valeurs: ['villeurbanne'] }));
    expect(r.exacts.map((b) => b.name)).toEqual(['Café Lobut']);
  });
});

describe('Votre bouchon idéal', () => {
  // Les vrais identifiants du top 10, pour que le classement compte.
  const [premier, deuxieme, troisieme] = TOP_10_COMPAGNIE;
  const hors = 'hors-du-top-10';

  it("choisit d'abord le bouchon qui remplit le plus de critères", () => {
    const bouchons = [
      unBouchon(premier, { vegetarianOption: false }),
      unBouchon(troisieme, { vegetarianOption: true }),
    ];
    expect(bouchonIdeal(bouchons, [moinsDe35, vegetarien])?.id).toBe(troisieme);
  });

  it('à égalité de critères, choisit le mieux classé du top 10, quel que soit le tri', () => {
    const bouchons = [unBouchon(troisieme), unBouchon(premier), unBouchon(deuxieme)];
    expect(bouchonIdeal(bouchons, [moinsDe35])?.id).toBe(premier);
  });

  it('ne choisit jamais un bouchon hors du top 10, même s’il remplit plus de critères', () => {
    const bouchons = [
      unBouchon(hors, { vegetarianOption: true }),
      unBouchon(deuxieme, { vegetarianOption: false }),
    ];
    expect(bouchonIdeal(bouchons, [moinsDe35, vegetarien])?.id).toBe(deuxieme);
  });

  it("n'en propose pas si aucun bouchon affiché n'est dans le top 10", () => {
    expect(bouchonIdeal([unBouchon(hors), unBouchon('autre')], [moinsDe35])).toBeNull();
  });

  it("n'en propose pas sans critère choisi", () => {
    expect(bouchonIdeal([unBouchon(premier)], [])).toBeNull();
  });
});
