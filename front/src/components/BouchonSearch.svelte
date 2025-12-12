<script lang="ts">
import { onMount } from 'svelte';
import {
  getFilterOptions,
  searchBouchons as apiBouchonSearch,
  type BouchonData,
  type FilterOptions,
} from '../services/bouchonApi.ts';
import Sidebar from './search/Sidebar.svelte';
import Results from './search/Results.svelte';

// Add day/time filter state
let selectedDay: string = '';
let selectedTime: string = '';

let isMobile = false;

onMount(() => {
  isMobile =
    window.innerWidth <= 980 ||
    (window.innerHeight <= 500 && window.matchMedia('(orientation: landscape)').matches);
  window.addEventListener('resize', () => {
    isMobile =
      window.innerWidth <= 980 ||
      (window.innerHeight <= 500 && window.matchMedia('(orientation: landscape)').matches);
  });
});

let sidebarOpen = false;

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
let filterOptions: FilterOptions | null = null; // Options de filtres depuis l'API

// Pagination state
let currentPage = 1;
let totalPages = 1;
let totalItems = 0;

// Nouveaux filtres selon les critères de la Compagnie du Rognon
let selectedPrixMenuBase: string = '';
let selectedArrondissements: string[] = [];
let selectedQuartiers: string[] = [];
let selectedQuantite: string = '';
let selectedTypeMangeur: string = '';
let selectedTypeAmbiance: string = '';
let selectedTypeTablee: string = '';
let selectedTypeBouchon: string = '';
let optionVegetariens: boolean = false;
let optionMachon: boolean = false;
let decorationRemarquable: boolean = false;
let terrace: boolean = false;
let remarkableTeam: boolean = false;
let coupDeCoeurCompagnie: boolean = false;
let coupDeCoeurVins: boolean = false;
let labelBouchonsLyonnais: boolean = false;
let selectionAuthentiques: boolean = false;

// Variable réactive pour savoir si des filtres sont actifs
let hasActiveFilters = false;

$: hasActiveFilters = Boolean(
  selectedPrixMenuBase ||
    selectedArrondissements.length > 0 ||
    selectedQuartiers.length > 0 ||
    selectedQuantite ||
    selectedTypeMangeur ||
    selectedTypeAmbiance ||
    selectedTypeTablee ||
    selectedTypeBouchon ||
    optionVegetariens ||
    optionMachon ||
    decorationRemarquable ||
    terrace ||
    remarkableTeam ||
    coupDeCoeurCompagnie ||
    coupDeCoeurVins ||
    labelBouchonsLyonnais ||
    selectionAuthentiques ||
    selectedDay ||
    selectedTime
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
      return 'desc'; // Best ratings first (high to low)
    case 'prix':
      return 'asc'; // Lowest prices first (low to high)
    default:
      return 'desc';
  }
}

// Génère des options { value: number, label: string } pour le select prix
function getPriceLevelOptions(): { value: string; label: string }[] {
  return [
    { value: '', label: 'Tous les prix' },
    { value: '1', label: '€ (≤ 32 €)' },
    { value: '2', label: '€€ (32–38 €)' },
    { value: '3', label: '€€€ (> 38 €)' },
  ];
}

$: prixMenuBaseOptions = getPriceLevelOptions();
$: arrondissements = filterOptions ? ['', ...filterOptions.arrondissements] : [''];
$: quartiers = filterOptions ? ['', ...filterOptions.neighborhoods] : [''];
$: quantiteOptions = filterOptions ? ['', ...filterOptions.portionSizes] : [''];
$: typeMangeurOptions = filterOptions ? ['', ...filterOptions.eaterTypes] : [''];
$: typeAmbianceOptions = filterOptions ? ['', ...filterOptions.atmosphereTypes] : [''];
$: typeBouchonOptions = filterOptions ? ['', ...filterOptions.bouchonTypes] : [''];

let isLoading: boolean = true;
let apiError: string | null = null;

onMount(async () => {
  try {
    filterOptions = await getFilterOptions();
  } catch (error) {
    console.error('Failed to load filter options:', error);
  }
  await searchBouchons();
});

