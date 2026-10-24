// Lecture et écriture de src/data/bouchons.json, et chargement du fichier
// .env (clés Google) pour les scripts de mise à jour.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { BouchonJson } from './conversion.ts';

export const FICHIER_BOUCHONS = new URL('../src/data/bouchons.json', import.meta.url);
const FICHIER_ENV = new URL('../.env', import.meta.url);

export function chargerEnv(): void {
  if (existsSync(FICHIER_ENV)) process.loadEnvFile(FICHIER_ENV);
}

export function lireBouchons(): BouchonJson[] {
  return JSON.parse(readFileSync(FICHIER_BOUCHONS, 'utf8'));
}

export function ecrireBouchons(bouchons: BouchonJson[]): void {
  writeFileSync(FICHIER_BOUCHONS, `${JSON.stringify(bouchons, null, 2)}\n`);
}
