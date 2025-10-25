<script lang="ts">
import BouchonCard from '../BouchonCard.svelte';
import { createEventDispatcher } from 'svelte';
export let bouchons: any = [];
export let isLoading = false;
export let apiError: string | null = null;
export let isMobile = false;
export let sortBy = 'rating';
export let sortOrder = 'desc';
export let getDefaultSortOrder: (criteria: string) => string;
export let applyFilters: () => void;
const dispatch = createEventDispatcher();
</script>

<div class="results-root">
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
                on:click={() => dispatch("openSidebar")}
                aria-label="Afficher les filtres avancés">🔍 Filtres</button
            >
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
    {#if isLoading}
        <div class="loading-state">
            <div class="loading-cochon">
                <img
                    src="/favicon.ico"
                    alt="Chargement..."
                    class="spinning-cochon"
                />
            </div>
            <h3>On finit notre communard et on est avec vous...</h3>
        </div>
    {:else if apiError}
        <div class="error-state">
            <h3>
                😔 Nous sommes en train de tester un nouveau bouchon, patience !
                🍽️
            </h3>
            <p>Rafraîchissez la page si l'erreur persiste.</p>
        </div>
    {:else}
        <div class="results-grid">
            {#each bouchons as bouchon (bouchon.id)}
                <BouchonCard {bouchon} />
            {/each}
        </div>
        {#if bouchons.length === 0 && !isLoading && !apiError}
            <div class="no-results">
                <h3>
                    😞 Aïe, on n'a pas encore trouvé de bouchon comme celui-ci
                </h3>
                <p>Mais dites-nous et on le teste !</p>
            </div>
        {/if}
    {/if}
</div>

<style>
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
    @media (min-width: 1600px) {
        .results-grid {
            grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
            gap: 2.5rem;
        }
    }
    @media (min-width: 1200px) and (max-width: 1599px) {
        .results-grid {
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }
    }
    @media (max-width: 1199px) and (min-width: 981px) {
        .results-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }
    }
    @media (max-width: 980px) and (min-width: 769px) {
        .results-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }
    }
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
</style>
