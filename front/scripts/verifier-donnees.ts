// Vérification mensuelle des bouchons (lancée par GitHub chaque mois, ou à la
// main avec : npm run donnees:verifier, depuis le dossier front/).
//
// 1. Redemande à Google Places les horaires, l'adresse, la note et le statut
//    (ouvert, fermé temporairement, fermé définitivement) de chaque bouchon,
//    et met à jour src/data/bouchons.json si quelque chose a changé.
// 2. Ouvre chaque lien (menu, réservation, article) pour repérer ceux qui
//    sont cassés.
// 3. Écrit un rapport lisible dans rapport-verification.md (dans front/).
//    Tous les trois mois (janvier, avril, juillet, octobre), le rapport
//    ajoute la liste des prix à revérifier à la main.
//
// Le script ne s'arrête pas sur un problème : il le note dans le rapport.

import { writeFileSync } from 'node:fs';
import { type BouchonJson, enrichir } from './conversion.ts';
import { chargerEnv, ecrireBouchons, lireBouchons } from './donnees.ts';
import { detailsDuBouchon } from './google.ts';

const FICHIER_RAPPORT = new URL('../rapport-verification.md', import.meta.url);
const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const LIENS = [
  ['menuUrl', 'Lien du menu'],
  ['bookingUrl', 'Lien de réservation'],
  ['articleUrl', "Lien de l'article"],
] as const;

type Horaire = { day: number; open: string | null; close: string | null };

// « mar. 12:00–14:00, 19:00–22:00 ; mer. … » pour comparer et afficher.
function horairesLisibles(horaires: unknown): string {
  if (!Array.isArray(horaires) || horaires.length === 0) return 'aucun horaire';
  const h = (t: string | null) => (t ? `${t.slice(0, 2)}:${t.slice(2)}` : '?');
  const parJour = new Map<number, string[]>();
  for (const { day, open, close } of horaires as Horaire[]) {
    parJour.set(day, [...(parJour.get(day) ?? []), `${h(open)}–${h(close)}`]);
  }
  return [1, 2, 3, 4, 5, 6, 0]
    .filter((jour) => parJour.has(jour))
    .map((jour) => `${JOURS[jour]} ${parJour.get(jour)?.join(', ')}`)
    .join(' ; ');
}