// Fonction de recherche via API
async function searchBouchons() {
  try {
    isLoading = true;
    apiError = null;

    // Démarrer le chronomètre pour le délai minimum
    const startTime = Date.now();

    // Construction des filtres à envoyer à l'API
    const filters: Record<string, string> = {};

    // Ajout des filtres uniquement s'ils sont définis
    if (selectedPrixMenuBase) filters.priceLevel = String(Number(selectedPrixMenuBase));
    if (selectedArrondissements.length > 0) filters.postalCode = selectedArrondissements.join(',');
    if (selectedQuartiers.length > 0) filters.neighborhood = selectedQuartiers.join(',');
    if (selectedQuantite) filters.portionSize = selectedQuantite;
    if (selectedTypeMangeur) filters.eaterType = selectedTypeMangeur;
    if (selectedTypeAmbiance) filters.atmosphereType = selectedTypeAmbiance;
    if (selectedTypeTablee) filters.tableType = selectedTypeTablee;
    if (selectedTypeBouchon) filters.bouchonType = selectedTypeBouchon;

    // Filtres booléens
    if (optionVegetariens) filters.vegetarianOption = 'true';
    if (optionMachon) filters.machonOption = 'true';
    if (decorationRemarquable) filters.remarkableDecoration = 'true';
    if (terrace) filters.terrace = 'true';
    if (remarkableTeam) filters.remarkableTeam = 'true';
    if (coupDeCoeurCompagnie) filters.compagnieFavorite = 'true';
    if (coupDeCoeurVins) filters.wineFavorite = 'true';
    if (labelBouchonsLyonnais) filters.bouchonLyonnaisLabel = 'true';
    if (selectionAuthentiques) filters.authenticSelection = 'true';

    // Filtres jour/heure
    if (selectedDay) filters.day = selectedDay;
    if (selectedTime) filters.time = selectedTime;

    // Sorting parameters
    const apiSortBy = sortBy === 'prix' ? 'price' : sortBy;
    filters.sortBy = apiSortBy;
    filters.sortOrder = sortOrder;

    const result = await apiBouchonSearch(filters, currentPage);
    bouchons = result.data;
    totalPages = result.pagination.totalPages;
    totalItems = result.pagination.totalItems;

    // Exclure les bouchons sans menuPrice si un filtre prix est actif
    if (selectedPrixMenuBase) {
      bouchons = bouchons.filter((b) => b.menuPrice !== null && b.menuPrice !== undefined);
    }

    // Assurer un délai minimum de 400ms pour que le loader soit visible
    const elapsedTime = Date.now() - startTime;
    const minLoadingTime = 400;
    if (elapsedTime < minLoadingTime) {
      await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsedTime));
    }
  } catch (error: unknown) {
    console.error('Failed to search bouchons:', error);
    apiError = error instanceof Error ? error.message : 'Une erreur est survenue';
    bouchons = [];
    totalPages = 1;
    totalItems = 0;
  } finally {
    isLoading = false;
  }
}

// Fonction pour appliquer les filtres (recherche seulement, le tri est fait par l'API)
async function applyFilters() {
  await searchBouchons();
}

// Réactivité : rechercher à chaque changement de critères, y compris jour/heure et tri
$: {
  const searchTriggers = [
    selectedPrixMenuBase,
    selectedArrondissements,
    selectedQuartiers,
    selectedQuantite,
    selectedTypeMangeur,
    selectedTypeAmbiance,
    selectedTypeTablee,
    selectedTypeBouchon,
    optionVegetariens,
    optionMachon,
    decorationRemarquable,
    terrace,
    remarkableTeam,
    coupDeCoeurCompagnie,
    sortBy,
    sortOrder,
    coupDeCoeurVins,
    labelBouchonsLyonnais,
    selectionAuthentiques,
    selectedDay,
    selectedTime,
  ];
  if (typeof window !== 'undefined') {
    currentPage = 1; // Reset to first page when filters change
    searchBouchons();
  }
}

