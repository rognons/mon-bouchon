// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    tailwind({
      // Configuration Tailwind pour Svelte
      applyBaseStyles: false, // Evite les conflits avec les styles existants
    })
  ],
  // Une seule feuille de styles pour tout le site : sinon les styles des
  // composants affichés après coup (résultats, cartes, panneau) partent dans
  // un fichier que la page construite ne charge pas, et le site en ligne
  // s'affiche sans eux alors que `npm run dev` paraît normal.
  vite: { build: { cssCodeSplit: false } },
});
