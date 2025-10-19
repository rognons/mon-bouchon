# API Backend – Mon Bouchon

API REST pour la gestion et la recherche des bouchons lyonnais, basée sur
**Deno**.

## 🚀 Démarrage rapide

```bash
cd api/
deno run --allow-net --allow-read main.ts
# ➡️ API disponible sur http://localhost:8000
```

Ou avec les tasks Deno :

```bash
deno task dev      # Serveur de développement avec reload
deno task start    # Serveur de production
```

## 🏗️ Structure du dossier

```
api/
├── src/
│   ├── domain/           # Métier
│   │   ├── entities/     # Entités (Bouchon, SearchCriteria)
│   │   ├── ports/        # Interfaces (BouchonRepository)
│   │   └── services/     # Services métier
│   ├── application/      # Cas d'usage (usecases)
│   └── infrastructure/   # Adaptateurs techniques
│       ├── adapters/     # Contrôleurs HTTP
│       ├── repositories/ # Implémentation repository JSON
│       └── data/         # Données JSON (bouchons.json)
├── main.ts               # Point d'entrée API
├── main-hexa.ts          # Variante point d'entrée
├── deno.json             # Config Deno
└── Dockerfile            # Image API
```

## 📚 Endpoints disponibles

- `GET /bouchons` : liste tous les bouchons (filtres via query params)
- `GET /health` : status de l’API

Exemples :

```bash
curl http://localhost:8000/health
curl http://localhost:8000/bouchons
curl "http://localhost:8000/bouchons?district=1er&compagnieFavorite=true"
```

## 🛠️ Outils de développement

```bash
deno lint    # Linting
deno fmt     # Formatage
deno check   # Vérification du code
```

## 📦 Déploiement Docker

Voir la racine du projet et [DOCKER.md](../DOCKER.md) pour le déploiement
multi-architecture et la configuration Docker.

---

_Développé pour La Compagnie du Rognon_
