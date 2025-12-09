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
export let terrace: boolean;
export let remarkableTeam: boolean;
export let coupDeCoeurCompagnie: boolean;
export let coupDeCoeurVins: boolean;
export let labelBouchonsLyonnais: boolean;
export let selectionAuthentiques: boolean;

export let selectedDay: string;
export let selectedTime: string;
export let hasActiveFilters: boolean;
const dispatch = createEventDispatcher();

// Options pour les accordéons multi-sélection
const distinctionsOptions = [
  '❤️ Coup de cœur Compagnie du Rognon',
  '🍷 Sélection Vins',
  '🏅 Label "Les Bouchons Lyonnais"',
  '⭐ Sélection "Authentiques Bouchons Lyonnais"',
];

const optionsOptions = [
  '🥬 Option végétarienne',
  '🍳 Mâchon possible',
  '🎨 Décoration remarquable',
  '☀️ Terrace',
  '👥 Personnel remarquable',
];

const distinctionsTooltips: Record<string, string> = {
  '🏅 Label "Les Bouchons Lyonnais"':
    'Label créé en 2012 qui vise à sauvegarder et pérenniser la tradition culinaire lyonnaise.',
  '⭐ Sélection "Authentiques Bouchons Lyonnais"':
    'Définie par "l\'Association de Défense des Bouchons lyonnais", créée en 1992.',
};

const optionsTooltips: Record<string, string> = {
  '🥬 Option végétarienne': 'Au moins 1 entrée et 1 plat végétariens présents à la carte.',
  '🍳 Mâchon possible': 'Repas lyonnais matinal et copieux.',
};

let selectedDistinctions: string[] = [];
let selectedOptions: string[] = [];

// Synchroniser les multi-sélections avec les booléens
$: {
  coupDeCoeurCompagnie = selectedDistinctions.includes('❤️ Coup de cœur Compagnie du Rognon');
  coupDeCoeurVins = selectedDistinctions.includes('🍷 Sélection Vins');
  labelBouchonsLyonnais = selectedDistinctions.includes('🏅 Label "Les Bouchons Lyonnais"');
  selectionAuthentiques = selectedDistinctions.includes(
    '⭐ Sélection "Authentiques Bouchons Lyonnais"'
  );

  optionVegetariens = selectedOptions.includes('🥬 Option végétarienne');
  optionMachon = selectedOptions.includes('🍳 Mâchon possible');
  decorationRemarquable = selectedOptions.includes('🎨 Décoration remarquable');
  terrace = selectedOptions.includes('☀️ Terrasse');
  remarkableTeam = selectedOptions.includes('👥 Personnel remarquable');
}

export let resultsCount: number = 0;

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
        {#if hasActiveFilters}
            <div class="results-count" class:loading={isLoading}>
                {#if isLoading}
                    <img
                        src="/favicon.ico"
                        alt="Chargement..."
                        class="spinning-cochon-sidebar"
                    />
                {:else}
                    {resultsCount} résultat{resultsCount > 1 ? 's' : ''}
                {/if}
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
            label="Tous les types de bouchons"
            options={typeBouchonOptions}
            bind:value={selectedTypeBouchon}
            emoji="🏪"
            ariaLabel="Style de bouchon"
        />
        <FilterSelect
            label="Toutes les ambiances"
            options={typeAmbianceOptions}
            bind:value={selectedTypeAmbiance}
            emoji="🎭"
            ariaLabel="Ambiance & confort"
        />
        <FilterMultiSelect
            label="Distinctions"
            options={distinctionsOptions}
            bind:selectedValues={selectedDistinctions}
            emoji="🏆"
            ariaLabel="Distinctions"
            tooltips={distinctionsTooltips}
        />
        <FilterMultiSelect
            label="Options"
            options={optionsOptions}
            bind:selectedValues={selectedOptions}
            emoji="✨"
            ariaLabel="Options"
            tooltips={optionsTooltips}
        />
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
    }
    .sidebar-header-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
    }
    .results-count {
        font-size: 0.9rem;
        font-weight: 600;
        color: #221f20;
        padding: 0.2rem 0.8rem;
        background: #f0f0f0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .results-count.loading {
        background: rgba(240, 198, 218, 0.15);
        padding: 0.3rem;
        border: 0.5px solid rgba(240, 198, 218, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1;
    }
    .spinning-cochon-sidebar {
        width: 20px;
        animation: spin 1.5s linear infinite;
        filter: drop-shadow(0 2px 6px rgba(240, 198, 218, 0.6));
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
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
        color: black;
        border: 1px solid #e4b3cc;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
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
            position: fixed;
            top: 0;
            left: 0;
            width: 85vw;
            max-width: 85vw;
            min-width: 0;
            height: 100vh;
            max-height: 100vh;
            z-index: 201;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 8px 0 32px rgba(240, 198, 218, 0.18);
            border-radius: 0;
            margin: 0;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
            display: block;
        }
        .sidebar.sidebar-mobile-open {
            transform: translateX(0);
        }
        .sidebar-filters {
            gap: 0.5rem;
        }
    }

    @media (max-height: 500px) and (orientation: landscape) {
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 85vw;
            max-width: 85vw;
            min-width: 0;
            height: 100vh;
            max-height: 100vh;
            z-index: 201;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 8px 0 32px rgba(240, 198, 218, 0.18);
            border-radius: 0;
            margin: 0;
            overflow-y: auto;
            overflow-x: hidden;
            box-sizing: border-box;
            display: block;
        }
        .sidebar.sidebar-mobile-open {
            transform: translateX(0);
        }
    }
</style>
