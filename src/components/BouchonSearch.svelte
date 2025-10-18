<script>
  import { onMount } from 'svelte';
  import BouchonCard from './BouchonCard.svelte';
  import bouchonsData from '../data/bouchons.json';

  let bouchons = [];
  let filteredBouchons = [];
  
  // Nouveaux filtres selon les critères de la Compagnie du Rognon
  let selectedPrixMenuBase = '';
  let selectedArrondissement = '';
  let selectedQuartier = '';
  let selectedOuvertures = '';
  let selectedQuantite = '';
  let selectedTypeMangeur = '';
  let selectedTypeAmbiance = '';
  let selectedTypeTablee = '';
  let selectedTypeBouchon = '';
  let optionVegetariens = false;
  let optionMachon = false;
  let decorationRemarquable = false;
  let coupDeCoeurCompagnie = false;
  let coupDeCoeurVins = false;
  let labelBouchonsLyonnais = false;
  let selectionAuthentiques = false;
  let minNote = 0;
  let showFilters = false;
  
  // Variables de tri
  let sortBy = 'default'; // default, rating, prix, nom, arrondissement, coupDeCoeur
  let sortOrder = 'desc'; // asc ou desc
  
  // Fonction pour définir l'ordre par défaut selon le critère
  function getDefaultSortOrder(criteria) {
    switch (criteria) {
      case 'rating':
      case 'coupDeCoeur':
        return 'desc'; // Meilleures notes et coups de cœur d'abord
      case 'prix':
        return 'asc';  // Prix les plus bas d'abord
      case 'nom':
      case 'arrondissement':
        return 'asc';  // Ordre alphabétique
      default:
        return 'desc';
    }
  }
  
  // Variables pour les sections pliables
  let showExperienceFilters = false;
  let showDistinctionsFilters = false;

  // Options pour les filtres
  const prixMenuBaseOptions = ['', '15-20€', '20-25€', '25-30€', '30-35€', '35€+'];
  const arrondissements = ['', '1er', '2ème', '3ème', '4ème', '5ème', '6ème', '7ème', '8ème', '9ème'];
  const quartiers = ['', 'Vieux Lyon', 'Presqu\'île', 'Part-Dieu', 'Bellecour', 'Croix-Rousse', 'Confluence'];
  const ouverturesOptions = ['', 'Midi uniquement', 'Soir uniquement', 'Midi et soir', 'Toute la journée'];
  const quantiteOptions = ['', 'Portions légères', 'Portions équilibrées', 'Portions généreuses', 'Portions copieuses'];
  const typeMangeurOptions = ['', 'Amateur de tradition', 'Gourmets exigeants', 'Familles', 'Jeunes actifs', 'Touristes'];
  const typeAmbianceOptions = ['', 'Conviviale et familiale', 'Raffinée et moderne', 'Rustique et authentique', 'Animée et festive', 'Calme et intimiste'];
  const typeTableeOptions = ['', 'Petites tables intimes', 'Tables spacieuses', 'Grandes tablées', 'Bar et comptoir', 'Terrasse'];
  const typeBouchonOptions = ['', 'Traditionnel', 'Gastronomique', 'Populaire', 'Moderne', 'Authentique'];

  onMount(() => {
    bouchons = bouchonsData;
    filteredBouchons = bouchons;
  });

  // Fonction de filtrage
  function filterBouchons() {
    filteredBouchons = bouchons.filter(bouchon => {
      // Filtres par critères
      const matchesPrixMenuBase = selectedPrixMenuBase === '' || matchesPrixRange(bouchon.prixMenuBase, selectedPrixMenuBase);
      const matchesArrondissement = selectedArrondissement === '' || bouchon.arrondissement === selectedArrondissement;
      const matchesQuartier = selectedQuartier === '' || bouchon.quartier === selectedQuartier;
      const matchesOuvertures = selectedOuvertures === '' || bouchon.ouvertures.includes(selectedOuvertures.toLowerCase());
      const matchesQuantite = selectedQuantite === '' || bouchon.quantite === selectedQuantite;
      const matchesTypeMangeur = selectedTypeMangeur === '' || bouchon.typeMangeur === selectedTypeMangeur;
      const matchesTypeAmbiance = selectedTypeAmbiance === '' || bouchon.typeAmbiance === selectedTypeAmbiance;
      const matchesTypeTablee = selectedTypeTablee === '' || bouchon.typeTablee === selectedTypeTablee;
      const matchesTypeBouchon = selectedTypeBouchon === '' || bouchon.typeBouchon === selectedTypeBouchon;
      
      // Filtres booléens
      const matchesVegetariens = !optionVegetariens || bouchon.optionVegetariens;
      const matchesMachon = !optionMachon || bouchon.optionMachon;
      const matchesDecoration = !decorationRemarquable || bouchon.decorationRemarquable;
      const matchesCoupDeCoeurCompagnie = !coupDeCoeurCompagnie || bouchon.coupDeCoeurCompagnie;
      const matchesCoupDeCoeurVins = !coupDeCoeurVins || bouchon.coupDeCoeurVins;
      const matchesLabel = !labelBouchonsLyonnais || bouchon.labelBouchonsLyonnais;
      const matchesSelection = !selectionAuthentiques || bouchon.selectionAuthentiques;
      
      const matchesNote = bouchon.note >= minNote;

      return matchesPrixMenuBase && matchesArrondissement && matchesQuartier && 
             matchesOuvertures && matchesQuantite && matchesTypeMangeur && matchesTypeAmbiance && 
             matchesTypeTablee && matchesTypeBouchon && matchesVegetariens && matchesMachon && 
             matchesDecoration && matchesCoupDeCoeurCompagnie && matchesCoupDeCoeurVins && 
             matchesLabel && matchesSelection && matchesNote;
    });
    
    // Tri des résultats
    sortResults();
  }

  // Fonction de tri
  function sortResults() {
    if (sortBy === 'default') return;
    
    filteredBouchons.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'rating':
          compareValue = a.note - b.note;
          break;
        case 'prix':
          const prixA = extractPrixNumber(a.prixMenuBase);
          const prixB = extractPrixNumber(b.prixMenuBase);
          compareValue = prixA - prixB;
          break;
        case 'nom':
          compareValue = a.nom.localeCompare(b.nom);
          break;
        case 'arrondissement':
          compareValue = a.arrondissement.localeCompare(b.arrondissement);
          break;
        case 'coupDeCoeur':
          compareValue = (a.coupDeCoeurCompagnie ? 1 : 0) - (b.coupDeCoeurCompagnie ? 1 : 0);
          break;
      }
      
      return sortOrder === 'desc' ? -compareValue : compareValue;
    });
  }

  // Fonction pour extraire le prix numérique
  function extractPrixNumber(prix) {
    if (!prix) return 0;
    const match = prix.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Fonction pour matcher les prix
  function matchesPrixRange(prixBouchon, prixFiltre) {
    if (!prixBouchon) return false;
    const prix = parseInt(prixBouchon.replace('€', ''));
    
    switch(prixFiltre) {
      case '15-20€': return prix >= 15 && prix <= 20;
      case '20-25€': return prix >= 20 && prix <= 25;
      case '25-30€': return prix >= 25 && prix <= 30;
      case '30-35€': return prix >= 30 && prix <= 35;
      case '35€+': return prix >= 35;
      default: return true;
    }
  }

  // Réactivité : filtrer à chaque changement
  $: if (bouchons.length > 0) {
    filterBouchons();
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
    minNote = 0;
  }

  function toggleFilters() {
    showFilters = !showFilters;
  }

  function toggleExperienceFilters() {
    showExperienceFilters = !showExperienceFilters;
  }



  function toggleDistinctionsFilters() {
    showDistinctionsFilters = !showDistinctionsFilters;
  }
</script>

<div class="search-container">
  <!-- Critères de base (toujours visibles, sans titre) -->
  <div class="base-filters">
    <div class="filters-grid">
          <!-- Prix du menu de base -->
          <div class="filter-group">
            <label for="prixMenuBase">💰 Prix du menu de base</label>
            <select id="prixMenuBase" bind:value={selectedPrixMenuBase}>
              <option value="">Tous les prix</option>
              {#each prixMenuBaseOptions.slice(1) as prix}
                <option value={prix}>{prix}</option>
              {/each}
            </select>
          </div>

          <!-- Arrondissement -->
          <div class="filter-group">
            <label for="arrondissement">📍 Arrondissement</label>
            <select id="arrondissement" bind:value={selectedArrondissement}>
              <option value="">Tous les arrondissements</option>
              {#each arrondissements.slice(1) as arr}
                <option value={arr}>{arr} arrondissement</option>
              {/each}
            </select>
          </div>

          <!-- Quartier -->
          <div class="filter-group">
            <label for="quartier">🏘️ Quartier</label>
            <select id="quartier" bind:value={selectedQuartier}>
              <option value="">Tous les quartiers</option>
              {#each quartiers.slice(1) as quartier}
                <option value={quartier}>{quartier}</option>
              {/each}
            </select>
          </div>

          <!-- Ouvertures -->
          <div class="filter-group">
            <label for="ouvertures">🕐 Horaires d'ouverture</label>
            <select id="ouvertures" bind:value={selectedOuvertures}>
              <option value="">Tous les créneaux</option>
              {#each ouverturesOptions.slice(1) as ouverture}
                <option value={ouverture}>{ouverture}</option>
              {/each}
            </select>
          </div>
      </div>
    </div>

    <!-- Options (toujours visibles) -->
    <div class="options-section">
      <div class="options-grid">
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={coupDeCoeurCompagnie}>
            ❤️ Coup de cœur Rognons
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={optionVegetariens}>
            🥬 Options végétariennes disponibles
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={optionMachon}>
            🍳 Service mâchon (petit-déjeuner lyonnais)
          </label>
        </div>
        <div class="checkbox-group">
          <label>
            <input type="checkbox" bind:checked={decorationRemarquable}>
            🎨 Décoration authentique remarquable
          </label>
        </div>
      </div>
    </div>

    <!-- Bouton pour afficher les filtres avancés -->
    <div class="advanced-filters-toggle">
      <button class="show-advanced-filters" on:click={toggleFilters}>
        🎯 Filtres avancés
        <span class="toggle-icon">{showFilters ? '▲' : '▼'}</span>
      </button>
    </div>

    <!-- Panneau de filtres avancés -->
    {#if showFilters}
      <div class="filters-panel">
        <!-- Bouton effacer en haut pour la visibilité -->
        <div class="filters-header">
          <button class="clear-filters" on:click={clearFilters}>
            🧹 Effacer tous les filtres
          </button>
        </div>

        <!-- Critères d'expérience (pliables) -->
        <div class="filter-category">
        <button class="category-toggle" on:click={toggleExperienceFilters}>
          <span>🎭 Critères d'expérience</span>
          <span class="toggle-icon">{showExperienceFilters ? '▲' : '▼'}</span>
        </button>
        {#if showExperienceFilters}
          <div class="filters-grid">
            <!-- Quantité -->
            <div class="filter-group">
              <label for="quantite">🍽️ Taille des portions</label>
              <select id="quantite" bind:value={selectedQuantite}>
                <option value="">Toutes les portions</option>
                {#each quantiteOptions.slice(1) as quantite}
                  <option value={quantite}>{quantite}</option>
                {/each}
              </select>
            </div>

            <!-- Type de mangeur -->
            <div class="filter-group">
              <label for="typeMangeur">👥 Type de clientèle</label>
              <select id="typeMangeur" bind:value={selectedTypeMangeur}>
                <option value="">Toute clientèle</option>
                {#each typeMangeurOptions.slice(1) as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>

            <!-- Type d'ambiance -->
            <div class="filter-group">
              <label for="typeAmbiance">🎭 Ambiance & confort</label>
              <select id="typeAmbiance" bind:value={selectedTypeAmbiance}>
                <option value="">Toutes les ambiances</option>
                {#each typeAmbianceOptions.slice(1) as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>

            <!-- Type de tablée -->
            <div class="filter-group">
              <label for="typeTablee">🪑 Configuration des tables</label>
              <select id="typeTablee" bind:value={selectedTypeTablee}>
                <option value="">Toutes les configurations</option>
                {#each typeTableeOptions.slice(1) as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>

            <!-- Type de bouchons -->
            <div class="filter-group">
              <label for="typeBouchon">🏪 Style de bouchon</label>
              <select id="typeBouchon" bind:value={selectedTypeBouchon}>
                <option value="">Tous les styles</option>
                {#each typeBouchonOptions.slice(1) as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
            </div>
          </div>
        {/if}
      </div>



      <!-- Distinctions (pliables) -->
      <div class="filter-category">
        <button class="category-toggle" on:click={toggleDistinctionsFilters}>
          <span>🏆 Distinctions</span>
          <span class="toggle-icon">{showDistinctionsFilters ? '▲' : '▼'}</span>
        </button>
        {#if showDistinctionsFilters}
          <div class="distinctions-grid">
            <div class="checkbox-group">
              <label>
                <input type="checkbox" bind:checked={coupDeCoeurVins}>
                🍷 Excellente carte des vins
              </label>
            </div>
            <div class="checkbox-group">
              <label>
                <input type="checkbox" bind:checked={labelBouchonsLyonnais}>
                🏆 Label officiel "Les Bouchons Lyonnais"
              </label>
            </div>
            <div class="checkbox-group">
              <label>
                <input type="checkbox" bind:checked={selectionAuthentiques}>
                ⭐ Sélection "Authentiques Bouchons Lyonnais"
              </label>
            </div>
          </div>
        {/if}
      </div>



      <!-- Note minimum (compact) -->
      <div class="note-filter-compact">
        <label for="note">⭐ Note min: <span class="note-value">{minNote.toFixed(1)}/5</span></label>
        <input 
          type="range" 
          id="note"
          bind:value={minNote}
          min="0" 
          max="5" 
          step="0.1"
        >
      </div>


    </div>
  {/if}

  <!-- Résultats -->
  <div class="results-header">
    <h2>🍽️ {filteredBouchons.length} bouchon{filteredBouchons.length > 1 ? 's' : ''} trouvé{filteredBouchons.length > 1 ? 's' : ''}</h2>
    <div class="sort-control">
      <label for="sortBy">🎯 Trier par:</label>
      <select id="sortBy" bind:value={sortBy} on:change={() => { sortOrder = getDefaultSortOrder(sortBy); filterBouchons(); }}>
        <option value="default">✨ Défaut</option>
        <option value="rating">⭐ Note</option>
        <option value="prix">💰 Prix</option>
        <option value="nom">📝 Nom</option>
        <option value="arrondissement">📍 Arrondissement</option>
        <option value="coupDeCoeur">❤️ Coups de cœur</option>
      </select>
      {#if sortBy !== 'default'}
        <button 
          class="sort-order-btn" 
          on:click={() => { sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'; filterBouchons(); }}
          title={sortOrder === 'desc' ? 'Décroissant (clic pour croissant)' : 'Croissant (clic pour décroissant)'}
        >
          {sortOrder === 'desc' ? '⬇️' : '⬆️'}
        </button>
      {/if}
    </div>
  </div>

  <div class="results-grid">
    {#each filteredBouchons as bouchon (bouchon.id)}
      <BouchonCard {bouchon} />
    {/each}
  </div>

  {#if filteredBouchons.length === 0}
    <div class="no-results">
      <h3>😞 Aucun bouchon trouvé</h3>
      <p>Essayez de modifier vos critères de recherche</p>
    </div>
  {/if}
</div>

<style>
:global(body) {
  background-color: #fff;
  font-family: 'Open Sans', Arial, sans-serif;
  color: #221f20;
  font-weight: 400;
}

.search-container {
  background-color: #fff;
  padding: 2rem 0;
  max-width: 1080px;
  margin: 0 auto;
  width: 100%;
}

  /* Styles pour les critères de base */
  .base-filters {
    margin-bottom: 1.5rem;
  }



  /* Options toujours visibles */
  .options-section {
    margin-bottom: 1.5rem;
  }

  /* Bouton pour afficher les filtres avancés */
  .advanced-filters-toggle {
    text-align: center;
    margin: 2rem 0;
  }

  .show-advanced-filters {
    padding: 12px 24px;
    background: #f0c6da;
    color: #221f20;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-family: 'Open Sans', Arial, sans-serif;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .show-advanced-filters:hover {
    background: #e4b3cc;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(240, 198, 218, 0.3);
  }.filters-panel {
  background: #ffffff;
  border: 1px solid #f0c6da;
  border-radius: 12px;
  padding: 2rem;
  margin: 1rem 0;
  box-shadow: 0 4px 16px rgba(240, 198, 218, 0.15);
  animation: slideDown 0.3s ease-out;
}

.filters-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(240, 198, 218, 0.3);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: #ffffff;
    padding: 1.25rem;
    border-radius: 10px;
    border: 2px solid #f0c6da;
    box-shadow: 0 4px 12px rgba(240, 198, 218, 0.2);
    transition: all 0.3s ease;
  }

  .filter-group:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(240, 198, 218, 0.3);
    border-color: #e8b5d1;
  }

  .filter-group label {
    font-family: 'Open Sans', Arial, sans-serif;
    font-weight: 600;
    color: #221f20;
    font-size: 14px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }



  .filter-group select {
    padding: 0.75rem 1rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 14px;
    background: #ffffff;
    color: #221f20;
    cursor: pointer;
    font-family: 'Open Sans', Arial, sans-serif;
    font-weight: 400;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .filter-group select:focus {
    outline: none;
    border-color: #f0c6da;
    box-shadow: 0 0 0 3px rgba(240, 198, 218, 0.2);
  }

  .filter-group select:hover {
    border-color: #f0c6da;
    box-shadow: 0 2px 6px rgba(240, 198, 218, 0.2);
  }



  .note-value {
    font-weight: 400;
    color: #f0c6da;
    font-size: 14px;
  }

  /* Styles pour les catégories de filtres */
  .filter-category {
    margin: 1.5rem 0;
  }



  .category-toggle {
    width: 100%;
    background: rgba(240, 198, 218, 0.1);
    border: 1px solid rgba(240, 198, 218, 0.3);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    font-family: 'Open Sans', Arial, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #221f20;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
  }

  .category-toggle:hover {
    background: rgba(240, 198, 218, 0.2);
    border-color: rgba(240, 198, 218, 0.5);
  }

  .toggle-icon {
    font-size: 12px;
    color: #f0c6da;
  }

  .options-grid, .distinctions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .checkbox-group {
    margin-bottom: 0.5rem;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Open Sans', Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #221f20;
    cursor: pointer;
    padding: 0.75rem;
    border-radius: 6px;
    background: #ffffff;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .checkbox-group label:hover {
    background: rgba(240, 198, 218, 0.1);
    border-color: rgba(240, 198, 218, 0.3);
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #f0c6da;
  }

  .checkbox-group input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #f0c6da;
  }

  /* Style compact pour le filtre de note */
  .note-filter-compact {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(240, 198, 218, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(240, 198, 218, 0.3);
  }

  .note-filter-compact label {
    font-family: 'Open Sans', Arial, sans-serif;
    font-weight: 500;
    color: #221f20;
    font-size: 14px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .note-filter-compact input[type="range"] {
    width: 100%;
    height: 4px;
    margin: 0.5rem 0 0 0;
    background: rgba(240, 198, 218, 0.3);
    border-radius: 2px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .note-filter-compact input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #f0c6da;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(240, 198, 218, 0.4);
    transition: all 0.2s ease;
  }

  .note-filter-compact input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 8px rgba(240, 198, 218, 0.5);
  }

  .clear-filters {
    background: #221f20;
    color: #ffffff;
    border: 1px solid #221f20;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Open Sans', Arial, sans-serif;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(34, 31, 32, 0.2);
  }

  .clear-filters:hover {
    background: rgba(34, 31, 32, 0.9);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(34, 31, 32, 0.3);
  }

  .results-header {
    margin: 2rem 0 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .results-header h2 {
    font-family: 'GiltonRegular', 'Playfair Display', serif;
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
    font-family: 'Open Sans', sans-serif;
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

  /* Desktop large screens */
  @media (min-width: 1600px) {
    .search-container {
      max-width: 1600px;
      padding: 3rem 0;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
      gap: 2.5rem;
    }
    .filters-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

  }

  /* Desktop standard screens */
  @media (min-width: 1200px) and (max-width: 1599px) {
    .search-container {
      max-width: 1400px;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }
    .filters-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

  }

  /* Tablets and medium screens */
  @media (max-width: 1199px) and (min-width: 981px) {
    .search-container {
      max-width: 900px;
      padding: 2rem 0;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }

  }

  /* Medium screens */
  @media (max-width: 980px) and (min-width: 769px) {
    .search-container {
      max-width: 900px;
      padding: 1rem 0;
    }
    .results-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  /* Mobile */
  @media (max-width: 768px) {
    .search-container {
      padding: 1rem 0;
      max-width: 100%;
      margin: 0;
    }

    .filters-grid {
      grid-template-columns: 1fr;
    }
    .results-grid {
      grid-template-columns: 1fr;
    }
  }
</style>