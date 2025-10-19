# Interface Publique - Mon Bouchon

Interface web pour la recherche de bouchons lyonnais développée avec Astro et Svelte.


## 🚀 Démarrage rapide

```bash
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:4321`

## 📁 Structure

```
src/
├── components/          # Composants Svelte et Astro
│   ├── Header.astro    # En-tête avec statistiques
│   ├── Footer.astro    # Pied de page
│   ├── BouchonSearch.svelte  # Interface de recherche
│   └── BouchonCard.svelte    # Carte d'affichage des bouchons
├── data/
│   └── bouchons.json   # Base de données JSON des bouchons
├── pages/
│   └── index.astro     # Page principale
└── layouts/            # Layouts Astro (si nécessaire)

public/
├── favicon.ico         # Favicon (logo cochon)
├── fonts/             # Police GiltonRegular
└── logo-compagnie-nom.png  # Logo Compagnie du Rognon
```

## 🎨 Design System

### Couleurs
- **Rose signature** : `#f0c6da` (couleur principale)
- **Texte principal** : `#221f20` (noir authentique)  
- **Arrière-plan** : `#fff` (blanc)

### Typographie
- **Titres** : GiltonRegular (police officielle)
- **Texte** : Open Sans (lisibilité)

## 🔧 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Aperçu du build |

## 📱 Responsive Design

- **Desktop** : Grille optimisée, headers compacts
- **Tablette** : Adaptation des colonnes et espacements  
- **Mobile** : Layout single-column, coups de cœur inline

## ✨ Fonctionnalités

### Filtres de base (toujours visibles)
- Prix du menu de base
- Arrondissement 
- Quartier
- Horaires d'ouverture
- Options (végétarien, mâchon, décoration, coup de cœur)

### Filtres avancés (pliables)
- **Critères d'expérience** : portions, clientèle, ambiance, tables, style
- **Distinctions** : carte des vins, labels officiels, sélections

### Tri et affichage
- Tri par défaut, note, prix, nom, arrondissement, coups de cœur
- Ordre croissant/décroissant avec emojis intuitifs
- Cartes uniformes avec headers de hauteur fixe

## 🏷️ Système de coups de cœur

Les bouchons recommandés par la Compagnie du Rognon affichent :
- Logo cochon miniature
- Emoji cœur ❤️
- Badge avec effet glow animé
- Tri prioritaire disponible

## 🔄 Déploiement

Le build génère un site statique dans `/dist/` prêt pour :
- Netlify
- Vercel  
- GitHub Pages
- Tout hébergeur de sites statiques

---

*Développé pour La Compagnie du Rognon*