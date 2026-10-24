<script lang="ts">
import { onMount } from 'svelte';
import { BOUCHONS } from '../data/bouchons';
import {
  AMBIANCES,
  type Ambiance,
  TYPES_BOUCHON,
  type TypeBouchon,
  type Valeur,
} from '../data/referentiel';
import {
  type Affinage,
  type Critere,
  passeAffinage,
  rechercher,
  type Tri,
  trier,
} from '../recherche/regles';
import PhraseDeRecherche from './search/PhraseDeRecherche.svelte';
import Sidebar from './search/Sidebar.svelte';
import Results from './search/Results.svelte';

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

// La phrase de recherche : le premier critère est le critère principal.
// biome-ignore lint/style/useConst: Bound to the search phrase
let criteres: Critere[] = [];

// L'affinage (la barre) : uniquement des critères absents de la phrase.
let selectedTypeAmbiance: string = '';
let selectedTypeBouchon: string = '';
let decorationRemarquable: boolean = false;
let terrace: boolean = false;
let remarkableTeam: boolean = false;
let coupDeCoeurCompagnie: boolean = false;
let coupDeCoeurVins: boolean = false;
let labelBouchonsLyonnais: boolean = false;
let selectionAuthentiques: boolean = false;

$: hasActiveFilters = Boolean(
  selectedTypeAmbiance ||
    selectedTypeBouchon ||
    decorationRemarquable ||
    terrace ||
    remarkableTeam ||
    coupDeCoeurCompagnie ||
    coupDeCoeurVins ||
    labelBouchonsLyonnais ||
    selectionAuthentiques
);

// Tri : par défaut, coups de cœur de la Compagnie d'abord, puis note Google
// biome-ignore lint/style/useConst: Used in reactive bindings
let tri: Tri = 'defaut';

// Options des listes (le premier élément est la valeur « aucun »)
const options = <Code extends string>(valeurs: Valeur<Code>[]) => [
  { value: '', label: '' },
  ...valeurs.map((v) => ({ value: v.code, label: v.libelle })),
];
const typeAmbianceOptions = options(AMBIANCES);
const typeBouchonOptions = options(TYPES_BOUCHON);

$: affinage = {
  terrasse: terrace,
  decorationRemarquable,
  equipeRemarquable: remarkableTeam,
  coupDeCoeurCompagnie,
  coupDeCoeurVins,
  labelBouchonsLyonnais,
  selectionAuthentiques,
  typesBouchon: selectedTypeBouchon ? [selectedTypeBouchon as TypeBouchon] : [],
  ambiances: selectedTypeAmbiance ? [selectedTypeAmbiance as Ambiance] : [],
} satisfies Affinage;

// Sans critère dans la phrase, tous les bouchons (affinés) sont des résultats.
$: resultats =
  criteres.length === 0
    ? {
        exacts: trier(
          BOUCHONS.filter((b) => passeAffinage(b, affinage)),
          tri
        ),
        aUnCriterePres: [],
      }
    : rechercher(
        BOUCHONS,
        { principal: criteres[0], complementaires: criteres.slice(1) },
        affinage,
        tri
      );

function clearFilters() {
  selectedTypeAmbiance = '';
  selectedTypeBouchon = '';
  decorationRemarquable = false;
  terrace = false;
  remarkableTeam = false;
  coupDeCoeurCompagnie = false;
  coupDeCoeurVins = false;
  labelBouchonsLyonnais = false;
  selectionAuthentiques = false;
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
      {typeAmbianceOptions}
      {typeBouchonOptions}
      {hasActiveFilters}
      resultsCount={resultats.exacts.length}
      bind:selectedTypeAmbiance
      bind:selectedTypeBouchon
      bind:decorationRemarquable
      bind:terrace
      bind:remarkableTeam
      bind:coupDeCoeurCompagnie
      bind:coupDeCoeurVins
      bind:labelBouchonsLyonnais
      bind:selectionAuthentiques
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
    <PhraseDeRecherche bind:criteres />
    <Results
      {resultats}
      {isMobile}
      bind:tri
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
