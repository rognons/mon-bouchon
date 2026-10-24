// Étape 2 de la mise à jour : complète chaque bouchon avec Google Places
// (horaires, note, téléphone, adresse, code postal, commune).
// Lancement : npm run donnees:google (depuis le dossier front/)

import { QUARTIERS } from '../src/data/referentiel.ts';
import { enrichir } from './conversion.ts';
import { chargerEnv, ecrireBouchons, lireBouchons } from './donnees.ts';
import { detailsGoogle } from './google.ts';

chargerEnv();
const bouchons = lireBouchons();
const enrichis = [];
for (const bouchon of bouchons) {
  // Recherche par nom et quartier, puis par nom seul, puis par lien Maps.
  const quartier = QUARTIERS.find((q) => q.code === bouchon.neighborhood)?.libelle;
  const recherches = [
    quartier ? `${bouchon.name}, ${quartier}, Lyon` : null,
    `${bouchon.name}, Lyon`,
    typeof bouchon.mapsUrl === 'string' && bouchon.mapsUrl.trim() ? bouchon.mapsUrl : null,
  ].filter((r): r is string => r !== null);

  let details = null;
  for (const recherche of recherches) {
    details = await detailsGoogle(recherche);
    if (details) break;
  }
  if (!details?.opening_hours) {
    throw new Error(`Aucune information Google Places trouvée pour : ${bouchon.name}`);
  }
  enrichis.push(enrichir(bouchon, details));
}
ecrireBouchons(enrichis);
console.log(`bouchons.json complété avec Google Places (${enrichis.length} bouchons).`);
