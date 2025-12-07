<script lang="ts">
import FilterSelect from './FilterSelect.svelte';
import FilterMultiSelect from './FilterMultiSelect.svelte';
import FilterTime from './FilterTime.svelte';
import FilterCheckbox from './FilterCheckbox.svelte';
import { createEventDispatcher, onMount } from 'svelte';

export let isMobile: boolean;
export let sidebarOpen: boolean;
export let isLoading: boolean = false;

export let prixMenuBaseOptions: { value: string; label: string }[];
export let arrondissements: string[];
export let quartiers: string[];
export let quantiteOptions: string[];
export let typeMangeurOptions: string[];
export let typeAmbianceOptions: string[];
export let typeBouchonOptions: string[];

export let selectedPrixMenuBase: string;
export let selectedArrondissements: string[];
export let selectedQuartiers: string[];
export let selectedQuantite: string;
export let selectedTypeMangeur: string;
export let selectedTypeAmbiance: string;
export let selectedTypeBouchon: string;

export let optionVegetariens: boolean;
export let optionMachon: boolean;
export let decorationRemarquable: boolean;
export let coupDeCoeurCompagnie: boolean;
export let coupDeCoeurVins: boolean;
export let labelBouchonsLyonnais: boolean;
export let selectionAuthentiques: boolean;

export let selectedDay: string;
export let selectedTime: string;
export let hasActiveFilters: boolean;
const dispatch = createEventDispatcher();

// Calculer le nombre de filtres actifs
let activeFiltersCount = 0;
$: {
  activeFiltersCount = 0;
  activeFiltersCount += selectedArrondissements.length;
  activeFiltersCount += selectedQuartiers.length;
  if (selectedPrixMenuBase) activeFiltersCount++;
  if (selectedQuantite) activeFiltersCount++;
  if (selectedTypeMangeur) activeFiltersCount++;
  if (selectedTypeAmbiance) activeFiltersCount++;
  if (selectedTypeBouchon) activeFiltersCount++;
  if (optionVegetariens) activeFiltersCount++;
  if (optionMachon) activeFiltersCount++;
  if (decorationRemarquable) activeFiltersCount++;
  if (coupDeCoeurCompagnie) activeFiltersCount++;
  if (coupDeCoeurVins) activeFiltersCount++;
  if (labelBouchonsLyonnais) activeFiltersCount++;
  if (selectionAuthentiques) activeFiltersCount++;
  if (selectedDay) activeFiltersCount++;
  if (selectedTime) activeFiltersCount++;
}

function resetFilters() {
  dispatch('reset');
}
</script>

<aside
    class="sidebar"
    class:sidebar-mobile-open={sidebarOpen}
    inert={!sidebarOpen && isMobile}
