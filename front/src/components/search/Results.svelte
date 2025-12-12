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
export let currentPage = 1;
export let totalPages = 1;
export let totalItems = 0;
const dispatch = createEventDispatcher();

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages) {
    dispatch('pageChange', page);
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    goToPage(currentPage + 1);
  }
}

function prevPage() {
  if (currentPage > 1) {
    goToPage(currentPage - 1);
  }
}

// Generate page numbers to display - reactive statement
$: pageNumbers = (() => {
  const pages: number[] = [];
  const maxVisible = 7; // Maximum number of page buttons to show

  if (totalPages <= maxVisible) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show pages with ellipsis logic
    if (currentPage <= 3) {
      // Near the start
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1); // Ellipsis
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pages.push(1);
      pages.push(-1); // Ellipsis
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      // In the middle
      pages.push(1);
      pages.push(-1); // Ellipsis
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push(-2); // Ellipsis
      pages.push(totalPages);
    }
  }

  return pages;
})();
</script>

<div class="results-root">
    <div class="results-header">
        <h2>
            🍽️ {totalItems} bouchon{totalItems > 1 ? "s" : ""} trouvé{bouchons.length >
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
            </div>
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
        {:else if totalPages > 1}
            <div class="pagination">
                <button
                    class="pagination-btn pagination-arrow"
                    on:click={prevPage}
                    disabled={currentPage === 1}
                    aria-label="Page précédente"
                >
                    ←
                </button>
                
                <div class="pagination-numbers">
                    {#each pageNumbers as page}
                        {#if page === -1 || page === -2}
                            <span class="pagination-ellipsis">...</span>
                        {:else}
                            <button
                                class="pagination-page-btn"
                                class:active={page === currentPage}
                                on:click={() => goToPage(page)}
                                aria-label="Page {page}"
                                aria-current={page === currentPage ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        {/if}
                    {/each}
                </div>
                
                <button
                    class="pagination-btn pagination-arrow"
                    on:click={nextPage}
                    disabled={currentPage === totalPages}
                    aria-label="Page suivante"
                >
                    →
                </button>
            </div>
            <div class="pagination-info-bottom">
                {totalItems} résultat{totalItems > 1 ? 's' : ''}
            </div>
        {/if}
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
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 3rem;
        padding: 1rem 0;
    }
    .pagination-numbers {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    .pagination-btn {
        background: linear-gradient(135deg, #f0c6da 60%, #e4b3cc 100%);
        color: #221f20;
        border: 1px solid #e4b3cc;
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(240, 198, 218, 0.15);
        font-family: "Open Sans", sans-serif;
        min-width: 40px;
    }
    .pagination-arrow {
        padding: 0.5rem 1rem;
    }
    .pagination-page-btn {
        background: white;
        color: #221f20;
        border: 1px solid #e4b3cc;
        border-radius: 6px;
        padding: 0.4rem 0.6rem;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: "Open Sans", sans-serif;
        min-width: 36px;
    }
    .pagination-page-btn:hover {
        background: #f0c6da;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(240, 198, 218, 0.2);
    }
    .pagination-page-btn.active {
        background: linear-gradient(135deg, #f0c6da 60%, #e4b3cc 100%);
        font-weight: 700;
        border-color: #d8a3bc;
        box-shadow: 0 2px 8px rgba(240, 198, 218, 0.3);
    }
    .pagination-ellipsis {
        color: #666;
        padding: 0 0.25rem;
        font-size: 0.9rem;
    }
    .pagination-btn:hover:not(:disabled) {
        background: linear-gradient(135deg, #e4b3cc 60%, #d8a3bc 100%);
        box-shadow: 0 4px 12px rgba(240, 198, 218, 0.25);
        transform: translateY(-1px);
    }
    .pagination-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        background: #f0f0f0;
        border-color: #ddd;
        color: #999;
    }
    .pagination-info-bottom {
        text-align: center;
        font-size: 0.875rem;
        color: #666;
        margin-top: 0.5rem;
        font-family: "Open Sans", sans-serif;
    }
    @media (max-width: 768px) {
        .pagination {
            gap: 0.4rem;
            margin-top: 2rem;
            padding: 0.75rem 0;
        }
        .pagination-numbers {
            gap: 0.2rem;
        }
        .pagination-btn {
            padding: 0.4rem 0.6rem;
            font-size: 0.9rem;
            min-width: 34px;
        }
        .pagination-arrow {
            padding: 0.4rem 0.75rem;
        }
        .pagination-page-btn {
            padding: 0.3rem 0.5rem;
            font-size: 0.8rem;
            min-width: 30px;
        }
        .pagination-ellipsis {
            font-size: 0.8rem;
            padding: 0 0.15rem;
        }
        .pagination-info-bottom {
            font-size: 0.75rem;
            margin-top: 0.4rem;
        }
    }
</style>
