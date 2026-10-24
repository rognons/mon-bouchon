<script lang="ts">
import { onMount } from 'svelte';
import { BOUCHONS } from '../data/bouchons';
import {
  AMBIANCES,
  ARRONDISSEMENTS_LYON,
  COMMUNES,
  PORTIONS,
  PROFILS_MANGEUR,
  QUARTIERS,
  TYPES_BOUCHON,
  type Ambiance,
  type Portions,
  type ProfilMangeur,
  type Quartier,
  type TypeBouchon,
  type Valeur,
} from '../data/referentiel';
import {
  type Affinage,
  type Critere,
  evaluer,
  type PalierDePrix,
  passeAffinage,
  type Service,
  type Tri,
  trier,
} from '../recherche/regles';
import Sidebar from './search/Sidebar.svelte';
import Results from './search/Results.svelte';

// Jour et service
let selectedDay: string = '';
let selectedService: string = '';

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

// Critères choisis dans la barre (codes du référentiel ; '' = aucun)
let selectedPrixMenuBase: string = '';
let selectedArrondissements: string[] = [];
let selectedQuartiers: string[] = [];
let selectedQuantite: string = '';
let selectedTypeMangeur: string = '';
let selectedTypeAmbiance: string = '';
let selectedTypeBouchon: string = '';
let optionVegetariens: boolean = false;
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
    selectedTypeBouchon ||
    optionVegetariens ||
    decorationRemarquable ||
    terrace ||
    remarkableTeam ||
    coupDeCoeurCompagnie ||
    coupDeCoeurVins ||
    labelBouchonsLyonnais ||
    selectionAuthentiques ||
    selectedDay
);

// Tri : par défaut, coups de cœur de la Compagnie d'abord, puis note Google
// biome-ignore lint/style/useConst: Used in reactive bindings
let tri: Tri = 'defaut';

// Options des listes (le premier élément est la valeur « aucun »)
const options = <Code extends string>(valeurs: Valeur<Code>[]) => [
  { value: '', label: '' },
  ...valeurs.map((v) => ({ value: v.code, label: v.libelle })),
];

const prixMenuBaseOptions = [
  { value: '', label: '' },
  { value: 'moins-de-32', label: 'Moins de 32 €' },
  { value: 'moins-de-38', label: 'Moins de 38 €' },
];
const quantiteOptions = options(PORTIONS);
const typeMangeurOptions = options(PROFILS_MANGEUR);
const typeAmbianceOptions = options(AMBIANCES);
const typeBouchonOptions = options(TYPES_BOUCHON);
const serviceOptions = [
  { value: '', label: '' },
  { value: 'machon', label: 'Mâchon (le matin)' },
  { value: 'midi', label: 'Midi' },
  { value: 'soir', label: 'Soir' },
];

// Les listes à choix multiples affichent des libellés : on les relie aux codes.
const ARRONDISSEMENTS = [
  ...ARRONDISSEMENTS_LYON.map((cp) => ({ code: cp as string, libelle: cp as string })),
  ...COMMUNES.map((c) => ({ code: c.code as string, libelle: c.libelle })),
];
const arrondissements = ['', ...ARRONDISSEMENTS.map((a) => a.libelle)];
const quartiers = ['', ...QUARTIERS.map((q) => q.libelle)];
const codesDe = (libelles: string[], valeurs: { code: string; libelle: string }[]) =>
  valeurs.filter((v) => libelles.includes(v.libelle)).map((v) => v.code);

// Les critères de la barre, combinés en « et » (la phrase de recherche
// arrivera ensuite et remplacera cette partie).
$: criteres = ((): Critere[] => {
  const liste: Critere[] = [];
  if (selectedPrixMenuBase) {
    liste.push({ type: 'prix', palier: selectedPrixMenuBase as PalierDePrix });
  }
  if (selectedArrondissements.length > 0) {
    liste.push({
      type: 'arrondissement',
      valeurs: codesDe(selectedArrondissements, ARRONDISSEMENTS),
    });
  }
  if (selectedQuartiers.length > 0) {
    liste.push({
      type: 'quartier',
      valeurs: codesDe(selectedQuartiers, QUARTIERS) as Quartier[],
    });
  }
  if (selectedDay && selectedService) {
    liste.push({
      type: 'moment',
      jour: Number(selectedDay),
      service: selectedService as Service,
    });
  }
  if (selectedTypeMangeur) {
    liste.push({ type: 'profil', profil: selectedTypeMangeur as ProfilMangeur });
  }
  if (selectedQuantite) {
    liste.push({ type: 'portions', minimum: selectedQuantite as Portions });
  }
  if (optionVegetariens) liste.push({ type: 'vegetarien' });
  return liste;
})();

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

$: bouchons = trier(
  BOUCHONS.filter(
    (b) => passeAffinage(b, affinage) && criteres.every((c) => evaluer(b, c) === 'oui')
  ),
  tri
);

// Sans service choisi, un jour seul garde les bouchons ouverts ce jour-là.
$: if (selectedDay && !selectedService) {
  const jour = Number(selectedDay);
  bouchons = bouchons.filter((b) => b.openingHours?.some((c) => c.day === jour));
}

function clearFilters() {
  selectedPrixMenuBase = '';
  selectedArrondissements = [];
  selectedQuartiers = [];
  selectedQuantite = '';
  selectedTypeMangeur = '';
  selectedTypeAmbiance = '';
  selectedTypeBouchon = '';
  optionVegetariens = false;
  decorationRemarquable = false;
  terrace = false;
  remarkableTeam = false;
  coupDeCoeurCompagnie = false;
  coupDeCoeurVins = false;
  labelBouchonsLyonnais = false;
  selectionAuthentiques = false;
  selectedDay = '';
  selectedService = '';
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
    {serviceOptions}
    {hasActiveFilters}
    resultsCount={bouchons.length}
  bind:selectedPrixMenuBase
  bind:selectedArrondissements
  bind:selectedQuartiers
  bind:selectedQuantite
  bind:selectedTypeMangeur
  bind:selectedTypeAmbiance
  bind:selectedTypeBouchon
  bind:optionVegetariens
  bind:decorationRemarquable
  bind:terrace
  bind:remarkableTeam
  bind:coupDeCoeurCompagnie
  bind:coupDeCoeurVins
  bind:labelBouchonsLyonnais
  bind:selectionAuthentiques
  bind:selectedDay
  bind:selectedService
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
