# 🍽️ Mon Bouchon - Recherche de Bouchons Lyonnais

Application complète pour découvrir les authentiques bouchons lyonnais de La Compagnie du Rognon.

## 🚀 Démarrage rapide

### 🐳 Avec Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone <repo-url>
cd mon-bouchon

# 2. Démarrer avec Docker
make up
# ➡️ Démarre tous les services en local avec hot reloading (développement)
# ➡️ Front: http://localhost:4321
# ➡️ API: http://localhost:8000
```

### 🔄 CI/CD Automatique

- **Quality Check**: Automatique sur chaque Pull Request
- **Build & Deploy**: Images multi-architecture publiées sur `europe-west1-docker.pkg.dev/rognons/docker/` à chaque push master
- **Registry**: Google Artifact Registry (europe-west1)
- **Multi-platform**: Support Intel (linux/amd64) et ARM (linux/arm64) pour compatibilité maximale

## 🏗️ Architecture du projet

Ce projet suit une **architecture modulaire** avec séparation claire entre l'interface utilisateur et l'API backend.

## 📁 Structure du projet

```
mon-bouchon/
├── front/                    # 🎨 Front (Astro + Svelte)
│   ├── src/
│   │   ├── components/       # Composants Svelte
│   │   ├── pages/           # Pages Astro
│   │   └── services/        # Intégration API
│   ├── biome.json          # Configuration qualité code
│   └── package.json        # Dépendances et scripts
├── api/                    # 🦕 Backend (Deno)
│   ├── src/
│   │   ├── domain/         # Entités métier
│   │   ├── application/    # Cas d'usage
│   │   └── infrastructure/ # Adaptateurs techniques
│   ├── deno.json          # Configuration Deno
│   └── main.ts            # Point d'entrée API
├── .github/workflows/     # 🔄 CI/CD automation
├── docker-compose.yml     # 🐳 Configuration Docker
├── Makefile              # 📋 Commandes développement
└── DOCKER.md             # 📖 Documentation Docker
```

### 📱 `/front/` - Interface Web (Astro + Svelte)

Application web moderne pour la recherche et découverte des bouchons lyonnais.

**🚀 Technologies :**
- **Astro ^5.14.6** - Framework web moderne
- **Svelte** - Composants réactifs 
- **TypeScript** - Typage fort
- **CSS moderne** - Design system authentique

**✨ Fonctionnalités :**
- 🔍 **Recherche avancée** par critères multiples (prix, arrondissement, quartier, type de mangeur, ambiance...)
- ❤️ **Coups de cœur** de la Compagnie du Rognon et sélection vins
- ⭐ **Tri intelligent** par note, prix, nom, localisation
- 🏷️ **Labels authentiques** (Bouchons Lyonnais, sélection Authentiques)
- 📱 **Responsive design** (desktop, tablette, mobile)
- 🎨 **Design authentique** avec police GiltonRegular et couleurs signature

**🛠️ Développement :**
```bash
cd front/
npm install
npm run dev  # Démarre sur http://localhost:4321
```

### 🔧 `/api/` - API Backend (Deno)

API REST pour la gestion et la recherche des bouchons lyonnais.

**🚀 Technologies :**
- **Deno** - Runtime JavaScript moderne

**🏗️ Structure :**
```
src/
├── domain/           # 🏛️ Cœur métier
│   ├── entities/     # Entités (Bouchon, SearchCriteria)
│   ├── ports/        # Interfaces (BouchonRepository)
│   └── services/     # Services métier (BouchonDomainService)
├── application/      # 🎯 Cas d'usage
│   └── usecases/     # Use Cases (SearchBouchonsUseCase)
└── infrastructure/   # ⚙️ Adaptateurs techniques
    ├── adapters/     # Controllers HTTP
    ├── repositories/ # Implémentation repository JSON
    └── data/         # Données JSON (bouchons.json)