function handlePageChange(event: CustomEvent<number>) {
  currentPage = event.detail;
  searchBouchons();
  scrollToTop();
}

function clearFilters() {
  currentPage = 1;
  selectedPrixMenuBase = '';
  selectedArrondissements = [];
  selectedQuartiers = [];
  selectedQuantite = '';
  selectedTypeMangeur = '';
  selectedTypeAmbiance = '';
  selectedTypeTablee = '';
  selectedTypeBouchon = '';
  optionVegetariens = false;
  optionMachon = false;
  decorationRemarquable = false;
  terrace = false;
  remarkableTeam = false;
  coupDeCoeurCompagnie = false;
  coupDeCoeurVins = false;
  labelBouchonsLyonnais = false;
  selectionAuthentiques = false;
  selectedDay = '';
  selectedTime = '';
}
</script>

<div class="search-layout">
  {#if sidebarOpen}
    <button
      type="button"
      class="sidebar-overlay"
      aria-label="Fermer les filtres"
      on:click={() => (sidebarOpen = false)}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          sidebarOpen = false;
        }
      }}
      tabindex="0"
    ></button>
  {/if}
  <div class="sidebar-wrapper">
    <Sidebar
      {isMobile}
      {sidebarOpen}
      {prixMenuBaseOptions}
    {arrondissements}
    {quartiers}
    {quantiteOptions}
    {typeMangeurOptions}
    {typeAmbianceOptions}
    {typeBouchonOptions}
    {hasActiveFilters}
    {isLoading}
    resultsCount={bouchons.length}
    totalResults={totalItems}
  bind:selectedPrixMenuBase
  bind:selectedArrondissements
  bind:selectedQuartiers
  bind:selectedQuantite
  bind:selectedTypeMangeur
  bind:selectedTypeAmbiance
  bind:selectedTypeBouchon
  bind:optionVegetariens
  bind:optionMachon
  bind:decorationRemarquable
  bind:terrace
  bind:remarkableTeam
  bind:coupDeCoeurCompagnie
  bind:coupDeCoeurVins
  bind:labelBouchonsLyonnais
  bind:selectionAuthentiques
  bind:selectedDay
  bind:selectedTime
    on:close={() => (sidebarOpen = false)}
    on:reset={clearFilters}
    />
  </div>

  <div class="floating-btns">
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

  <main class="main-content">
    <Results
      {bouchons}
      {isLoading}
      {apiError}
      {isMobile}
      bind:sortBy
      bind:sortOrder
      {getDefaultSortOrder}
      {applyFilters}
      {currentPage}
      {totalPages}
      {totalItems}
      on:openSidebar={() => (sidebarOpen = true)}
      on:pageChange={handlePageChange}
    />
  </main>
</div>

<style>
  .search-layout {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    position: relative;
  }
  .sidebar-wrapper {
    flex-shrink: 0;
    width: 340px;
  }
  .main-content {
    flex: 1;
    min-width: 0;
  }
  @media (max-width: 980px) {
    .sidebar-wrapper {
      width: 100%;
    }
    .main-content {
      padding-left: 0;
    }
    .search-layout {
      flex-direction: column;
      gap: 0;
    }
  }

  @media (max-height: 500px) and (orientation: landscape) {
    .sidebar-wrapper {
      width: 100%;
    }
    .main-content {
      padding-left: 0;
    }
    .search-layout {
      flex-direction: column;
      gap: 0;
    }
  }

  .sidebar-overlay {
    all: unset;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(34, 31, 32, 0.35);
    z-index: 200;
    transition: opacity 0.2s;
    cursor: pointer;
  }

  .arrow-emoji {
    font-size: 1.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    transition: filter 0.2s;
    padding: 10px;
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

  .scroll-top-btn {
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

  @media (max-width: 900px) {
    .floating-btns {
      right: 4vw;
      bottom: 4vw;
      gap: 0.9vw;
      flex-direction: column;
    }
    .scroll-top-btn {
      width: 50px;
      height: 50px;
    }
  }
</style>
