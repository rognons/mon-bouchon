<script lang="ts">
import { onMount } from 'svelte';
import {
  getAllBouchons,
  searchBouchons as apiBouchonSearch,
  type BouchonData,
} from '../services/bouchonApi.ts';
// biome-ignore lint/correctness/noUnusedImports: Used in template below
import BouchonCard from './BouchonCard.svelte';

let showScrollTop = false;

function scrollToTop() {
  const filters = document.getElementById('filters-panel');
  if (filters) {
    filters.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handleScroll() {
  showScrollTop = window.scrollY > 550;
}

onMount(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
  return () => window.removeEventListener('scroll', handleScroll);
});

let bouchons: BouchonData[] = []; // Résultats de l'API (toujours filtrés)

// Nouveaux filtres selon les critères de la Compagnie du Rognon
let selectedPrixMenuBase: string = '';
let selectedArrondissement: string = '';
let selectedQuartier: string = '';
let selectedOuvertures: string = '';
let selectedQuantite: string = '';
let selectedTypeMangeur: string = '';
let selectedTypeAmbiance: string = '';
let selectedTypeTablee: string = '';
let selectedTypeBouchon: string = '';
let optionVegetariens: boolean = false;
let optionMachon: boolean = false;
let decorationRemarquable: boolean = false;
let coupDeCoeurCompagnie: boolean = false;
let coupDeCoeurVins: boolean = false;
let labelBouchonsLyonnais: boolean = false;
let selectionAuthentiques: boolean = false;

// Variable réactive pour savoir si des filtres sont actifs
let hasActiveFilters = false;

$: hasActiveFilters = Boolean(
  selectedPrixMenuBase ||
    selectedArrondissement ||
    selectedQuartier ||
    selectedOuvertures ||
    selectedQuantite ||
    selectedTypeMangeur ||
    selectedTypeAmbiance ||
    selectedTypeTablee ||
    selectedTypeBouchon ||
    optionVegetariens ||
    optionMachon ||
    decorationRemarquable ||
    coupDeCoeurCompagnie ||
    coupDeCoeurVins ||
    labelBouchonsLyonnais ||
    selectionAuthentiques
);
// Variables de tri
// biome-ignore lint/style/useConst: Used in reactive bindings
let sortBy = 'rating'; // rating, prix
// biome-ignore lint/style/useConst: Modified by user interactions
let sortOrder = 'desc'; // asc ou desc

// Fonction pour définir l'ordre par défaut selon le critère
// biome-ignore lint/correctness/noUnusedVariables: Used in template event handlers
function getDefaultSortOrder(criteria: string): string {
  switch (criteria) {
    case 'rating':
      return 'desc'; // Meilleures notes d'abord
    case 'prix':
      return 'asc'; // Prix les plus bas d'abord
    default:
      return 'desc';
  }
}

// Options pour les filtres
// biome-ignore lint/correctness/noUnusedVariables: Used in template for select options
const prixMenuBaseOptions = ['', '15-20€', '20-25€', '25-30€', '30-35€', '35€+'];
// biome-ignore lint/correctness/noUnusedVariables: Used in template for select options
const arrondissements = ['', '1er', '2ème', '3ème', '4ème', '5ème', '6ème', '7ème', '8ème', '9ème'];
// biome-ignore lint/correctness/noUnusedVariables: Used in template for select options
const quartiers = [
  '',
  'Vieux Lyon',
  "Presqu'île",
  'Part-Dieu',
  'Bellecour',
  'Croix-Rousse',
  'Confluence',
];
// biome-ignore lint/correctness/noUnusedVariables: Used in template for select options
const ouverturesOptions = [
  '',
  'Midi uniquement',
  'Soir uniquement',
  'Midi et soir',
  'Toute la journée',
];
const quantiteOptions = [
  '',
  'Portions légères',
  'Portions équilibrées',
  'Portions généreuses',
  'Portions copieuses',
];
const typeMangeurOptions = [
  '',
  'Amateur de tradition',
  'Gourmets exigeants',
  'Familles',
  'Jeunes actifs',
  'Touristes',
];

const typeAmbianceOptions = [
  '',
  'Conviviale et familiale',
  'Raffinée et moderne',
  'Rustique et authentique',
  'Animée et festive',
  'Calme et intimiste',
];
const typeTableeOptions = [
  '',
  'Petites tables intimes',
  'Tables spacieuses',
  'Grandes tablées',
  'Bar et comptoir',
  'Terrasse',
];
const typeBouchonOptions = [
  '',
  'Traditionnel',
  'Gastronomique',
  'Populaire',
  'Moderne',
  'Authentique',
];

let isLoading: boolean = true;
let apiError: string | null = null;

onMount(() => {
  // Chargement initial avec critères vides (tous les bouchons)
  searchBouchons();
});

// Fonction de recherche via API
async function searchBouchons() {
  try {
    isLoading = true;
    apiError = null;

    // Construction des filtres à envoyer à l'API
    const filters: Record<string, string> = {};

    // Ajout des filtres uniquement s'ils sont définis
    if (selectedPrixMenuBase) filters.baseMenuPrice = selectedPrixMenuBase;
    if (selectedArrondissement) filters.district = selectedArrondissement;
    if (selectedQuartier) filters.neighborhood = selectedQuartier;
    if (selectedOuvertures) filters.openingHours = selectedOuvertures;
    if (selectedQuantite) filters.portionSize = selectedQuantite;
    if (selectedTypeMangeur) filters.eaterType = selectedTypeMangeur;
    if (selectedTypeAmbiance) filters.atmosphereType = selectedTypeAmbiance;
    if (selectedTypeTablee) filters.tableType = selectedTypeTablee;
    if (selectedTypeBouchon) filters.bouchonType = selectedTypeBouchon;

    // Filtres booléens
    if (optionVegetariens) filters.vegetarianOption = 'true';
    if (optionMachon) filters.machonOption = 'true';
    if (decorationRemarquable) filters.remarkableDecoration = 'true';
    if (coupDeCoeurCompagnie) filters.compagnieFavorite = 'true';
    if (coupDeCoeurVins) filters.wineFavorite = 'true';
    if (labelBouchonsLyonnais) filters.bouchonLyonnaisLabel = 'true';
    if (selectionAuthentiques) filters.authenticSelection = 'true';

    // Appel à l'API avec les filtres ou tous les bouchons si pas de filtres
    if (Object.keys(filters).length > 0) {
      bouchons = await apiBouchonSearch(filters);
    } else {
      bouchons = await getAllBouchons();
    }
  } catch (error: unknown) {
    console.error('Failed to search bouchons:', error);
    apiError = error instanceof Error ? error.message : 'Une erreur est survenue';
    bouchons = [];
  } finally {
    isLoading = false;
  }

  // Tri des résultats
  sortResults();
}

// Fonction de tri
function sortResults() {
  bouchons.sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case 'prix': {
        const prixA = extractPrixNumber(a.baseMenuPrice);
        const prixB = extractPrixNumber(b.baseMenuPrice);
        compareValue = prixA - prixB;
        break;
      }
      default:
        compareValue = a.rating - b.rating;
        break;
    }

    return sortOrder === 'desc' ? -compareValue : compareValue;
  });
}

