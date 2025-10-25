<script lang="ts">
import FilterSelect from './FilterSelect.svelte';
import FilterCheckbox from './FilterCheckbox.svelte';
import { createEventDispatcher, onMount } from 'svelte';

export let isMobile: boolean;
export let sidebarOpen: boolean;
export let sidebarFull: boolean;
export let sidebarTop: number;
export let maxHeight: number;

export let prixMenuBaseOptions: string[];
export let arrondissements: string[];
export let quartiers: string[];
export let ouverturesOptions: string[];
export let quantiteOptions: string[];
export let typeMangeurOptions: string[];
export let typeAmbianceOptions: string[];
export let typeTableeOptions: string[];
export let typeBouchonOptions: string[];

export let selectedPrixMenuBase: string;
export let selectedArrondissement: string;
export let selectedQuartier: string;
export let selectedOuvertures: string;
export let selectedQuantite: string;
export let selectedTypeMangeur: string;
export let selectedTypeAmbiance: string;
export let selectedTypeTablee: string;
export let selectedTypeBouchon: string;

export let optionVegetariens: boolean;
export let optionMachon: boolean;
export let decorationRemarquable: boolean;
export let coupDeCoeurCompagnie: boolean;
export let coupDeCoeurVins: boolean;
export let labelBouchonsLyonnais: boolean;
export let selectionAuthentiques: boolean;

const dispatch = createEventDispatcher();
</script>

<aside
    class="sidebar {sidebarFull ? 'sidebar-full' : ''}"
    style={isMobile
        ? "position: fixed; top: 0; left: 0; height: 100vh; max-height: 100vh; width: 100vw; z-index: 201; overflow-y: auto;"
        : `position: fixed; top: ${sidebarTop}px; max-height: ${maxHeight}px !important; overflow-y: auto !important; left: 0; z-index: 100;`}
    class:sidebar-mobile-open={sidebarOpen}
    inert={!sidebarOpen && isMobile}
>
    {#if isMobile}
        <button
            class="sidebar-close-btn"
            on:click={() => dispatch("close")}
            aria-label="Fermer les filtres"
            >✖️
        </button>
    {/if}
    <div class="sidebar-filters">
        <FilterSelect
            label="Tous les prix"
            options={prixMenuBaseOptions}
            bind:value={selectedPrixMenuBase}
            emoji="💰"
            ariaLabel="Prix du menu de base"
        />
        <FilterSelect
            label="Tous les arrondissements"
            options={arrondissements}
            bind:value={selectedArrondissement}
            emoji="📍"
            ariaLabel="Arrondissement"
        />
        <FilterSelect
            label="Tous les quartiers"
            options={quartiers}
            bind:value={selectedQuartier}
            emoji="🏘️"
            ariaLabel="Quartier"
        />
        <FilterSelect
            label="Tous les créneaux"
            options={ouverturesOptions}
            bind:value={selectedOuvertures}
            emoji="🕐"
            ariaLabel="Horaires d'ouverture"
        />
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
            label="Toutes les configurations"
            options={typeTableeOptions}
            bind:value={selectedTypeTablee}
            emoji="🪑"
            ariaLabel="Configuration des tables"
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
        padding: 2rem 1.5rem;
        box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
        left: 0;
        overflow-y: auto;
        overflow-x: hidden;
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
    .sidebar-close-btn {
        position: absolute;
        z-index: 202;
        background: #f0c6da;
        color: #221f20;
        border: none;
        border-radius: 50%;
        font-size: 1rem;
        box-shadow: 0 2px 8px rgba(240, 198, 218, 0.15);
        top: 3px;
        right: 6px;
        padding: 3px 6px;
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
            padding: 0.7rem 0.2rem 0.7rem 0.2rem !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
            display: block !important;
        }
        .sidebar.sidebar-mobile-open {
            transform: translateX(0);
        }
        .sidebar-close-btn {
            display: block;
        }
    }
</style>
