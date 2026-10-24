import { describe, expect, it } from 'vitest';
import bouchonsJson from '../src/data/bouchons.json';
import {
  AMBIANCES,
  PORTIONS,
  PROFILS_MANGEUR,
  QUARTIERS,
  TYPES_BOUCHON,
} from '../src/data/referentiel.ts';
import {
  type BouchonJson,
  CHAMPS_GOOGLE,
  communeDepuisCodePostal,
  enrichir,
  ligneVersBouchon,
  sheetVersBouchons,
  ValeurInconnueError,
} from './conversion.ts';

const bouchons = bouchonsJson as unknown as BouchonJson[];

// Reconstitue la ligne du Google Sheet d'un bouchon de bouchons.json.
function ligneDuSheet(b: BouchonJson): string[] {
  const t = (valeurs: { code: string; texteSheet: string }[], code: unknown) =>
    valeurs.find((v) => v.code === code)?.texteSheet ?? '';
  const ligne = Array(26).fill('');
  ligne[0] = b.name;
  ligne[1] = typeof b.menuPrice === 'number' ? `${String(b.menuPrice).replace('.', ',')} €` : '';
  ligne[3] = t(QUARTIERS, b.neighborhood);
  ligne[4] = t(PORTIONS, b.portionSize);
  ligne[5] = t(PROFILS_MANGEUR, b.eaterType);
  ligne[6] = t(AMBIANCES, b.atmosphereType);
  ligne[7] = t(TYPES_BOUCHON, b.bouchonType);
  const booleens = [
    'vegetarianOption',
    'terrace',
    'machonOption',
    'remarkableDecoration',
    'remarkableTeam',
    'reservation',
    'dateFriendly',
    'businessMeal',
    'compagnieFavorite',
    'wineFavorite',
    'bouchonLyonnaisLabel',
    'authenticSelection',
    'valueForMoney',
  ];
  booleens.forEach((champ, i) => {
    ligne[8 + i] = b[champ] ? 'TRUE' : 'FALSE';
  });
  ligne[21] = ((b.specialties as string[]) ?? []).join(', ');
  ligne[22] = (b.description as string) ?? '';
  ligne[23] = (b.articleUrl as string) ?? '';
  ligne[24] = (b.menuUrl as string) ?? '';
  ligne[25] = (b.bookingUrl as string) ?? '';
  return ligne;
}

describe('Conversion du Google Sheet', () => {
  it('redonne exactement les 38 bouchons actuels à partir de leurs lignes du Sheet', () => {
    const lignes = [['titres'], ['champs'], ...bouchons.map(ligneDuSheet)];
    const convertis = sheetVersBouchons(lignes, bouchons);
    // Les champs vides (undefined) disparaissent, comme dans le fichier JSON.
    expect(JSON.parse(JSON.stringify(convertis))).toEqual(bouchons);
  });

  it('garde les informations Google des bouchons déjà connus', () => {
    const [premier] = sheetVersBouchons([['t'], ['c'], ligneDuSheet(bouchons[0])], bouchons);
    for (const champ of CHAMPS_GOOGLE) expect(premier[champ]).toEqual(bouchons[0][champ]);
  });

  it('refuse une valeur du Sheet inconnue du référentiel, en la nommant', () => {
    const ligne = ligneDuSheet(bouchons[0]);
    ligne[4] = '🐷🐷🐷🐷 Portions démesurées';
    expect(() => sheetVersBouchons([['t'], ['c'], ligne], [])).toThrow(ValeurInconnueError);
    expect(() => sheetVersBouchons([['t'], ['c'], ligne], [])).toThrow(/Portions démesurées/);
  });

  it('lit un prix « 32,50 € » et laisse vide un prix absent ou « - »', () => {
    const ligne = ligneDuSheet(bouchons[0]);
    expect(ligneVersBouchon([...ligne.slice(0, 1), '32,50 €', ...ligne.slice(2)]).menuPrice).toBe(
      32.5
    );
    expect(
      ligneVersBouchon([...ligne.slice(0, 1), '-', ...ligne.slice(2)]).menuPrice
    ).toBeUndefined();
  });
});

describe('Informations Google Places', () => {
  it('traduit les horaires, le code postal et la commune', () => {
    const enrichi = enrichir(
      { id: 'test', name: 'Test' },
      {
        opening_hours: {
          periods: [{ open: { day: 6, time: '1200' }, close: { day: 6, time: '1400' } }],
        },
        rating: 4.6,
        formatted_phone_number: '04 00 00 00 00',
        address_components: [{ long_name: '69100', short_name: '69100', types: ['postal_code'] }],
        url: 'https://maps.google.com/?cid=1',
        formatted_address: '1 rue Test, 69100 Villeurbanne',
      }
    );
    expect(enrichi.openingHours).toEqual([{ day: 6, open: '1200', close: '1400' }]);
    expect(enrichi.postalCode).toBe('69100');
    expect(enrichi.commune).toBe('villeurbanne');
    expect(enrichi.rating).toBe(4.6);
  });

  it('refuse un code postal hors de Lyon que le référentiel ne connaît pas', () => {
    expect(communeDepuisCodePostal('69007')).toBe('lyon');
    expect(() => communeDepuisCodePostal('69300')).toThrow(ValeurInconnueError);
  });
});
