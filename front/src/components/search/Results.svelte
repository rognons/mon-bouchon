<script lang="ts">
import BouchonCard from '../BouchonCard.svelte';
import type { BouchonComplet } from '../../data/bouchons';
import { chapeauAUnCriterePres, decrireManque } from '../../recherche/phrase';
import {
  afficherAUnCriterePres,
  type Critere,
  type ResultatsDeRecherche,
  type Tri,
} from '../../recherche/regles';

export let resultats: ResultatsDeRecherche<BouchonComplet> = { exacts: [], aUnCriterePres: [] };
export let criteres: Critere[] = [];
export let tri: Tri = 'defaut';

$: bouchons = resultats.exacts;
$: proches = afficherAUnCriterePres(resultats) ? resultats.aUnCriterePres : [];
$: titre =
  bouchons.length > 1
    ? `${bouchons.length} bouchons trouvés`
    : bouchons.length === 1
      ? '1 bouchon trouvé'
      : 'Aucun bouchon trouvé';
</script>

<div class="resultats">
  <div class="entete">
    <h2 class="titre">{titre}</h2>
    <label class="tri">
      <span>Trier par</span>
      <select bind:value={tri}>
        <option value="defaut">Top 10 de la Compagnie</option>
        <option value="note">Note Google</option>
        <option value="prix">Prix</option>
      </select>
    </label>
  </div>

  {#if bouchons.length}
    <div class="grille">
      {#each bouchons as bouchon, i (bouchon.id)}
        <BouchonCard {bouchon} {criteres} ideal={i === 0 && criteres.length > 0} />
      {/each}
    </div>
  {:else if proches.length === 0}
    <div class="aucun">
      <p class="aucun-titre">On n’a pas encore trouvé de bouchon comme celui-ci.</p>
      <p>Retirez un choix, ou dites-nous lequel tester !</p>
    </div>
  {/if}
</div>

{#if proches.length > 0}
  <section class="proches" aria-labelledby="titre-proches">
    <div class="proches-int">
      <h2 class="titre" id="titre-proches">À un critère près</h2>
      <p class="chapeau">{chapeauAUnCriterePres(proches[0].critereManquant, bouchons.length)}</p>
      <div class="grille">
        {#each proches as proche (proche.bouchon.id)}
          <BouchonCard
            bouchon={proche.bouchon}
            {criteres}
            manque={decrireManque(proche.critereManquant, proche.raison)}
          />
        {/each}
      </div>
    </div>
  </section>
{/if}

<style>
  .resultats,
  .proches {
    color: #221f20;
    font-family: 'Bricolage Grotesque', Arial, sans-serif;
    font-size: 17px;
    line-height: 1.6;
  }
  .entete {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .titre {
    margin: 0;
    padding: 0;
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    font-weight: 400;
    font-size: 36px;
    line-height: 1.1;
    color: #221f20;
  }
  .tri {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
  .tri select {
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid #221f20;
    border-radius: 4px;
    background: #ffffff;
    color: #221f20;
    font: inherit;
    font-weight: 400;
    cursor: pointer;
  }
  .tri select:focus-visible {
    outline: 3px solid #221f20;
    outline-offset: 3px;
  }
  .grille {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
    gap: 24px;
    align-items: start;
  }
  /* Sur ordinateur, les cartes partagent les rangs de cette grille (sous-grille,
     voir BouchonCard) : l'écart vertical vient de la marge des cartes. */
  @media (min-width: 768px) {
    .grille {
      row-gap: 0;
    }
  }
  .aucun {
    padding: 32px 0;
  }
  .aucun p {
    margin: 0;
  }
  .aucun-titre {
    font-weight: 600;
  }
  /* « À un critère près » : sur fond crème, sur toute la largeur. */
  .proches {
    margin-top: 48px;
    background: #eeebe4;
    width: 100vw;
    margin-left: calc(50% - 50vw);
  }
  .proches-int {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 32px;
  }
  .chapeau {
    margin: 8px 0 24px;
    max-width: 70ch;
  }
  @media (max-width: 767px) {
    .titre {
      font-size: 27px;
    }
    /* Sur téléphone : le titre, puis le tri en dessous. */
    .entete {
      gap: 8px;
      margin-bottom: 16px;
    }
    .tri {
      font-size: 15px;
    }
    /* 16 px au moins : sinon l'iPhone zoome sur le menu quand on le touche. */
    .tri select {
      padding: 6px 10px;
      font-size: 16px;
    }
    .proches-int {
      padding: 32px 16px;
    }
  }
</style>
