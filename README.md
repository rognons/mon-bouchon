# 🍽️ Bouchons Lyonnais - Application de Recherche

Une application web moderne construite avec **Astro** et **Svelte** pour rechercher et découvrir les meilleurs bouchons traditionnels de Lyon selon des critères personnalisés.

## ✨ Fonctionnalités

- 🔍 **Recherche textuelle** : Recherchez par nom de bouchon, spécialités ou description
- 📍 **Filtrage par arrondissement** : Trouvez des bouchons dans votre quartier préféré
- 💰 **Sélection par prix** : Filtrez selon votre budget (€, €€, €€€)
- 🍷 **Type de cuisine** : Traditionnel, Gastronomique, ou Populaire
- ⭐ **Note minimum** : Sélectionnez uniquement les mieux notés
- 📱 **Design responsive** : Interface optimisée mobile et desktop
- 🎨 **Interface moderne** : Design élégant avec animations fluides

## 🏗️ Technologies utilisées

- **[Astro](https://astro.build/)** - Framework web moderne
- **[Svelte](https://svelte.dev/)** - Framework JavaScript réactif
- **CSS3** - Styles personnalisés avec gradients et animations
- **JSON** - Base de données locale des bouchons

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Instructions

1. **Clonez le projet**
   ```bash
   git clone <url-du-repo>
   cd mon-rognon
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Lancez le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrez votre navigateur**
   ```
   http://localhost:4321
   ```

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