// Résultat de l'ouverture d'un lien : null si tout va bien.
async function problemeDeLien(url: string): Promise<string | null> {
  try {
    const reponse = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      headers: {
        // Certains sites refusent les visiteurs qui ne ressemblent pas à un navigateur.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    });
    await reponse.body?.cancel();
    if (reponse.status === 404 || reponse.status === 410) return `page introuvable (${reponse.status})`;
    // 401, 403, 429… : souvent une protection contre les robots, pas un lien cassé.
    if (reponse.status >= 500) return `le site répond en erreur (${reponse.status}), à revoir`;
    if (reponse.status >= 400) return `le site refuse la visite automatique (${reponse.status}), à vérifier à la main`;
    return null;
  } catch (erreur) {
    const cause = (erreur as { cause?: { code?: string } }).cause?.code;
    if (cause === 'ENOTFOUND') return "le site n'existe plus (adresse inconnue)";
    if ((erreur as Error).name === 'TimeoutError') return 'le site ne répond pas (délai dépassé)';
    return `le site ne répond pas (${cause ?? (erreur as Error).message})`;
  }
}

chargerEnv();
const bouchons = lireBouchons();
const avecGoogle = Boolean(process.env.GOOGLE_MAPS_API_KEY);
const alertes: string[] = []; // fermetures, bouchons introuvables
const changements: string[] = []; // horaires, adresse modifiés
const notes: string[] = []; // notes Google modifiées
const liens: string[] = []; // liens à revoir
const misAJour: BouchonJson[] = [];

for (const bouchon of bouchons) {
  let nouveau = bouchon;
  if (avecGoogle) {
    const details = await detailsDuBouchon(bouchon).catch((e: Error) => {
      alertes.push(`**${bouchon.name}** : erreur en interrogeant Google (${e.message}).`);
      return undefined;
    });
    if (details === null) {
      alertes.push(`**${bouchon.name}** : Google ne trouve plus ce restaurant.`);
    } else if (details) {
      if (details.business_status === 'CLOSED_PERMANENTLY')
        alertes.push(`**${bouchon.name}** : Google l'indique **fermé définitivement**.`);
      if (details.business_status === 'CLOSED_TEMPORARILY')
        alertes.push(`**${bouchon.name}** : Google l'indique **fermé temporairement**.`);
      nouveau = enrichir(bouchon, details);
      const avant = horairesLisibles(bouchon.openingHours);
      const apres = horairesLisibles(nouveau.openingHours);
      if (avant !== apres)
        changements.push(`**${bouchon.name}** : horaires\n  - avant : ${avant}\n  - après : ${apres}`);
      if (bouchon.address !== nouveau.address)
        changements.push(
          `**${bouchon.name}** : adresse « ${bouchon.address} » → « ${nouveau.address} »`
        );
      if (bouchon.rating !== nouveau.rating)
        notes.push(`${bouchon.name} (${bouchon.rating ?? '–'} → ${nouveau.rating ?? '–'})`);
    }
  }
  misAJour.push(nouveau);

  for (const [champ, libelle] of LIENS) {
    const url = bouchon[champ];
    if (typeof url !== 'string' || !url.trim()) continue;
    const probleme = await problemeDeLien(url);
    if (probleme) liens.push(`**${bouchon.name}** : ${libelle} — ${probleme}\n  ${url}`);
  }
}

const donneesModifiees = JSON.stringify(misAJour) !== JSON.stringify(bouchons);
if (donneesModifiees) ecrireBouchons(misAJour);

// Le rapport, en Markdown (il devient le texte du ticket GitHub).
const liste = (lignes: string[]) => lignes.map((l) => `- ${l}`).join('\n');
const mois = new Date().getMonth() + 1;
const rappelPrix = process.env.RAPPEL_PRIX === 'oui' || [1, 4, 7, 10].includes(mois);
const parties = [
  `Vérification automatique de ${bouchons.length} bouchons.`,
  avecGoogle
    ? ''
    : '> ⚠️ Pas de clé Google (GOOGLE_MAPS_API_KEY) : seuls les liens ont été vérifiés.',
  '## 🚨 Fermetures et bouchons introuvables',
  alertes.length ? liste(alertes) : 'Rien à signaler.',
  '## 🕒 Horaires ou adresse modifiés sur Google',
  changements.length ? liste(changements) : 'Rien à signaler.',
  '## 🔗 Liens à revoir dans le Google Sheet',
  liens.length
    ? `${liste(liens)}\n\nCorrigez le lien dans le Sheet, puis lancez \`npm run donnees:sheet\`.`
    : 'Tous les liens fonctionnent.',
];
if (notes.length) parties.push('## ⭐ Notes Google mises à jour', notes.join(', '));
if (donneesModifiees)
  parties.push(
    '## ✅ Ce qu’il reste à faire',
    'Une mise à jour du site avec ces nouvelles informations Google vous attend dans l’onglet **Pull requests** : ouvrez-la et cliquez sur **Merge pull request** pour l’accepter.'
  );
if (rappelPrix)
  parties.push(
    '## 💶 Rappel trimestriel : vérifier les prix',
    'Les prix ne peuvent pas être vérifiés automatiquement. Ouvrez chaque menu, comparez avec le prix du Sheet, corrigez si besoin et notez la date dans la colonne « Vérifié le ».',
    bouchons
      .map((b) => {
        const prix = typeof b.menuPrice === 'number' ? `${b.menuPrice} €` : 'prix non communiqué';
        const menu = typeof b.menuUrl === 'string' && b.menuUrl ? ` — [menu](${b.menuUrl})` : ' — pas de lien menu';
        return `- [ ] ${b.name} : ${prix}${menu}`;
      })
      .join('\n')
  );
writeFileSync(FICHIER_RAPPORT, `${parties.filter(Boolean).join('\n\n')}\n`);

console.log(
  `Vérification terminée : ${alertes.length} alerte(s), ${changements.length} changement(s), ${liens.length} lien(s) à revoir.`
);
console.log(donneesModifiees ? 'bouchons.json mis à jour.' : 'bouchons.json inchangé.');
console.log('Rapport écrit dans rapport-verification.md');
