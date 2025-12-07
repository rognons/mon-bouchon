<script lang="ts">
import { onMount } from 'svelte';
import {
  getAllBouchons,
  searchBouchons as apiBouchonSearch,
  type BouchonData,
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
let allBouchons: BouchonData[] = []; // Toutes les données, pour options de filtres

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

// Options dynamiques pour les filtres, générées à partir de toutes les données (allBouchons)
function uniqueOptions(arr: (string | undefined)[]): string[] {
  return ['', ...Array.from(new Set(arr.filter(Boolean) as string[]))];
}

// Génère des options { value: number, label: string } pour le select prix
function getPriceLevelOptions(bouchons: BouchonData[]): { value: string; label: string }[] {
  return [
    { value: '', label: 'Tous les prix' },
    { value: '1', label: '€ (≤ 32 €)' },
    { value: '2', label: '€€ (32–38 €)' },
    { value: '3', label: '€€€ (> 38 €)' },
  ];
}

$: prixMenuBaseOptions = getPriceLevelOptions(allBouchons);
$: arrondissements = [
  '',
  '69001',
  '69002',
  '69003',
  '69004',
  '69005',
  '69006',
  '69007',
  '69008',
  '69009',
];
$: quartiers = uniqueOptions(allBouchons.map((b) => b.neighborhood));
$: quantiteOptions = uniqueOptions(allBouchons.map((b) => b.portionSize));
$: typeMangeurOptions = uniqueOptions(allBouchons.map((b) => b.eaterType));
$: typeAmbianceOptions = uniqueOptions(allBouchons.map((b) => b.atmosphereType));
$: typeBouchonOptions = uniqueOptions(allBouchons.map((b) => b.bouchonType));

let isLoading: boolean = true;
let apiError: string | null = null;

onMount(async () => {
  allBouchons = await getAllBouchons();
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
    if (coupDeCoeurCompagnie) filters.compagnieFavorite = 'true';
    if (coupDeCoeurVins) filters.wineFavorite = 'true';
    if (labelBouchonsLyonnais) filters.bouchonLyonnaisLabel = 'true';
    if (selectionAuthentiques) filters.authenticSelection = 'true';

    // Filtres jour/heure
    if (selectedDay) filters.day = selectedDay;
    if (selectedTime) filters.time = selectedTime;

    // Appel à l'API avec les filtres ou tous les bouchons si pas de filtres
    if (Object.keys(filters).length > 0) {
      bouchons = await apiBouchonSearch(filters);
    } else {
      bouchons = await getAllBouchons();
    }
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
        // Use menuPrice for sorting by price
        const prixA = a.menuPrice;
        const prixB = b.menuPrice;

        // Place items with unknown prices at the end
        if (prixA == null && prixB == null) return 0;
        if (prixA == null) return 1; // a goes to the end
        if (prixB == null) return -1; // b goes to the end

        compareValue = prixA - prixB;
        break;
      }
      default: {
        // Handle undefined/null ratings gracefully
        const ratingA = typeof a.rating === 'number' ? a.rating : 0;
        const ratingB = typeof b.rating === 'number' ? b.rating : 0;
        compareValue = ratingA - ratingB;
        break;
      }
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

// Réactivité : rechercher à chaque changement de critères, y compris jour/heure
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
    coupDeCoeurCompagnie,
    coupDeCoeurVins,
    labelBouchonsLyonnais,
    selectionAuthentiques,
    selectedDay,
    selectedTime,
  ];
  if (typeof window !== 'undefined') {
    searchBouchons();
  }
}

function clearFilters() {
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
      on:openSidebar={() => (sidebarOpen = true)}
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
