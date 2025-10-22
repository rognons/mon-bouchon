<script lang="ts">
import type { BouchonData } from '../services/bouchonApi';

export let bouchon: BouchonData;

// biome-ignore lint/correctness/noUnusedVariables: Used in template on:click
function callBouchon(): void {
  if (bouchon.phone) {
    window.open(`tel:${bouchon.phone}`, '_self');
  }
}
</script>

<div class="bouchon-card">
  <div class="card-header">
    <h3 class="bouchon-name">{bouchon.name}</h3>
    {#if bouchon.compagnieFavorite}
      <div class="coup-de-coeur-header">
        <img src="/favicon.ico" alt="Coup de cœur Rognon" class="cochon-header">
        <span class="coeur-header">❤️</span>
      </div>
    {/if}
  </div>

  <div class="bouchon-info">
    <div class="location">
      📍 {bouchon.address}
    </div>
    
    <div class="details-grid">
      <div class="detail-item">
        <span class="label">Prix:</span>
        <span class="value prix-menu">{bouchon.baseMenuPrice}</span>
      </div>
      <div class="detail-item">
        <span class="label">Contact:</span>
        <button class="value phone-value" on:click={callBouchon}>
          📞 {bouchon.phone}
        </button>
      </div>
    </div>

    <div class="description">
      <p>{bouchon.description}</p>
    </div>

    <!-- <div class="amenities">
      {#if bouchon.terrace}
        <span class="amenity">🌿 Terrasse</span>
      {/if}
      {#if bouchon.reservation}
        <span class="amenity">📞 Réservation</span>
      {:else}
        <span class="amenity no-reservation">🚫 Pas de réservation</span>
      {/if}
    </div> -->
  </div>

  <!-- Note en bas à droite -->
  <div class="bottom-rating">
    <span class="bottom-note">⭐ {bouchon.rating}/5</span>
  </div>

</div>

<style>
  .bouchon-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: all 0.4s ease-in-out;
    position: relative;
  }

  .bouchon-card:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    background-color: #f0c6da;
    color: #221f20;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 52px;
  }

  .bouchon-name {
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: normal;
    margin: 0;
    padding: 0;
    flex: 1;
    line-height: 1;
    padding-right: 1rem;
    align-self: center;
  }

  /* Note en bas à droite */
  .bottom-rating {
    position: absolute;
    bottom: 12px;
    right: 12px;
  }

  .bottom-note {
    font-size: 0.8rem;
    font-weight: 600;
    color: #555;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.3rem 0.6rem;
    border-radius: 12px;
    border: 1px solid #ddd;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  .bouchon-card:hover .bottom-note {
    opacity: 1;
  }

  .coup-de-coeur-header {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.4rem 0.6rem;
    border-radius: 20px;
    box-shadow: 0 3px 10px rgba(240, 198, 218, 0.4);
    border: 2px solid #f0c6da;
    animation: coupDeCoeurGlow 3s infinite;
  }

  .cochon-header {
    width: 18px;
    height: 18px;
  }

  .coeur-header {
    font-size: 16px;
  }

  @keyframes coupDeCoeurGlow {
    0%, 100% { 
      box-shadow: 0 3px 10px rgba(240, 198, 218, 0.4);
      border-color: #f0c6da;
    }
    50% { 
      box-shadow: 0 4px 15px rgba(240, 198, 218, 0.7);
      border-color: #e4b3cc;
    }
  }

  .bouchon-info {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .location {
    font-family: 'Open Sans', Arial, sans-serif;
    color: #221f20;
    opacity: 0.7;
    margin-bottom: 1rem;
    font-weight: 400;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-family: 'Open Sans', Arial, sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    color: #221f20;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-family: 'Open Sans', Arial, sans-serif;
    font-weight: 400;
    color: #221f20;
  }

  .description {
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
    border-left: 4px solid #f0c6da;
  }

  .description p {
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0;
    color: #221f20;
    line-height: 1.6;
    font-weight: 400;
  }



  /* .amenities {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .amenity {
    padding: 0.4rem 0.8rem;
    background: #e8f5e8;
    color: #27ae60;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .no-reservation {
    background: #ffe8e8;
    color: #e74c3c;
  } */



  .phone-value {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: underline;
    text-decoration-color: transparent;
    font-weight: 500 !important;
  }

  .phone-value:hover {
    color: #f0c6da !important;
    text-decoration-color: #f0c6da;
  }

  @media (max-width: 768px) {
    .card-header {
      flex-direction: row;
      align-items: center;
      padding: 0.8rem 1rem;
      min-height: 48px;
    }

    .bouchon-info {
      padding: 1rem;
    }
    
    .bouchon-name {
      font-size: 1.2rem;
      padding-right: 0.5rem;
      line-height: 1.2;
    }
    
    .coup-de-coeur-header {
      padding: 0.35rem 0.5rem;
      gap: 0.25rem;
    }
    
    .cochon-header {
      width: 16px;
      height: 16px;
    }
    
    .coeur-header {
      font-size: 14px;
    }

    .details-grid {
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
  }
</style>