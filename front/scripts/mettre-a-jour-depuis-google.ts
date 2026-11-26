// Étape 2 de la mise à jour : complète chaque bouchon avec Google Places
// (horaires, note, téléphone, adresse, code postal, commune).
// Lancement : npm run donnees:google (depuis le dossier front/)

import { enrichir } from './conversion.ts';
import { chargerEnv, ecrireBouchons, lireBouchons } from './donnees.ts';
import { detailsDuBouchon } from './google.ts';

chargerEnv();
const bouchons = lireBouchons();
const enrichis = [];
for (const bouchon of bouchons) {
  const details = await detailsDuBouchon(bouchon);
  if (!details) {
    throw new Error(`Aucune information Google Places trouvée pour : ${bouchon.name}`);
  }
  enrichis.push(enrichir(bouchon, details));
}
ecrireBouchons(enrichis);
console.log(`bouchons.json complété avec Google Places (${enrichis.length} bouchons).`);