>
    <div class="sidebar-header">
        {#if activeFiltersCount > 0}
            <div class="active-filters-count">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
            </div>
        {/if}
        {#if isLoading && isMobile}
            <div class="filter-loader" title="Application des filtres...">
                <span class="loader-spinner"></span>
            </div>
        {/if}
        <div class="sidebar-header-right">
            {#if hasActiveFilters}
                <button
                    class="reset-filters-btn"
                    on:click={resetFilters}
                    aria-label="Réinitialiser les filtres"
                    title="Réinitialiser tous les filtres"
                >
                    Réinitialiser
                </button>
            {/if}
            {#if isMobile}
                <button
                    class="sidebar-close-btn"
                    on:click={() => dispatch("close")}
                    aria-label="Fermer les filtres"
                    >✖️
                </button>
            {/if}
        </div>
    </div>
    <div class="sidebar-filters">
        <FilterSelect
            label="Tous les prix"
            options={prixMenuBaseOptions}
            bind:value={selectedPrixMenuBase}
            emoji="💰"
            ariaLabel="Prix du menu de base"
        />
        <FilterMultiSelect
            label="Tous les arrondissements"
            options={arrondissements}
            bind:selectedValues={selectedArrondissements}
            emoji="📍"
            ariaLabel="Arrondissement"
        />
        <FilterMultiSelect
            label="Tous les quartiers"
            options={quartiers}
            bind:selectedValues={selectedQuartiers}
            emoji="🏘️"
            ariaLabel="Quartier"
        />
        <FilterSelect
            label="Jour"
            options={[
                { value: '', label: 'Tous les jours' },
                { value: '1', label: 'Lundi' },
                { value: '2', label: 'Mardi' },
                { value: '3', label: 'Mercredi' },
                { value: '4', label: 'Jeudi' },
                { value: '5', label: 'Vendredi' },
                { value: '6', label: 'Samedi' },
                { value: '0', label: 'Dimanche' },
            ]}
            bind:value={selectedDay}
            emoji="📅"
            ariaLabel="Jour"
        />
        {#if selectedDay}
            <FilterTime
                bind:value={selectedTime}
                emoji="⏰"
                ariaLabel="Heure"
            />
        {/if}
        <FilterSelect
            label="Toutes les portions"
            options={quantiteOptions}
            bind:value={selectedQuantite}
            emoji="🍽️"
            ariaLabel="Taille des portions"
        />
        <FilterSelect
            label="Toute clientèle"
            options={typeMangeurOptions}
            bind:value={selectedTypeMangeur}
            emoji="👥"
            ariaLabel="Type de clientèle"
        />
        <FilterSelect
            label="Toutes les ambiances"
            options={typeAmbianceOptions}
            bind:value={selectedTypeAmbiance}
            emoji="🎭"
            ariaLabel="Ambiance & confort"
        />
        <FilterSelect
            label="Tous les styles"
            options={typeBouchonOptions}
            bind:value={selectedTypeBouchon}
            emoji="🏪"
            ariaLabel="Style de bouchon"
        />
        <div class="options-section">
            <div class="options-grid">
                <FilterCheckbox
                    bind:checked={coupDeCoeurCompagnie}
                    emoji="❤️"
                    label="Coup de cœur Rognons"
                />
                <FilterCheckbox
                    bind:checked={optionVegetariens}
                    emoji="🥬"
                    label="Option végétarienne"
                    tooltip="Au moins 1 entrée et 1 plat végétariens présents à la carte."
                />
                <FilterCheckbox
                    bind:checked={optionMachon}
                    emoji="🍳"
                    label="Mâchon"
                    tooltip="Repas lyonnais matinal et copieux."
                />
                <FilterCheckbox
                    bind:checked={decorationRemarquable}
                    emoji="🎨"
                    label="Décoration authentique remarquable"
                />
                <FilterCheckbox
                    bind:checked={coupDeCoeurVins}
                    emoji="🍷"
                    label="Excellente carte des vins"
                />
                <FilterCheckbox
                    bind:checked={labelBouchonsLyonnais}
                    emoji="🏆"
                    label="Label officiel 'Les Bouchons Lyonnais'"
                    tooltip="Label créé en 2012 qui vise à sauvegarder et pérenniser la tradition culinaire lyonnaise."
                />
                <FilterCheckbox
                    bind:checked={selectionAuthentiques}
                    emoji="⭐"
                    label="Sélection 'Authentiques Bouchons Lyonnais'"
                    tooltip="Définie par “l'Association de Défense des Bouchons lyonnais”, créée en 1992."
                />
            </div>
        </div>
    </div>
</aside>

<style>
    .sidebar {
        min-width: 260px;
        max-width: 340px;
        background: #fff;
        border: 1px solid #f0c6da;
        border-radius: 12px;
        padding: 1rem 1.5rem;
        padding-top: 0;
        box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
        overflow-y: auto;
        overflow-x: visible;
    }
    .sidebar-filters {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
    }
    .sidebar-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f0f0f0;
    }
    .sidebar-header-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
    }
    .active-filters-count {
        font-size: 0.9rem;
        font-weight: 600;
        color: #221f20;
        padding: 0.4rem 0.8rem;
        background: #f0f0f0;
        border-radius: 8px;
    }
    .filter-loader {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.2rem 0.5rem;
    }
    .loader-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #f0c6da;
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .sidebar-close-btn {
        background: #f0c6da;
        color: #221f20;
        border: none;
        border-radius: 50%;
        font-size: 1rem;
        box-shadow: 0 2px 8px rgba(240, 198, 218, 0.15);
        padding: 3px 6px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .sidebar-close-btn:hover {
        background: #e4b3cc;
    }
    .reset-filters-btn {
        background: linear-gradient(135deg, #f0c6da 60%, #e4b3cc 100%);
        color: #221f20;
        border: 1px solid #e4b3cc;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 500;
        padding: 0.4rem 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(240, 198, 218, 0.15);
    }
    .reset-filters-btn:hover {
        background: linear-gradient(135deg, #e4b3cc 60%, #d8a3bc 100%);
        box-shadow: 0 4px 12px rgba(240, 198, 218, 0.25);
        transform: translateY(-1px);
    }
    @media (max-width: 980px) {
        .sidebar {
            position: static;
            width: 100%;
            max-width: 100%;
            margin-bottom: 2rem;
        }
    }
    @media (max-width: 768px) {
        .sidebar-filters {
            gap: 0.5rem;
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
            overflow-y: auto !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
            display: block !important;
        }
        .sidebar.sidebar-mobile-open {
            transform: translateX(0);
        }
    }
</style>
