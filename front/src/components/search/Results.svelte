<script lang="ts">
import BouchonCard from '../BouchonCard.svelte';
import { createEventDispatcher } from 'svelte';
import type { BouchonComplet } from '../../data/bouchons';
import type { Tri } from '../../recherche/regles';

export let bouchons: BouchonComplet[] = [];
export let isMobile = false;
export let tri: Tri = 'defaut';
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
        <div class="controls-row">
            {#if isMobile}
                <button
                    class="show-advanced-filters-btn"
                    on:click={() => dispatch("openSidebar")}
                    aria-label="Afficher les filtres avancés">🔍 Filtres</button
                >
            {/if}
            <div class="sort-control">
                <label for="sortBy">
                  <span class="sort-label">🎯 Trier par :</span>
                </label>
                <select id="sortBy" bind:value={tri}>
                    <option value="defaut">❤️ Coups de cœur</option>
                    <option value="note">⭐ Note (Google)</option>
                    <option value="prix">💰 Prix</option>
                </select>
            </div>
        </div>
    </div>
    <div class="results-grid">
        {#each bouchons as bouchon (bouchon.id)}
            <BouchonCard {bouchon} />
        {/each}
    </div>
    {#if bouchons.length === 0}
        <div class="no-results">
            <h3>
                😞 Aïe, on n'a pas encore trouvé de bouchon comme celui-ci
            </h3>
            <p>Mais dites-nous et on le teste !</p>
        </div>
    {/if}
</div>

<style>
    .results-header {
        margin: 0.5rem 0 1rem 0;
        margin-top: 0rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.1rem;
    }
    .controls-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .results-header h2 {
        font-family: "GiltonRegular", "Playfair Display", serif;
        color: #221f20;
        font-weight: normal;
        margin: 0;
        line-height: 1em;
        padding-bottom: 0;
    }
    .sort-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 14px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(240, 198, 218, 0.1);
    }
    .sort-control label {
        color: #221f20;
        font-weight: 500;
        font-family: "Open Sans", sans-serif;
    }
    @media (max-width: 360px) {
        .sort-label {
            display: none;
        }
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
            margin-top: 1rem;
            flex-direction: column;
            text-align: center;
            gap: 1rem;
        }
        .controls-row {
            width: 100%;
            justify-content: space-between;
            gap: 0.5rem;
        }
        .show-advanced-filters-btn {
            flex: 0 0 auto;
            white-space: nowrap;
        }
        .sort-control {
            flex: 0 1 auto;
            min-width: 0;
            box-sizing: border-box;
        }
        .sort-control label {
            font-size: 13px;
        }
        .sort-control select {
            font-size: 13px;
            padding: 0.3rem 0.5rem;
            min-width: 100px;
        }
    }
    .show-advanced-filters-btn {
        background: white;
        color: #221f20;
        border: 1px solid #f0c6da;
        border-radius: 8px;
        padding: 0.3rem 0.9rem;
        font-size: 1rem;
        cursor: pointer;
        font-family: "GiltonRegular", serif;
    }
</style>
