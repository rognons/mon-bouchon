// Les cases du critère « Type de bouchon » : titre, légende courte et icône.
// Légendes propres au site (le Google Sheet garde ses formulations).
// Icônes reprises de Lucide (licence ISC) : marmite, étincelles, cloche de service.
import { TYPES_BOUCHON } from '../../data/referentiel';

// Une case : sa valeur, son titre, sa légende et les tracés de son icône
// (24 × 24, trait seul).
export interface Case {
  value: string | number;
  label: string;
  legende: string;
  icone: string[];
}

const LEGENDES: Record<string, string> = {
  traditionnel: 'Resté dans son jus, 100\u00a0% authentique',
  moderne: 'Perpétue la tradition en la renouvelant',
  bourgeois: 'Gastronomique, hommage aux bouchons',
};

const ICONES: Record<string, string[]> = {
  traditionnel: [
    'M2 12h20',
    'M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8',
    'm4 8 16-4',
    'm8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8',
  ],
  moderne: [
    'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z',
    'M20 3v4',
    'M22 5h-4',
    'M4 17v2',
    'M5 18H3',
  ],
  bourgeois: [
    'M3 20a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1Z',
    'M20 16a8 8 0 1 0-16 0',
    'M12 4v4',
    'M10 4h4',
  ],
};

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

export const CASES_TYPE_BOUCHON: Case[] = TYPES_BOUCHON.map((t) => ({
  value: t.code,
  label: majuscule(t.court ?? t.code),
  legende: LEGENDES[t.code] ?? '',
  icone: ICONES[t.code] ?? [],
}));
