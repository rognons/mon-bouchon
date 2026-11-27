# Mettre à jour les bouchons

`src/data/bouchons.json` est la seule source de données du site. Il se met à
jour en deux temps, depuis le dossier `front/` :

```bash
npm run donnees:sheet    # 1. relit le Google Sheet de la Compagnie
npm run donnees:google   # 2. complète avec Google Places (horaires, note, adresse)
npm run test             # 3. vérifie que les données restent valides
```

Toujours le Sheet d'abord, puis Google. Le script du Sheet garde les
informations Google déjà connues de chaque bouchon : on peut le relancer seul
après une simple correction de texte.

Les textes des listes (profil de mangeur, portions, ambiance, type de bouchon,
quartier) doivent être écrits dans le Sheet exactement comme dans
`src/data/referentiel.ts`. Un texte inconnu arrête le script avec la liste
des cellules à corriger : il faut alors corriger le Sheet, ou ajouter la
nouvelle valeur dans le référentiel.

Les colonnes du Sheet sont retrouvées par leur titre (2e ligne), pas par leur
lettre : on peut ajouter, supprimer ou déplacer une colonne sans rien casser,
du moment que le nom du bouchon reste en colonne A et que les titres utiles
gardent leur mot-clé (liste `COLONNES` dans `scripts/conversion.ts`). Si une
colonne utile manque ou si deux colonnes se ressemblent, le script s'arrête
avant de toucher aux données et dit laquelle. Même chose pour un bouchon hors de Lyon
dans une commune pas encore connue (`COMMUNES`).

## Clés Google

Les scripts lisent un fichier `front/.env` (jamais envoyé sur GitHub) :

```
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SHEETS_SHEET_NAME=...
GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON={"client_email":"...","private_key":"...","token_uri":"https://oauth2.googleapis.com/token"}
GOOGLE_MAPS_API_KEY=...   (clé avec « Places API (New) » activée)
```

Ce sont les mêmes variables que pour les anciens scripts Deno de `api/`.

Node 22.18 ou plus récent est nécessaire (les scripts sont en TypeScript et
Node les lit directement).

## Vérification mensuelle

Le 1er de chaque mois, GitHub lance `npm run donnees:verifier`
(`.github/workflows/verification-mensuelle.yml`) :

- Google Places : horaires, adresse, note et statut (fermé temporairement ou
  définitivement) de chaque bouchon ; `bouchons.json` est mis à jour si besoin ;
- liens du menu, de la réservation et de l'article : repère les liens cassés.

Le rapport arrive dans un ticket GitHub (onglet « Issues »), et la mise à jour
des données dans une pull request à accepter. En janvier, avril, juillet et
octobre, le rapport ajoute la liste des prix à revérifier à la main (colonne
« Vérifié le » du Sheet).

On peut aussi la lancer sur son ordinateur : `npm run donnees:verifier`, puis
lire `front/rapport-verification.md`. Seule la clé `GOOGLE_MAPS_API_KEY` est
utile ; sans elle, seuls les liens sont vérifiés.
