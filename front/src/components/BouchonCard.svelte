<script lang="ts">
// La carte d'un bouchon : son visuel, son rang dans le top 10, son nom et sa
// note Google, les critères cherchés qu'il remplit, sa description, les
// points-clés de la Compagnie et les actions.
import type { BouchonComplet } from '../data/bouchons';
import { AVEC_PHOTO } from '../data/photos';
import { AVEC_STICKER } from '../data/stickers';
import { etiquette, infosCles } from '../recherche/phrase';
import { type Critere, evaluer, rangTop10 } from '../recherche/regles';
import FeuilleVege from './FeuilleVege.svelte';

export let bouchon: BouchonComplet;
// Les critères de la recherche : ceux que le bouchon remplit sont étiquetés.
// biome-ignore lint/style/useConst: Svelte prop
export let criteres: Critere[] = [];
// Ce qui manque au bouchon, s'il est « à un critère près ».
// biome-ignore lint/style/useConst: Svelte prop
export let manque = '';
// Le bouchon idéal : le premier de la liste qui remplit tous vos critères.
// Sa fiche porte un bandeau et une ombre qui la détachent des autres.
// biome-ignore lint/style/useConst: Svelte prop
export let ideal = false;

$: criteresRemplis = criteres.filter((c) => evaluer(bouchon, c) === 'oui');
$: remplis = criteresRemplis.map((c) => ({
  texte: etiquette(c, bouchon),
  vege: c.type === 'vegetarien',
}));
// À la suite, les infos clés (prix, lieu, type, végé) que les étiquettes ne
// disent pas déjà : elles restent visibles même sans critère choisi.
$: infos = infosCles(
  bouchon,
  criteresRemplis.map((c) => c.type)
).map((i) => ({ texte: i.texte, vege: i.type === 'vegetarien' }));
$: description = bouchon.description?.trim().startsWith('À venir') ? '' : bouchon.description;
$: pointsCles = (bouchon.pointsCles ?? []).slice(0, 3);
$: rang = rangTop10(bouchon);
$: photo = AVEC_PHOTO.has(bouchon.id) ? `/photos/${bouchon.id}.webp` : '';
$: sticker = AVEC_STICKER.has(bouchon.id) ? `/stickers/${bouchon.id}.webp` : '';
$: note = bouchon.rating ? String(bouchon.rating).replace('.', ',') : '';
</script>

