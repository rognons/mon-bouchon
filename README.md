# 🍽️ Mon Bouchon - Recherche de Bouchons Lyonnais

Le générateur de bouchons lyonnais de La Compagnie du Rognon : à partir d'une
phrase de recherche (« Je cherche un bouchon lyonnais qui a un menu à
30 € max, et qui se trouve à la Croix-Rousse »), il propose les bouchons testés
par la Compagnie qui correspondent, et ceux « à un critère près ».

Le vocabulaire du projet est dans [CONTEXT.md](CONTEXT.md), les décisions
importantes dans [docs/adr/](docs/adr/).

## 🚀 Démarrage rapide

```bash
cd front/
npm install
npm run dev
# ➡️ Site : http://localhost:4321
```

Avec Docker :

```bash
make up
# ➡️ Site : http://localhost:4321 (rechargement automatique)
```

## 🏗️ Architecture

Un site **statique**, sans API (voir [docs/adr/0002-site-sans-api.md](docs/adr/0002-site-sans-api.md)) :
la liste des bouchons est incluse dans la page au moment de la fabrication du
site, et toute la recherche se fait dans le navigateur.

```
mon-bouchon/
├── front/                       # 🎨 Le site (Astro + Svelte)
│   ├── src/
│   │   ├── data/
│   │   │   ├── bouchons.json    # Les bouchons (seule source de données)
│   │   │   ├── bouchons.ts      # Leur type et leur chargement
│   │   │   └── referentiel.ts   # Codes, textes du Google Sheet et libellés
│   │   ├── recherche/
│   │   │   ├── regles.ts        # Règles de recherche (testées)
│   │   │   └── phrase.ts        # Formulation de la phrase de recherche
│   │   ├── components/          # Composants Svelte
│   │   └── pages/               # Pages Astro
│   ├── scripts/                 # Mise à jour des données (Google Sheet, Google Places)
│   └── package.json
├── docs/adr/                    # Décisions importantes
├── CONTEXT.md                   # Lexique du projet
├── .github/workflows/           # 🔄 Contrôle qualité et mise en ligne
├── docker-compose.yml           # 🐳 Développement avec Docker
└── Makefile
```

**🚀 Technologies :** Astro, Svelte, TypeScript, Tailwind, Vitest (tests),
Biome (format et lint). Node 22.18 ou plus récent.

## 🔄 Mettre à jour les bouchons

Depuis `front/` (clés Google dans `front/.env`, voir [front/scripts/README.md](front/scripts/README.md)) :

```bash
npm run donnees:sheet    # 1. Google Sheet de la Compagnie
npm run donnees:google   # 2. Google Places (horaires, note, adresse)
npm run test             # 3. vérifier
```

Puis committer `front/src/data/bouchons.json` : le site est refabriqué et mis
en ligne avec les nouvelles données.

## 🛠️ Commandes (depuis `front/`)

```bash
npm run dev        # Serveur de développement
npm run build      # Fabrication du site
npm run test       # Tests des règles de recherche et des scripts
npm run quality    # Format, lint, types et tests (comme le contrôle qualité)
```

## 🚀 Mise en ligne

Le workflow GitHub Actions `build-deploy.yml`, après le contrôle qualité sur
`master` :

- ✅ construit l'image du site pour **linux/amd64** et **linux/arm64**
- ✅ la publie sur `europe-west1-docker.pkg.dev/rognons/docker/mon-bouchon_front:<sha-commit|latest>`
- ✅ relance le service sur le serveur (Coolify)

**Aucune commande manuelle n'est nécessaire pour le déploiement.**

## 🤝 Contribuer

1. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
2. Vérifiez avec `npm run quality` dans `front/`
3. Ouvrez une Pull Request vers `master` : le contrôle qualité s'y lance

---

🍷 **Fait avec ❤️ par La Compagnie du Rognon** 🍷
