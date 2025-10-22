<script lang="ts">
import { onMount } from 'svelte';
let isMobile = false;

onMount(() => {
  isMobile = window.innerWidth <= 768;
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
  });
});

let sidebarOpen = false;

let sidebarFull = false;
let sidebarTop = 0;
let maxHeight = 0;

onMount(() => {
  const header = document.querySelector('.hero-header');
  const footer = document.querySelector('.main-footer');
  if (!header || !footer) return;

  function updateSidebarPosition() {
    // @ts-ignore
    const headerRect = header.getBoundingClientRect();
    sidebarTop = headerRect.bottom > 0 ? headerRect.bottom : 0;
    sidebarFull = headerRect.bottom <= 0;

    // @ts-ignore
    const footerRect = footer.getBoundingClientRect();
    const margin = 60;
    let available: number;
    // Si le footer est visible dans le viewport
    if (footerRect.top < window.innerHeight) {
      available = footerRect.top - sidebarTop - margin;
    } else {
      available = window.innerHeight - sidebarTop - margin;
    }
    // Appliquer strictement la hauteur max calculée
    maxHeight = Math.max(available, 0);
  }

  window.addEventListener('scroll', updateSidebarPosition);
  window.addEventListener('resize', updateSidebarPosition);
  updateSidebarPosition();

  return () => {
    window.removeEventListener('scroll', updateSidebarPosition);
    window.removeEventListener('resize', updateSidebarPosition);
  };
});
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

