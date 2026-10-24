// Étape 1 de la mise à jour : relit le Google Sheet de la Compagnie et
// réécrit src/data/bouchons.json (en gardant les infos Google déjà connues).
// Lancement : npm run donnees:sheet (depuis le dossier front/)

import { sheetVersBouchons } from './conversion.ts';
import { chargerEnv, ecrireBouchons, lireBouchons } from './donnees.ts';
import { lignesDuSheet } from './google.ts';

chargerEnv();
const bouchons = sheetVersBouchons(await lignesDuSheet(), lireBouchons());
ecrireBouchons(bouchons);
console.log(`bouchons.json mis à jour depuis le Google Sheet (${bouchons.length} bouchons).`);
