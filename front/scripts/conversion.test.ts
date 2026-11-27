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
  positionsDesColonnes,
  sheetVersBouchons,
  TITRES_SHEET,
  ValeurInconnueError,
} from './conversion.ts';

const bouchons = bouchonsJson as unknown as BouchonJson[];

const P = positionsDesColonnes(TITRES_SHEET);

// Reconstitue la ligne du Google Sheet d'un bouchon de bouchons.json.
function ligneDuSheet(b: BouchonJson): string[] {
  const t = (valeurs: { code: string; texteSheet: string }[], code: unknown) =>
    valeurs.find((v) => v.code === code)?.texteSheet ?? '';
  const ligne = Array(TITRES_SHEET.length).fill('');
  ligne[0] = b.name;
  ligne[P.menuPrice] =
    typeof b.menuPrice === 'number' ? `${String(b.menuPrice).replace('.', ',')} €` : '';
  ligne[P.neighborhood] = t(QUARTIERS, b.neighborhood);
  ligne[P.portionSize] = t(PORTIONS, b.portionSize);
  ligne[P.eaterType] = t(PROFILS_MANGEUR, b.eaterType);
  ligne[P.atmosphereType] = t(AMBIANCES, b.atmosphereType);
  ligne[P.bouchonType] = t(TYPES_BOUCHON, b.bouchonType);
  const booleens = [
    'vegetarianOption',
    'terrace',
    'machonOption',
    'remarkableDecoration',
    'remarkableTeam',
    'compagnieFavorite',
    'wineFavorite',
    'bouchonLyonnaisLabel',
    'authenticSelection',
  ] as const;
  for (const champ of booleens) ligne[P[champ]] = b[champ] ? 'TRUE' : 'FALSE';
  for (const champ of ['description', 'articleUrl', 'menuUrl', 'bookingUrl', 'phone'] as const)
    ligne[P[champ]] = (b[champ] as string) ?? '';
  const points = (b.pointsCles as string[]) ?? [];
  (['pointCle1', 'pointCle2', 'pointCle3'] as const).forEach((champ, i) => {
    ligne[P[champ]] = points[i] ?? '';
  });
  return ligne;
}

const sheet = (...lignes: string[][]) => [['groupes'], TITRES_SHEET, ...lignes];

describe('Conversion du Google Sheet', () => {
  it('redonne exactement les 38 bouchons actuels à partir de leurs lignes du Sheet', () => {
    const lignes = sheet(...bouchons.map(ligneDuSheet));
    const convertis = sheetVersBouchons(lignes, bouchons);
    // Les champs vides (undefined) disparaissent, comme dans le fichier JSON.
    expect(JSON.parse(JSON.stringify(convertis))).toEqual(bouchons);
  });

  it('garde les informations Google des bouchons déjà connus', () => {
    const [premier] = sheetVersBouchons(sheet(ligneDuSheet(bouchons[0])), bouchons);
    for (const champ of CHAMPS_GOOGLE) expect(premier[champ]).toEqual(bouchons[0][champ]);
  });

  it('prend le téléphone du Sheet, et celui de Google à défaut', () => {
    const ligne = ligneDuSheet(bouchons[0]);
    ligne[P.phone] = '04 72 00 00 00';
    expect(sheetVersBouchons(sheet(ligne), bouchons)[0].phone).toBe('04 72 00 00 00');
    ligne[P.phone] = '';
    expect(sheetVersBouchons(sheet(ligne), bouchons)[0].phone).toBe(bouchons[0].phone);
  });

  it('lit les 3 coups de cœur, en sautant les cellules vides', () => {
    const ligne = ligneDuSheet(bouchons[0]);
    ligne.splice(P.pointCle1, 3, 'Un', '', 'Trois');
    expect(sheetVersBouchons(sheet(ligne), bouchons)[0].pointsCles).toEqual(['Un', 'Trois']);
    expect(sheetVersBouchons(sheet(ligne.slice(0, P.pointCle1)), bouchons)[0].pointsCles).toEqual(
      []
    );
  });

  it('refuse une valeur du Sheet inconnue du référentiel, en la nommant', () => {
    const ligne = ligneDuSheet(bouchons[0]);
    ligne[P.portionSize] = '🐷🐷🐷🐷 Portions démesurées';
    expect(() => sheetVersBouchons(sheet(ligne), [])).toThrow(ValeurInconnueError);
    expect(() => sheetVersBouchons(sheet(ligne), [])).toThrow(/Portions démesurées/);
  });

  it('lit un prix « 32,50 € » et laisse vide un prix absent ou « - »', () => {
    const ligne = ligneDuSheet(bouchons[0]);
    ligne[P.menuPrice] = '32,50 €';
    expect(ligneVersBouchon(ligne).menuPrice).toBe(32.5);
    ligne[P.menuPrice] = '-';
    expect(ligneVersBouchon(ligne).menuPrice).toBeUndefined();
  });
});

describe('Colonnes du Sheet retrouvées par leur titre', () => {
  it('lit le bon champ même si des colonnes sont ajoutées, retirées ou déplacées', () => {
    const ligne = ligneDuSheet(bouchons[0]);
    // On ajoute une colonne inconnue en B et on inverse Description et Quartier.
    const titres = [...TITRES_SHEET];
    const autre = [...ligne];
    const [d, q] = [P.description, P.neighborhood];
    [titres[d], titres[q]] = [titres[q], titres[d]];
    [autre[d], autre[q]] = [autre[q], autre[d]];
    titres.splice(1, 0, 'Vérifié le');
    autre.splice(1, 0, '26/11/2026');
    const [lu] = sheetVersBouchons([['g'], titres, autre], bouchons);
    expect(JSON.parse(JSON.stringify(lu))).toEqual(bouchons[0]);
  });

  it("s'arrête avec un message clair si une colonne manque", () => {
    const titres = TITRES_SHEET.filter((t) => t !== 'Terrasse');
    expect(() => positionsDesColonnes(titres)).toThrow(/« terrasse »/);
  });

  it("s'arrête si deux colonnes ont le même titre", () => {
    expect(() => positionsDesColonnes([...TITRES_SHEET, 'Terrasse couverte'])).toThrow(
      /Plusieurs colonnes/
    );
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