<article class="carte" class:ideal aria-labelledby="nom-{bouchon.id}">
  {#if manque}<p class="manque">{manque}</p>{/if}
  <!-- La photo de l'article (souvent la devanture), sinon le sticker du bouchon,
       sinon le cochon de la Compagnie. -->
  <div class="visuel" class:visuel-photo={photo}>
    {#if ideal}
      <p class="bandeau-ideal">
        <img src="/cochon-top10.png" alt="" width="32" height="31" />Votre bouchon idéal
      </p>
    {/if}
    {#if photo}
      <img src={photo} alt="" width="720" height="480" loading="lazy" decoding="async" />
    {:else if sticker}
      <img src={sticker} alt="" width="480" height="360" loading="lazy" decoding="async" />
    {:else}
      <img class="cochon-seul" src="/cochon-top10.png" alt="" width="96" height="92" loading="lazy" />
    {/if}
  </div>
  <div class="corps">
    {#if rang}
      <p class="top">
        <img src="/cochon-top10.png" alt="" width="32" height="31" />
        Top {rang} de la Compagnie du Rognon
      </p>
    {/if}
    <div class="titre">
      <h3 class="nom" id="nom-{bouchon.id}">{bouchon.name}</h3>
      {#if note}
        <p class="note">
          <span class="sur">Google<span class="sr">, note</span></span>
          <svg aria-hidden="true" viewBox="0 0 24 24"
            ><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg
          >
          {note}<span class="sr"> sur 5</span>
        </p>
      {/if}
    </div>

    {#if remplis.length || infos.length}
      <!-- D'abord les critères cherchés que le bouchon remplit (roses, cochés),
           puis ses infos clés (cadre fin, sans coche). -->
      <ul class="etiquettes" aria-label="Vos critères remplis et les infos clés">
        {#each remplis as { texte, vege }}
          <li class="etiquette">
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10" /></svg>
            <span class="sr">Critère rempli : </span>{texte}{#if vege}<FeuilleVege taille={16} />{/if}
          </li>
        {/each}
        {#each infos as { texte, vege }}
          <li class="etiquette info">
            {texte}{#if vege}<FeuilleVege taille={16} />{/if}
          </li>
        {/each}
      </ul>
    {/if}

    {#if description}<p class="description">{description}</p>{/if}

    {#if pointsCles.length}
      <ul class="points-cles" aria-label="Les points-clés de la Compagnie">
        {#each pointsCles as point}
          <li>
            <!-- Un cœur à la charte (rose et trait noir), à la place d'un émoji ;
                 dessin repris de Lucide (licence ISC). -->
            <svg class="coeur" aria-hidden="true" viewBox="0 0 24 24"
              ><path
                d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
              /></svg
            >
            {point}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <!-- Menu, Réserver, Y aller, Lire le test : tous au même niveau. Seul Réserver
       porte une icône, qui annonce la page de réservation ou l’appel. -->
  <div class="actions">
    {#if bouchon.menuUrl}
      <a class="btn" href={bouchon.menuUrl} target="_blank" rel="noopener noreferrer">Menu</a>
    {/if}
    <!-- L'icône dit à l'avance ce que fait le bouton : une page de réservation
         (curseur de souris) ou un appel (téléphone, dessin repris de Lucide, licence ISC). -->
    {#if bouchon.bookingUrl}
      <a class="btn" href={bouchon.bookingUrl} target="_blank" rel="noopener noreferrer"
        ><svg class="btn-ico" aria-hidden="true" viewBox="0 0 24 24"
          ><path
            d="M5 2.5v16.5l4.3-4.2 2.9 6.7 3-1.3-2.9-6.6H18.5z"
          /></svg
        >Réserver<span class="sr"> en ligne</span></a
      >
    {:else if bouchon.phone}
      <!-- Sans réservation en ligne, on réserve par téléphone. -->
      <a class="btn" href="tel:{bouchon.phone.replace(/\s/g, '')}"
        ><svg class="btn-ico" aria-hidden="true" viewBox="0 0 24 24"
          ><path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
          /></svg
        >Réserver<span class="sr"> par téléphone</span></a
      >
    {/if}
    {#if bouchon.mapsUrl}
      <a class="btn" href={bouchon.mapsUrl} target="_blank" rel="noopener noreferrer">Y aller</a>
    {/if}
    {#if bouchon.articleUrl}
      <a class="btn" href={bouchon.articleUrl} target="_blank" rel="noopener noreferrer"
        >Lire le test</a
      >
    {/if}
  </div>
</article>

<style>
  .carte {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #221f20;
    border-radius: 4px;
    overflow: hidden;
    color: #221f20;
    font-family: 'Bricolage Grotesque', Arial, sans-serif;
    font-size: 17px;
    line-height: 1.6;
  }
  .manque {
    margin: 0;
    padding: 8px 24px;
    background: #221f20;
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
  }
  .corps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    padding: 24px 24px 16px;
  }
  .visuel {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    padding: 16px;
    background: #f0c6da;
  }
  .visuel img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  /* La photo remplit toute la zone, sans marge. */
  .visuel-photo {
    padding: 0;
  }
  .visuel-photo img {
    object-fit: cover;
  }
  .visuel .cochon-seul {
    width: 80px;
    height: 77px;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
  .top img {
    width: 32px;
    height: 31px;
    flex: none;
    object-fit: contain;
  }
  .nom {
    margin: 0;
    padding: 0;
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    font-weight: 400;
    font-size: 27px;
    line-height: 1.1;
    color: #221f20;
  }
  .etiquettes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .etiquette {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px 4px 10px;
    border-radius: 20px;
    background: #f0c6da;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
  }
  /* Une info clé : même forme, mais blanche à cadre fin, pour la distinguer
     d'un critère rempli. */
  .etiquette.info {
    padding: 3px 12px;
    border: 1px solid #221f20;
    background: #ffffff;
  }
  .etiquette svg {
    width: 16px;
    height: 16px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .description {
    margin: 0;
  }
  .titre {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  /* La note Google, discrète, sur la ligne du nom. */
  .note {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex: none;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
  }
  .note svg {
    width: 16px;
    height: 16px;
    fill: #221f20;
  }
  .sur {
    font-weight: 400;
    color: #696561;
  }
  .points-cles {
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* Sur fond blanc, un cadre fin détache l'avis de la Compagnie. */
    margin: 4px 0 0;
    padding: 12px 16px;
    border: 1px solid #e6e2dc;
    border-radius: 4px;
    list-style: none;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
  }
  .points-cles li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .coeur {
    flex: none;
    width: 20px;
    height: 20px;
    fill: #f0c6da;
    stroke: #221f20;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  /* Les quatre boutons tiennent sur une ligne et se partagent la largeur,
     sur ordinateur comme sur téléphone. */
  .actions {
    display: flex;
    flex-wrap: nowrap;
    gap: 6px;
    padding: 0 24px 24px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* La hauteur comprend la marge intérieure et le trait. */
    box-sizing: border-box;
    flex: 1 1 auto;
    min-height: 40px;
    padding: 6px 8px;
    border: 1px solid #221f20;
    border-radius: 999px;
    background: #ffffff;
    color: #221f20;
    font-size: 14px;
    font-weight: 700;
    font-stretch: 87.5%;
    line-height: 1.2;
    text-decoration: none;
    white-space: nowrap;
    transition:
      background-color 0.2s,
      color 0.2s;
  }
  .btn-ico {
    width: 14px;
    height: 14px;
    flex: none;
    margin-right: 5px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .btn:hover {
    background: #221f20;
    color: #ffffff;
    opacity: 1;
  }
  .btn:focus-visible {
    outline: 3px solid #221f20;
    outline-offset: 3px;
  }
  /* Sur ordinateur, les cartes d'une rangée ont la même hauteur et leurs blocs
     s'alignent d'une carte à l'autre (sous-grille de 8 rangs partagés avec la
     grille des résultats). Un bloc absent laisse son rang vide : les suivants
     restent alignés. Les marges remplacent l'écart du flex de .corps. */
  @media (min-width: 768px) {
    .carte {
      display: grid;
      grid-row: span 8;
      grid-template-rows: subgrid;
      row-gap: 0;
      align-self: stretch;
      /* L'écart entre deux rangées de cartes (la grille n'en a plus sur
         ordinateur, sinon il s'ajouterait entre les blocs de chaque carte). */
      margin-bottom: 24px;
    }
    .corps {
      display: contents;
    }
    .corps > * {
      margin: 12px 24px 0;
    }
    .manque {
      grid-row: 1;
    }
    .visuel {
      grid-row: 2;
      margin-bottom: 12px;
    }
    .top {
      grid-row: 3;
    }
    .titre {
      grid-row: 4;
      align-self: start;
    }
    .etiquettes {
      grid-row: 5;
      align-self: start;
    }
    .description {
      grid-row: 6;
    }
    .points-cles {
      grid-row: 7;
      align-self: start;
      margin-top: 16px;
    }
    .actions {
      grid-row: 8;
      align-self: end;
      padding-top: 16px;
    }
  }
  @media (max-width: 767px) {
    .corps {
      padding: 20px 16px 12px;
    }
    .manque {
      padding: 8px 16px;
    }
    .visuel {
      height: 176px;
    }
    .actions {
      padding: 0 16px 20px;
    }
  }
  @media (max-width: 370px) {
    .btn {
      font-size: 13px;
    }
  }
  /* Très petits écrans (moins de 350 px) : les quatre boutons ne tiennent
     plus, ils passent à la ligne plutôt que de déborder de la carte. */
  @media (max-width: 349px) {
    .actions {
      flex-wrap: wrap;
    }
  }
  /* Le bouchon idéal : un bandeau rose en haut du visuel, un trait plus épais
     et une ombre noire décalée, sans changer les couleurs de la fiche. */
  .ideal {
    border-width: 2px;
    box-shadow: 8px 8px 0 #221f20;
  }
  .visuel {
    position: relative;
  }
  .bandeau-ideal {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 8px 24px;
    background: #f0c6da;
    border-bottom: 2px solid #221f20;
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    font-size: 22px;
    line-height: 1.2;
    color: #221f20;
  }
  .bandeau-ideal img {
    width: 32px;
    height: 31px;
    flex: none;
    object-fit: contain;
  }
  @media (max-width: 767px) {
    .bandeau-ideal {
      padding: 8px 16px;
    }
    /* Sur téléphone, l'ombre est plus courte pour ne pas toucher le bord. */
    .ideal {
      box-shadow: 6px 6px 0 #221f20;
    }
  }
</style>
