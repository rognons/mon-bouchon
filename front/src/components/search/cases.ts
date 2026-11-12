// Les cases avec légende (titre, légende courte et icône) des critères
// « Type de bouchon », « Ambiance » et « Profil de mangeur ».
// Icônes reprises de Lucide (licence ISC).
import { AMBIANCES, PROFILS_MANGEUR, TYPES_BOUCHON } from '../../data/referentiel';

// Une case : sa valeur, son titre, sa légende et les tracés de son icône
// (24 × 24, trait seul).
export interface Case {
  value: string | number;
  label: string;
  legende: string;
  icone: string[];
}

// Type de bouchon : légendes propres au site (le Google Sheet garde les siennes).
// Icônes : marmite, étincelles, cloche de service.
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

// « Calme & spacieux : un cadre tranquille… » → titre « Calme et spacieux »,
// légende « Un cadre tranquille… » (sans point final).
const avant = (libelle: string) => libelle.split(' : ')[0].replace(' & ', ' et ');
const apres = (libelle: string) => majuscule((libelle.split(' : ')[1] ?? '').replace(/[.]$/, ''));

// Ambiance. Icônes : fauteuil, verre de vin, groupe de personnes.
const ICONES_AMBIANCE: Record<string, string[]> = {
  calme: [
    'M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3',
    'M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z',
    'M5 18v2',
    'M19 18v2',
  ],
  convivial: [
    'M8 22h8',
    'M7 10h10',
    'M12 15v7',
    'M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z',
  ],
  anime: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
};

export const CASES_AMBIANCE: Case[] = AMBIANCES.map((a) => ({
  value: a.code,
  label: avant(a.libelle),
  legende: apres(a.libelle),
  icone: ICONES_AMBIANCE[a.code] ?? [],
}));

// Profil de mangeur. Icônes : boussole, couverts, flamme.
const ICONES_PROFIL: Record<string, string[]> = {
  decouvreur: [
    'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
    'm16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z',
  ],
  amateur: [
    'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2',
    'M7 2v20',
    'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
  ],
  puriste: [
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  ],
};

export const CASES_PROFIL: Case[] = PROFILS_MANGEUR.map((p) => ({
  value: p.code,
  label: majuscule((p.court ?? p.code).replace(/^un /, '')),
  legende: apres(p.libelle),
  icone: ICONES_PROFIL[p.code] ?? [],
}));