```

**📋 API Endpoints :**
- `GET /bouchons` - Liste tous les bouchons (avec filtres optionnels via query params)
- `GET /health` - Status de l'API

**🛠️ Développement :**
```bash
cd api/
deno run --allow-net --allow-read main.ts  # Démarre sur http://localhost:8000
```

**🔧 Outils de développement :**
```bash
deno lint    # Linting du code
deno fmt     # Formatage automatique
deno check   # Vérification TypeScript
```

## 🚀 Démarrage rapide

### 📋 Prérequis
- **Node.js** (version 18+) - pour l'interface web
- **Deno** (version 1.40+) - pour l'API backend
- **npm** ou **yarn** - gestionnaire de paquets

### ⚡ Installation

1. **Clonez le repository**
   ```bash
   git clone <url-du-repo>
   cd mon-bouchon
   ```

2. **Lancez l'interface web**
   ```bash
   cd front/
   npm install
   npm run dev
   # ➡️ Interface disponible sur http://localhost:4321
   ```

3. **Lancez l'API (dans un autre terminal)**
   ```bash
   cd api/
   deno task dev
   # ➡️ API disponible sur http://localhost:8000
   ```

4. **Testez l'API**
   ```bash
   # Status de l'API
   curl http://localhost:8000/health
   
   # Liste tous les bouchons
   curl http://localhost:8000/bouchons
   
   # Recherche avec filtres
   curl "http://localhost:8000/bouchons?district=1er&compagnieFavorite=true"
   ```

## 🐳 Déploiement Docker (Recommandé)

### 🚀 Démarrage rapide avec Docker
```bash
make up  
# ➡️ Front: http://localhost:4321
# ➡️ API: http://localhost:8000

# Voir les logs
make logs

# Arrêter les services
make down
```

### 🛠️ Commandes Docker disponibles
```bash
make help       # Afficher l'aide
make build      # Construire les images
make up         # Démarrer l'environnement local avec hot reload pour le développement
make down       # Arrêter les services
make logs       # Voir les logs
make clean      # Nettoyer tout
make dev        # Infos développement local
```

### 🚀 Release et Déploiement

Le déploiement des images Docker se fait automatiquement via le workflow GitHub Actions (`build-deploy.yml`) :

- ✅ À chaque push sur la branche `master`, les images sont construites pour **linux/amd64** et **linux/arm64**
- ✅ Les tags sont générés automatiquement (**SHA du commit** + **latest**)
- ✅ Les images sont poussées vers **Google Artifact Registry**
- ✅ Compatible avec tous les environnements (Intel, Apple Silicon, serveurs)


**Aucune commande manuelle n'est nécessaire pour le déploiement.**


Les images générées sont disponibles ici :
- `europe-west1-docker.pkg.dev/rognons/docker/mon-bouchon_api:<commit|latest>`
- `europe-west1-docker.pkg.dev/rognons/docker/mon-bouchon_front:<commit|latest>`

> `<commit>` correspond au SHA (7 premiers) du commit Git prefixé par `sha-` généré automatiquement par le workflow `build-deploy.yml`.

### 📋 Configuration Docker
- **Front**: Astro app (Node.js Alpine)
- **API**: Deno application avec health checks
- **Network**: Réseau Docker interne pour communication
- **Volumes**: Données montées en lecture seule

Voir [DOCKER.md](DOCKER.md) pour plus de détails.

## �📊 Exemples d'utilisation API

### Filtres disponibles
```bash
# Par arrondissement
GET /bouchons?district=1er

# Par prix
GET /bouchons?baseMenuPrice=25-30€

# Coups de cœur seulement
GET /bouchons?compagnieFavorite=true

# Options végétariennes
GET /bouchons?vegetarianOption=true

# Tri par note décroissant
GET /bouchons?sortBy=rating&sortOrder=desc

# Combinaison de filtres
GET /bouchons?district=2ème&minRating=4.5&sortBy=price&sortOrder=asc
```

## 🛠️ Commandes de développement

### Interface Web (Astro)
```bash
cd front/
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run preview    # Prévisualisation du build
npm run astro ...  # CLI Astro
```

### API (Deno)
```bash
cd api/
deno task dev      # Serveur de développement avec reload automatique
deno task start    # Démarrer l'API
deno task lint     # Linter le code
deno task fmt      # Formatter le code
deno task check    # Vérification TypeScript
```

## 🏛️ Architecture & Principes

### 🎯 Domain-Driven Design
- **Entités métier** : `Bouchon`, `SearchCriteria` avec logique métier encapsulée
- **Services métier** : `BouchonDomainService` pour les règles de filtrage et tri
- **Value Objects** : Types forts pour éviter les erreurs (ex: `BouchonId`, `Address`)



### 🌍 Code Multilingue
- **Code source** en anglais pour la lisibilité internationale
- **Termes métier** en français préservés (`bouchon`, `compagnieFavorite`)
- **API bilingue** : Support des paramètres français ET anglais

## � Contribuer

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changes (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

---

🍷 **Fait avec ❤️ par La Compagnie du Rognon** 🍷
