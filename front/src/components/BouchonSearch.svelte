<script lang="ts">
import { onMount } from 'svelte';
import {
  getAllBouchons,
  searchBouchons as apiBouchonSearch,
  type BouchonData,
} from '../services/bouchonApi.ts';
import Sidebar from './search/Sidebar.svelte';
import Results from './search/Results.svelte';

// Helper: check if bouchon is open at given day/time
function isOpenAt(bouchon: any, day: string, time: string) {
  if (!day) return true; // No day filter
  if (!bouchon.openingHours || !Array.isArray(bouchon.openingHours)) return false;
  const d = parseInt(day, 10);
  if (!time) {
    // Only day selected: any slot for that day
    return bouchon.openingHours.some((slot: any) => slot.day === d);
  }
  // Both day and time selected
  const t = time.replace(':', '');
  return bouchon.openingHours.some((slot: any) => {
    return slot.day === d && slot.open <= t && t < slot.close;
  });
}

// Add day/time filter state
let selectedDay: string = '';
let selectedTime: string = '';

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
  window.addEventListener('load', updateSidebarPosition);
  // Correction: attendre un peu pour que le layout soit bien stable
  setTimeout(() => {
    updateSidebarPosition();
  }, 200);

  return () => {
    window.removeEventListener('scroll', updateSidebarPosition);
    window.removeEventListener('resize', updateSidebarPosition);
  };
});

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
      return 'desc'; // Meilleures notes d'abord
    case 'prix':
      return 'asc'; // Prix les plus bas d'abord
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
  const levels = Array.from(new Set(bouchons.map((b) => b.priceLevel).filter(Boolean)));
  levels.sort((a, b) => (a as number) - (b as number));
  return [
    { value: '', label: 'Tous les prix' },
    ...levels.map((l) => ({ value: String(l), label: '€'.repeat(Number(l)) })),
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

    // Construction des filtres à envoyer à l'API
    const filters: Record<string, string> = {};

    // Ajout des filtres uniquement s'ils sont définis
    if (selectedPrixMenuBase) filters.priceLevel = String(Number(selectedPrixMenuBase));
    if (selectedArrondissement) filters.postalCode = selectedArrondissement;
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
    // Exclure les bouchons sans priceLevel si un filtre prix est actif
    if (selectedPrixMenuBase) {
      bouchons = bouchons.filter((b) => b.priceLevel !== null && b.priceLevel !== undefined);
    }
    // Filter by day/time if day is set
    if (selectedDay) {
      bouchons = bouchons.filter((b) => isOpenAt(b, selectedDay, selectedTime));
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
        // Use priceLevel (number) for sorting by price
        const prixA = a.priceLevel ?? 0;
        const prixB = b.priceLevel ?? 0;
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
    selectedDay,
    selectedTime,
  ];
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
  <Sidebar
    {isMobile}
    {sidebarOpen}
    {sidebarFull}
    {sidebarTop}
    {maxHeight}
    {prixMenuBaseOptions}
    {arrondissements}
    {quartiers}
    {quantiteOptions}
    {typeMangeurOptions}
    {typeAmbianceOptions}
    {typeBouchonOptions}
  bind:selectedPrixMenuBase
  bind:selectedArrondissement
  bind:selectedQuartier
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
  />

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
</style>