// Fonction pour extraire le prix numérique
function extractPrixNumber(prix: string | undefined): number {
  if (!prix) return 0;
  const match = prix.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Fonction pour appliquer les filtres (recherche + tri)
async function applyFilters() {
  await searchBouchons();
  sortResults();
}

// Réactivité : rechercher à chaque changement de critères
$: {
  // Tous les critères qui doivent déclencher une nouvelle recherche
  const searchTriggers = [
    selectedPrixMenuBase,
    selectedArrondissement,
    selectedQuartier,
    selectedOuvertures,
    selectedQuantite,
    selectedTypeMangeur,
    selectedTypeAmbiance,
    selectedTypeTablee,
    selectedTypeBouchon,
    optionVegetariens,
    optionMachon,
    decorationRemarquable,
    coupDeCoeurCompagnie,
    coupDeCoeurVins,
    labelBouchonsLyonnais,
    selectionAuthentiques,
  ];

  // Déclencher recherche seulement après le mount initial
  if (typeof window !== 'undefined') {
    searchBouchons();
  }
}

function clearFilters() {
  selectedPrixMenuBase = '';
  selectedArrondissement = '';
  selectedQuartier = '';
  selectedOuvertures = '';
  selectedQuantite = '';
  selectedTypeMangeur = '';
  selectedTypeAmbiance = '';
  selectedTypeTablee = '';
  selectedTypeBouchon = '';
  optionVegetariens = false;
  optionMachon = false;
  decorationRemarquable = false;
  coupDeCoeurCompagnie = false;
  coupDeCoeurVins = false;
  labelBouchonsLyonnais = false;
  selectionAuthentiques = false;
}
</script>

<div class="search-container">
  <!-- Tous les filtres affichés en permanence, même ordre desktop/mobile -->
  <div class="filters-panel" id="filters-panel">
    <div class="filters-header">
      <div class="floating-btns">
        {#if hasActiveFilters}
          <button class="clear-filters" on:click={clearFilters} title="Effacer tous les filtres">
            <span class="broom-emoji" aria-label="Effacer les filtres" title="Effacer tous les filtres">🧹</span>
          </button>
        {/if}
        {#if showScrollTop}
          <button class="scroll-top-btn" on:click={scrollToTop} title="Remonter en haut">
            <span class="arrow-emoji" aria-label="Remonter en haut" title="Remonter en haut">⬆️</span>
          </button>
        {/if}
      </div>
    </div>
    <div class="filters-grid">
      <!-- Prix du menu de base -->
      <div class="filter-group">
        <label for="prixMenuBase">💰 Prix du menu de base</label>
        <select id="prixMenuBase" bind:value={selectedPrixMenuBase}>
          <option value="">Tous les prix</option>
          {#each prixMenuBaseOptions.slice(1) as prix}
            <option value={prix}>{prix}</option>
          {/each}
        </select>
      </div>

      <!-- Arrondissement -->
      <div class="filter-group">
        <label for="arrondissement">📍 Arrondissement</label>
        <select id="arrondissement" bind:value={selectedArrondissement}>
          <option value="">Tous les arrondissements</option>
          {#each arrondissements.slice(1) as arr}
            <option value={arr}>{arr} arrondissement</option>
          {/each}
        </select>
      </div>

      <!-- Quartier -->
      <div class="filter-group">
        <label for="quartier">🏘️ Quartier</label>
        <select id="quartier" bind:value={selectedQuartier}>
          <option value="">Tous les quartiers</option>
          {#each quartiers.slice(1) as quartier}
            <option value={quartier}>{quartier}</option>
          {/each}
        </select>
      </div>

      <!-- Ouvertures -->
      <div class="filter-group">
        <label for="ouvertures">🕐 Horaires d'ouverture</label>
        <select id="ouvertures" bind:value={selectedOuvertures}>
          <option value="">Tous les créneaux</option>
          {#each ouverturesOptions.slice(1) as ouverture}
            <option value={ouverture}>{ouverture}</option>
          {/each}
        </select>
      </div>

      <!-- Quantité -->
      <div class="filter-group">
        <label for="quantite">🍽️ Taille des portions</label>
        <select id="quantite" bind:value={selectedQuantite}>
          <option value="">Toutes les portions</option>
          {#each quantiteOptions.slice(1) as quantite}
            <option value={quantite}>{quantite}</option>
          {/each}
        </select>
      </div>

      <!-- Type de mangeur -->
      <div class="filter-group">
        <label for="typeMangeur">� Type de clientèle</label>
        <select id="typeMangeur" bind:value={selectedTypeMangeur}>
          <option value="">Toute clientèle</option>
          {#each typeMangeurOptions.slice(1) as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </div>

      <!-- Type d'ambiance -->
      <div class="filter-group">
        <label for="typeAmbiance">🎭 Ambiance & confort</label>
        <select id="typeAmbiance" bind:value={selectedTypeAmbiance}>
          <option value="">Toutes les ambiances</option>
          {#each typeAmbianceOptions.slice(1) as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </div>

      <!-- Type de tablée -->
      <div class="filter-group">
        <label for="typeTablee">🪑 Configuration des tables</label>
        <select id="typeTablee" bind:value={selectedTypeTablee}>
          <option value="">Toutes les configurations</option>
          {#each typeTableeOptions.slice(1) as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </div>

      <!-- Type de bouchons -->
      <div class="filter-group">
        <label for="typeBouchon">🏪 Style de bouchon</label>
        <select id="typeBouchon" bind:value={selectedTypeBouchon}>
          <option value="">Tous les styles</option>
          {#each typeBouchonOptions.slice(1) as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Options toujours visibles -->
    <div class="options-section">
      <div class="options-grid">
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={coupDeCoeurCompagnie}>
            ❤️ Coup de cœur Rognons
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={optionVegetariens}>
              🥬 Option végétarienne
              <span class="tooltip-block">
                ℹ️
                <span class="tooltip-text">
                  Au moins 1 entrée et 1 plat végétariens présents à la carte.
                </span>
              </span>
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={optionMachon}>
              🍳 Mâchon
              <span class="tooltip-block">
                ℹ️
                <span class="tooltip-text">
                  Repas lyonnais matinal et copieux.
                </span>
              </span>
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={decorationRemarquable}>
            🎨 Décoration authentique remarquable
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={coupDeCoeurVins}>
            🍷 Excellente carte des vins
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={labelBouchonsLyonnais}>
            🏆 Label officiel "Les Bouchons Lyonnais"
            <span class="tooltip-block">
              ℹ️
              <span class="tooltip-text">
                Label créé en 2012 qui vise à sauvegarder et pérenniser la tradition culinaire lyonnaise.
              </span>
            </span>
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={selectionAuthentiques}>
            ⭐ Sélection "Authentiques Bouchons Lyonnais"
            <span class="tooltip-block">
              ℹ️
              <span class="tooltip-text">
                Définie par “l'Association de Défense des Bouchons lyonnais”, créée en 1992.
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>

  <!-- Résultats -->
  <div class="results-header">
    <h2>🍽️ {bouchons.length} bouchon{bouchons.length > 1 ? 's' : ''} trouvé{bouchons.length > 1 ? 's' : ''}</h2>
    <div class="sort-control">
      <label for="sortBy">🎯 Trier par:</label>
      <select id="sortBy" bind:value={sortBy} on:change={() => { sortOrder = getDefaultSortOrder(sortBy); applyFilters(); }}>
        <option value="rating">⭐ Note (Google)</option>
        <option value="prix">💰 Prix</option>
      </select>
      <button 
        class="sort-order-btn" 
        on:click={() => { sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'; applyFilters(); }}
        title={sortOrder === 'desc' ? 'Décroissant (clic pour croissant)' : 'Croissant (clic pour décroissant)'}
      >
        {sortOrder === 'desc' ? '⬇️' : '⬆️'}
      </button>
    </div>
  </div>

  <!-- Loading state -->
  {#if isLoading}
    <div class="loading-state">
      <div class="loading-cochon">
        <img src="/favicon.ico" alt="Chargement..." class="spinning-cochon">
      </div>
      <h3>On finit notre communard et on est avec vous...</h3>
    </div>
  <!-- Error state -->
  {:else if apiError}
    <div class="error-state">
      <h3>😔 Nous sommes en train de tester un nouveau bouchon, patience ! 🍽️</h3>
      <p>Rafraîchissez la page si l'erreur persiste.</p>
    </div>
  <!-- Results -->
  {:else}
    <div class="results-grid">
      {#each bouchons as bouchon (bouchon.id)}
        <BouchonCard {bouchon} />
      {/each}
    </div>

    {#if bouchons.length === 0 && !isLoading && !apiError}
      <div class="no-results">
        <h3>😞 Aïe, on n'a pas encore trouvé de bouchon comme celui-ci</h3>
        <p>Mais dites-nous et on le teste !</p>
      </div>
    {/if}
  {/if}
</div>

<style>

.floating-btns {
  position: fixed;
  right: 2vw;
  bottom: 2vw;
  z-index: 101;
  display: flex;
  flex-direction: column;
  gap: 0.5vw;
}

.scroll-top-btn,
  .clear-filters {
  width: 55px;
  height: 55px;
  background: linear-gradient(135deg, #f0c6da 60%, #e4b3cc 100%);
  border: 1px solid #e4b3cc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    transform 0.2s,
    background 0.2s,
    border-color 0.2s;
  overflow: hidden;
}

.arrow-emoji,
  .broom-emoji {
  font-size: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: filter 0.2s;
  padding: 10px;
}

.scroll-top-btn:hover,
.clear-filters:hover {
  background: linear-gradient(135deg, #e4b3cc 60%, #f0c6da 100%);
  transform: scale(1.12);
}

@media (max-width: 900px) {
  .floating-btns {
    right: 4vw;
    bottom: 4vw;
    gap: 0.9vw;
    flex-direction: column;
  }
  .scroll-top-btn,
  .clear-filters {
    width: 50px;
    height: 50px;
  }
}

:global(body) {
  background-color: #fff;
  font-family: 'Open Sans', Arial, sans-serif;
  color: #221f20;
  font-weight: 400;
}

/* Tooltip pour Authentiques Bouchons Lyonnais */
.tooltip-block {
  position: relative;
  cursor: help;
  display: inline-block;
}

.tooltip-block .tooltip-text {
  visibility: hidden;
  width: 320px;
  background: #f0c6da;
  color: #221f20;
  text-align: left;
  border-radius: 8px;
  padding: 0.8em 1em;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 16px rgba(240,198,218,0.15);
  font-size: 0.95em;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.tooltip-block:hover .tooltip-text,
.tooltip-block:focus .tooltip-text {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}

.search-container {
  background-color: #fff;
  padding: 2rem 0;
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
}
  
.filters-panel {
  background: #ffffff;
  border: 1px solid #f0c6da;
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem 0;
  box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
  animation: slideDown 0.3s ease-out;
}

.filters-header {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 1rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: #ffffff;
    padding: 1.25rem;
    border-radius: 10px;
    border: 2px solid #f0c6da;
    box-shadow: 0 4px 12px rgba(240, 198, 218, 0.2);
    transition: all 0.3s ease;
  }

  .filter-group:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(240, 198, 218, 0.3);
    border-color: #e8b5d1;
  }

  .filter-group label {
    font-family: 'Open Sans', Arial, sans-serif;
    font-weight: 600;
    color: #221f20;
    font-size: 14px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }



  .filter-group select {
    padding: 0.75rem 1rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 14px;
    background: #ffffff;
    color: #221f20;
    cursor: pointer;
    font-family: 'Open Sans', Arial, sans-serif;
    font-weight: 400;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .filter-group select:focus {
    outline: none;
    border-color: #f0c6da;
    box-shadow: 0 0 0 3px rgba(240, 198, 218, 0.2);
  }

  .filter-group select:hover {
    border-color: #f0c6da;
    box-shadow: 0 2px 6px rgba(240, 198, 218, 0.2);
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .checkbox-group {
    margin-bottom: 0.5rem;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Open Sans', Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #221f20;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 6px;
    background: #ffffff;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .checkbox-group label:hover {
    background: rgba(240, 198, 218, 0.1);
    border-color: rgba(240, 198, 218, 0.3);
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #f0c6da;
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #f0c6da;
  }



  .results-header {
    margin: 2rem 0 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .results-header h2 {
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    color: #221f20;
    font-size: 26px;
    font-weight: normal;
    margin: 0;
    line-height: 1em;
  }

  .sort-control {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 14px;
    background: white;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    border: 1px solid #f0c6da;
    box-shadow: 0 2px 4px rgba(240, 198, 218, 0.1);
  }
  .sort-control label {
    color: #221f20;
    font-weight: 500;
    font-family: 'Open Sans', sans-serif;
  }

  .sort-control select {
    padding: 0.4rem 0.8rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s ease;
    min-width: 120px;
  }

  .sort-control select:focus {
    outline: none;
    border-color: #f0c6da;
  }

  .sort-order-btn {
    background: #f0c6da;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }

  .sort-order-btn:hover {
    background: #e4b3cc;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2rem;
  }

  .no-results {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  .no-results h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .loading-state, .error-state {
    text-align: center;
    padding: 3rem;
    background: rgba(240, 198, 218, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(240, 198, 218, 0.3);
    margin: 2rem 0;
  }

  .loading-cochon {
    margin-bottom: 1.5rem;
  }

  .spinning-cochon {
    width: 48px;
    height: 48px;
    animation: spin 2s linear infinite;
    filter: drop-shadow(0 2px 8px rgba(240, 198, 218, 0.4));
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-state h3 {
    color: #f0c6da;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-family: 'GiltonRegular', serif;
  }

  .error-state {
    background: rgba(240, 198, 218, 0.1);
    border-color: rgba(240, 198, 218, 0.3);
  }

  .error-state h3 {
    color: #f0c6da;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-family: 'GiltonRegular', serif;
  }

  .error-state p {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  /* Desktop large screens */
  @media (min-width: 1600px) {
    .search-container {
      max-width: 1600px;
      padding: 3rem 0;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 2.5rem;
    }
    .filters-grid {
      grid-template-columns: repeat(3, 1fr);
    }

  }

  /* Desktop standard screens */
  @media (min-width: 1200px) and (max-width: 1599px) {
    .search-container {
      max-width: 1400px;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }
    .filters-grid {
      grid-template-columns: repeat(3, 1fr);
    }

  }

  /* Tablets and medium screens */
  @media (max-width: 1199px) and (min-width: 981px) {
    .search-container {
      max-width: 900px;
      padding: 2rem 0;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

  }

  /* Medium screens */
  @media (max-width: 980px) and (min-width: 769px) {
    .search-container {
      max-width: 900px;
      padding: 1rem 0;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  /* Mobile */
  @media (max-width: 768px) {
    .search-container {
      padding: 1rem 0;
      max-width: 100%;
      margin: 0;
    }

    .filters-grid {
      grid-template-columns: 1fr;
    }
    .results-grid {
      grid-template-columns: 1fr;
    }

    .results-header {
      flex-direction: column;
      text-align: center;
      gap: 1.5rem;
    }

    .sort-control {
      align-self: center;
    }
  }
</style>