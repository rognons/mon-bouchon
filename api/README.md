# API Backend - Mon Bouchon

API REST pour la gestion des données des bouchons lyonnais.

## 🚧 En développement

Cette partie de l'application est prévue pour contenir :

### Endpoints prévus

- `GET /api/bouchons` - Liste des bouchons
- `GET /api/bouchons/:id` - Détails d'un bouchon
- `POST /api/bouchons` - Création (admin)
- `PUT /api/bouchons/:id` - Modification (admin)
- `DELETE /api/bouchons/:id` - Suppression (admin)
- `GET /api/search` - Recherche avec filtres

### Technologies envisagées

- **Backend** : Node.js + Express ou Python + FastAPI
- **Base de données** : PostgreSQL ou MongoDB
- **Authentification** : JWT pour les admins
- **Validation** : Joi ou Zod pour les schémas
- **Documentation** : Swagger/OpenAPI

### Structure prévue

```
api/
├── src/
│   ├── routes/         # Routes API
│   ├── models/         # Modèles de données
│   ├── middleware/     # Middlewares (auth, validation)
│   ├── controllers/    # Logique métier
│   └── utils/          # Utilitaires
├── tests/              # Tests unitaires et d'intégration
├── docs/               # Documentation API
└── scripts/            # Scripts de migration/seed
```

## 🔄 Migration des données

Les données actuelles dans `/front/src/data/bouchons.json` seront migrées vers
la base de données lors de la mise en place de l'API.

## 🚀 Développement futur

1. Choisir la stack technique
2. Configurer la base de données
3. Migrer les données JSON
4. Implémenter les endpoints CRUD
5. Ajouter l'authentification admin
6. Connecter l'interface publique à l'API

---

_À développer pour La Compagnie du Rognon_
