# Proposition : Mon Bouchon, version 2026

Branche `version-2026`, partie de `master` au commit 162d098.
Rien n'est encore envoyé sur GitHub ni mis en ligne : cette page sert à
relire la proposition avant d'en décider.

## En bref

1. **Une nouvelle façon de chercher** : une phrase de recherche (« Je cherche
   un bouchon lyonnais qui a un menu à moins de 32 €, et qui se trouve dans
   le 1er »), avec un critère principal jamais relâché, jusqu'à trois
   critères complémentaires, et une section « À un critère près » quand il y
   a peu de résultats. La barre latérale ne sert plus qu'à affiner.
   → [docs/adr/0001-phrase-de-recherche.md](adr/0001-phrase-de-recherche.md)
2. **Plus d'API** : les 38 bouchons sont inclus dans la page à la
   fabrication du site, et la recherche se fait dans le navigateur. Le site
   reste hébergé comme aujourd'hui (image Docker, Coolify, Cloudflare) ;
   seule l'image de l'API disparaît.
   → [docs/adr/0002-site-sans-api.md](adr/0002-site-sans-api.md)
3. **Des règles testées** : 44 tests (Vitest), et le contrôle qualité échoue
   désormais si un test échoue.

Le vocabulaire du projet est dans [CONTEXT.md](../CONTEXT.md).

## Ce qui change, en détail

| Partie | Avant | Après |
| --- | --- | --- |
| Recherche | Filtres libres, tous éliminatoires, côté API | Phrase de recherche + affinage, dans le navigateur (`front/src/recherche/regles.ts`) |
| Données | `api/src/infrastructure/data/bouchons.json`, textes longs avec émojis | `front/src/data/bouchons.json`, codes courts (`puriste`, `genereuses`…), identifiant stable, commune |
| Référentiel | — | `front/src/data/referentiel.ts` : code ↔ texte du Google Sheet ↔ libellé |
| Prix | Tranche exacte (33–38 € cachait les moins chers) | Budget maximum : moins de 32 €, moins de 38 € |
| Profil, portions | Correspondance exacte | Cascade : un puriste voit aussi les bouchons pour amateurs ; « au moins généreuses » montre aussi les gargantuesques |
| Horaires | Jour + heure précise | Jour + service (mâchon, midi, soir) |
| Hors de Lyon | Demander 69100 renvoyait une erreur 400 | Villeurbanne et Les Chères sont des valeurs du lieu |
| Tri | Note Google | Coups de cœur de la Compagnie d'abord (par défaut), note Google ou prix |
| Pages de résultats | 6 par page (côté API) | Tous les résultats d'un coup |
| Visibilité Google | Page vide, remplie par l'API | Les 38 bouchons sont dans le HTML |
| Scripts de données | Deno, dans `api/` | Node, dans `front/scripts/` (`npm run donnees:sheet`, `npm run donnees:google`) |
| Tests | Aucun, et un échec était ignoré | 44 tests, bloquants |
| Node | 20 (fin de vie) | 22 |

Corrections au passage : l'identifiant des bouchons était tiré au hasard à
chaque démarrage de l'API ; « Réinitialiser » laissait cochées les
distinctions et les options.

## À vérifier de ton côté (non testable ici)

Docker n'est pas installé sur l'ordinateur où la version a été construite :
la chaîne de mise en ligne a été relue, pas exécutée.

- **Coolify** : les services Kamehouse et Peluca référencent sans doute
  encore le service `api` et l'image `mon-bouchon_api`. Il faut les aligner
  sur le nouveau `docker-compose.deploy.yml` (service `front` seul).
- **Cloudflare** : `cloudflare-worker.js` route encore `api.mon-bouchon.fr`.
  Le site ne l'appelle plus ; l'entrée peut être retirée quand l'API sera
  arrêtée (le fichier n'a pas été modifié).
- **Images Docker** : l'image du site passe à `node:22-alpine` pour la
  fabrication. À essayer avec `docker build front`.
- **Scripts de données** : réécrits sur Node mais **pas lancés contre les
  vraies API Google** (pas de clés sur cet ordinateur). Un test reconstruit
  les 38 bouchons actuels à partir de leurs lignes du Sheet, mais un premier
  lancement réel est à faire : `front/scripts/README.md`.
- **Page GitHub du projet** : le lien `mon-bouchon.rognons.fr` ne répond pas.

## Choix provisoires, à confirmer

- **Mâchon** : les données disent si un bouchon sert le mâchon, pas quels
  jours. Règle provisoire : il le sert les jours où il est ouvert.
- **Midi / soir** : midi = ouvert entre 12 h et 14 h ; soir = ouvert entre
  19 h 30 et 21 h 30.
- **« À un critère près »** s'affiche quand il y a moins de 3 résultats exacts.

## Données que la Compagnie doit compléter

- les 4 prix manquants ;
- les jours de mâchon de chaque bouchon.

## Pas dans cette version

- L'UX/UI : la phrase de recherche est fonctionnelle mais sobre ; la mise en
  forme soignée et les libellés (« puriste canaille » vers « j'aime tout »,
  « Sélection Authentiques ») viendront dans un second temps, avec la charte.
- Le critère « plat » (« ce qu'il aime dans l'assiette »).
- La recherche par vraie date, avec les fermetures exceptionnelles.

## Essayer en local

```bash
git switch version-2026
cd front
npm install
npm run dev        # http://localhost:4321
npm run quality    # format, lint, types et tests
```
