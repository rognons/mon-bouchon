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
nouvelle valeur dans le référentiel. Même chose pour un bouchon hors de Lyon
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