<div class="search-layout">
  {#if sidebarOpen}
    <div class="sidebar-overlay" on:click={() => (sidebarOpen = false)}></div>
  {/if}
  <!-- ...existing code... -->
  <!-- Sidebar à gauche -->
  <!-- Removed isolated script for isMobile -->
  <aside
    id="sidebar-debug"
    class="sidebar {sidebarFull ? 'sidebar-full' : ''}"
    style="position: fixed; top: {sidebarTop}px; max-height: {maxHeight}px !important; overflow-y: auto !important; left: 0; z-index: 100;"
    class:sidebar-mobile-open={sidebarOpen}
    inert={!sidebarOpen && isMobile}
  >
    {#if isMobile}
      <button
        class="sidebar-close-btn"
        on:click={() => (sidebarOpen = false)}
        aria-label="Fermer les filtres"
        style="position: absolute; top: 16px; right: 16px; z-index: 202; background: #f0c6da; color: #221f20; border: none; border-radius: 8px; padding: 10px 18px; font-size: 1.1rem; box-shadow: 0 2px 8px rgba(240,198,218,0.15);"
        >✖️</button
      >
    {/if}
    <div class="sidebar-filters">
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
        <label for="typeMangeur">👥 Type de clientèle</label>
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
      <!-- Options -->
      <div class="options-section">
        <div class="options-grid">
          <div class="checkbox-group">
            <label>
              <input type="checkbox" bind:checked={coupDeCoeurCompagnie} />
              ❤️ Coup de cœur Rognons
            </label>
          </div>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" bind:checked={optionVegetariens} />
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
              <input type="checkbox" bind:checked={optionMachon} />
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
              <input type="checkbox" bind:checked={decorationRemarquable} />
              🎨 Décoration authentique remarquable
            </label>
          </div>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" bind:checked={coupDeCoeurVins} />
              🍷 Excellente carte des vins
            </label>
          </div>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" bind:checked={labelBouchonsLyonnais} />
              🏆 Label officiel "Les Bouchons Lyonnais"
              <span class="tooltip-block">
                ℹ️
                <span class="tooltip-text">
                  Label créé en 2012 qui vise à sauvegarder et pérenniser la
                  tradition culinaire lyonnaise.
                </span>
              </span>
            </label>
          </div>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" bind:checked={selectionAuthentiques} />
              ⭐ Sélection "Authentiques Bouchons Lyonnais"
              <span class="tooltip-block">
                ℹ️
                <span class="tooltip-text">
                  Définie par “l'Association de Défense des Bouchons lyonnais”,
                  créée en 1992.
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </aside>

  <div class="floating-btns">
    {#if hasActiveFilters}
      <button
        class="clear-filters"
        on:click={clearFilters}
        title="Effacer tous les filtres"
      >
        <span
          class="broom-emoji"
          aria-label="Effacer les filtres"
          title="Effacer tous les filtres">🧹</span
        >
      </button>
    {/if}
    {#if showScrollTop}
      <button
        class="scroll-top-btn"
        on:click={scrollToTop}
        title="Remonter en haut"
      >
        <span
          class="arrow-emoji"
          aria-label="Remonter en haut"
          title="Remonter en haut">⬆️</span
        >
      </button>
    {/if}
  </div>

  <!-- Contenu principal à droite -->
  <main class="main-content">
    <!-- Résultats -->
    <div class="results-header">
      <h2>
        🍽️ {bouchons.length} bouchon{bouchons.length > 1 ? "s" : ""} trouvé{bouchons.length >
        1
          ? "s"
          : ""}
      </h2>

      {#if isMobile}
        <button
          class="show-advanced-filters-btn"
          on:click={() => (sidebarOpen = true)}
          aria-label="Afficher les filtres avancés"
          >🔍 Filtres
        </button>
      {/if}

      <div class="sort-control">
        <label for="sortBy">🎯 Trier par:</label>
        <select
          id="sortBy"
          bind:value={sortBy}
          on:change={() => {
            sortOrder = getDefaultSortOrder(sortBy);
            applyFilters();
          }}
        >
          <option value="rating">⭐ Note (Google)</option>
          <option value="prix">💰 Prix</option>
        </select>
        <button
          class="sort-order-btn"
          on:click={() => {
            sortOrder = sortOrder === "desc" ? "asc" : "desc";
            applyFilters();
          }}
          title={sortOrder === "desc"
            ? "Décroissant (clic pour croissant)"
            : "Croissant (clic pour décroissant)"}
        >
          {sortOrder === "desc" ? "⬇️" : "⬆️"}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    {#if isLoading}
      <div class="loading-state">
        <div class="loading-cochon">
          <img src="/favicon.ico" alt="Chargement..." class="spinning-cochon" />
        </div>
        <h3>On finit notre communard et on est avec vous...</h3>
      </div>
      <!-- Error state -->
    {:else if apiError}
      <div class="error-state">
        <h3>
          😔 Nous sommes en train de tester un nouveau bouchon, patience ! 🍽️
        </h3>
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
  </main>
</div>

<style>
  @media (max-width: 768px) {
    .sidebar-filters {
      gap: 0.5rem;
    }
    .filter-group {
      gap: 0.25rem;
      padding: 0.6rem;
      border-radius: 8px;
      border: 1px solid #f0c6da;
      box-shadow: 0 2px 8px rgba(240, 198, 218, 0.12);
    }
    .options-grid {
      grid-template-columns: 1fr;
      gap: 0.4rem;
      margin-top: 0.4rem;
    }
    .sidebar-close-btn {
      top: 10px;
      right: 10px;
      padding: 7px 12px;
      font-size: 1.2rem;
    }
  }

  .sidebar-overlay {
    display: none;
  }
  @media (max-width: 768px) {
    .sidebar-overlay {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(34, 31, 32, 0.35);
      z-index: 200;
      transition: opacity 0.2s;
    }
    .sidebar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      min-width: 0 !important;
      height: 100vh !important;
      max-height: 100vh !important;
      z-index: 201 !important;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 8px 0 32px rgba(240, 198, 218, 0.18);
      border-radius: 0 !important;
      margin: 0 !important;
      padding: 0.7rem 0.2rem 0.7rem 0.2rem !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      box-sizing: border-box !important;
    }
    .sidebar.sidebar-mobile-open {
      transform: translateX(0);
    }
    .sidebar-close-btn {
      display: block;
    }
  }
  @media (max-width: 768px) {
    .sidebar {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh !important;
      max-height: 100vh !important;
      z-index: 201 !important;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 32px rgba(240, 198, 218, 0.18);
      border-radius: 0 !important;
      margin: 0 !important;
      padding: 2rem 1rem !important;
      overflow-y: auto !important;
    }
    .sidebar.sidebar-mobile-open {
      transform: translateX(0);
    }
  }

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
    font-family: "Open Sans", Arial, sans-serif;
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
    box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
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

  @media (max-width: 900px) {
    .filter-group {
      padding: 0.7rem;
      font-size: 15px;
    }
    .filter-group label {
      font-size: 15px;
    }
    .filter-group select {
      font-size: 15px;
      padding: 0.6rem 0.8rem;
    }
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
    font-family: "Open Sans", Arial, sans-serif;
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
    font-family: "Open Sans", Arial, sans-serif;
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
    font-family: "Open Sans", Arial, sans-serif;
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
    margin: 0.5rem 0 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .results-header h2 {
    font-family: "GiltonRegular", "Playfair Display", serif;
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
    font-family: "Open Sans", sans-serif;
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

  .loading-state,
  .error-state {
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
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .loading-state h3 {
    color: #f0c6da;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-family: "GiltonRegular", serif;
  }

  .error-state {
    background: rgba(240, 198, 218, 0.1);
    border-color: rgba(240, 198, 218, 0.3);
  }

  .error-state h3 {
    color: #f0c6da;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-family: "GiltonRegular", serif;
  }

  .error-state p {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  /* Desktop large screens */
  @media (min-width: 1600px) {
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 2.5rem;
    }
  }

  /* Desktop standard screens */
  @media (min-width: 1200px) and (max-width: 1599px) {
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }
  }

  /* Tablets and medium screens */
  @media (max-width: 1199px) and (min-width: 981px) {
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  /* Medium screens */
  @media (max-width: 980px) and (min-width: 769px) {
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  /* Mobile */
  @media (max-width: 768px) {
    .results-grid {
      grid-template-columns: 1fr;
    }

    .results-header {
      margin-top: 1.5rem;
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .sort-control {
      align-self: center;
    }
  }

  .search-layout {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .show-advanced-filters-btn {
    background: #f0c6da;
    color: #221f20;
    border: none;
    border-radius: 8px;
    padding: 0.5em 1em;
    font-size: 1.1rem;
    box-shadow: 0 2px 8px rgba(240, 198, 218, 0.15);
    cursor: pointer;
    font-family: "GiltonRegular", serif;
  }

  .sidebar {
    min-width: 320px;
    max-width: 360px;
    background: #fff;
    border: 1px solid #f0c6da;
    border-radius: 12px;
    padding: 2rem 1.5rem;
    box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
    left: 0;
    overflow-y: auto;
    z-index: 100;
  }

  .sidebar.sidebar-full {
    top: 0 !important;
    max-height: 100vh !important;
  }

  .sidebar-filters {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .main-content {
    flex: 1;
    min-width: 0;
    padding-left: 360px;
  }

  @media (max-width: 980px) {
    .main-content {
      padding-left: 0;
    }
  }

  @media (max-width: 980px) {
    .search-layout {
      flex-direction: column;
      gap: 0;
    }
    .sidebar {
      position: static;
      width: 100%;
      max-width: 100%;
      margin-bottom: 2rem;
    }
  }
</style>
