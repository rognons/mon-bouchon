<script lang="ts">
import { tick } from 'svelte';
import { BOUCHONS } from '../data/bouchons';
import { resumer } from '../recherche/phrase';
import {
  type Affinage,
  afficherAUnCriterePres,
  type Critere,
  passeAffinage,
  rechercher,
  type Tri,
  trier,
} from '../recherche/regles';
import ChoixDesCriteres from './search/ChoixDesCriteres.svelte';
import PanneauAffiner from './search/PanneauAffiner.svelte';
import Results from './search/Results.svelte';

// Les critères choisis dans le bandeau : le premier est le critère principal.
// biome-ignore lint/style/useConst: Bound to the criteria chooser
let criteres: Critere[] = [];

// La liste des bouchons s'affiche directement sous le bandeau.
const reduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// « Voir les N bouchons » : un raccourci qui descend jusqu'à la liste.
function voirLesResultats() {
  document
    .getElementById('resultats')
    ?.scrollIntoView({ behavior: reduit() ? 'auto' : 'smooth', block: 'start' });
}

// L'affinage, choisi dans le panneau « Affiner ».
// biome-ignore lint/style/useConst: Bound to the refine panel
let affinage: Affinage = {};
let panneauOuvert = false;

// Tri : par défaut, le top 10 de la Compagnie dans l'ordre, puis note Google, puis prix
// biome-ignore lint/style/useConst: Used in reactive bindings
let tri: Tri = 'defaut';

// Un critère principal passé dans le bandeau sort de l'affinage.
function sansDoublon(a: Affinage, choisis: Critere[]): Affinage {
  const { principaux = [], ...reste } = a;
  const gardes = principaux.filter((c) => !choisis.some((x) => x.type === c.type));
  return gardes.length ? { ...reste, principaux: gardes } : reste;
}

function chercher(a: Affinage, t: Tri = tri, choisis: Critere[] = criteres) {
  const effectif = sansDoublon(a, choisis);
  // Sans critère dans la phrase, tous les bouchons (affinés) sont des résultats.
  if (choisis.length === 0) {
    return {
      exacts: trier(
        BOUCHONS.filter((b) => passeAffinage(b, effectif)),
        t
      ),
      aUnCriterePres: [],
    };
  }
  return rechercher(
    BOUCHONS,
    { principal: choisis[0], complementaires: choisis.slice(1) },
    effectif,
    t
  );
}

// Les bouchons affichés pour un affinage : exacts et « à un critère près ».
function compter(a: Affinage): number {
  const r = chercher(a);
  return r.exacts.length + (afficherAUnCriterePres(r) ? r.aUnCriterePres.length : 0);
}

$: resultats = chercher(affinage, tri, criteres);
$: affinageEffectif = sansDoublon(affinage, criteres);

// Le nombre de choix faits dans l'affinage, sur le bouton « Affiner ».
$: nbChoix =
  (affinageEffectif.principaux?.length ?? 0) +
  (affinageEffectif.ambiances?.length ? 1 : 0) +
  (affinageEffectif.profil ? 1 : 0) +
  (affinageEffectif.portionsMinimum ? 1 : 0) +
  (
    [
      'coupDeCoeurCompagnie',
      'coupDeCoeurVins',
      'labelBouchonsLyonnais',
      'selectionAuthentiques',
      'terrasse',
      'decorationRemarquable',
      'equipeRemarquable',
    ] as const
  ).filter((k) => affinageEffectif[k]).length;

async function fermerPanneau() {
  panneauOuvert = false;
  await tick();
  // La fenêtre se referme sur place : la page reste là où on l'avait laissée.
  document.getElementById('bouton-affiner')?.focus({ preventScroll: true });
}

// « Modifier ma recherche » : on remonte au bandeau, au critère n°1.
async function modifierLaRecherche() {
  panneauOuvert = false;
  await tick();
  document
    .getElementById('critere-1')
    ?.scrollIntoView({ behavior: reduit() ? 'auto' : 'smooth', block: 'start' });
}
</script>

<ChoixDesCriteres
  bind:criteres
  nbExacts={resultats.exacts.length}
  nbProches={afficherAUnCriterePres(resultats) ? resultats.aUnCriterePres.length : 0}
  on:voir={voirLesResultats}
/>

<div class="rappel" id="resultats">
  <div class="rappel-int">
    <p class="rappel-texte">
      <span class="rappel-titre">Votre recherche</span>
      <span class="sr">Votre recherche : </span>{criteres.length
        ? criteres.map(resumer).join(' · ')
        : 'Tous les bouchons'}
    </p>
    <button
      type="button"
      id="bouton-affiner"
      class="affiner"
      aria-expanded={panneauOuvert}
      aria-controls="panneau-affiner"
      on:click={() => (panneauOuvert ? fermerPanneau() : (panneauOuvert = true))}
    >
      <svg class="ico" aria-hidden="true" viewBox="0 0 24 24"
        ><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle
          cx="10"
          cy="17"
          r="2"
        /></svg
      >
      Modifier ou affiner
      {#if nbChoix > 0}<span class="compteur" aria-label="{nbChoix} choix">{nbChoix}</span>{/if}
    </button>
  </div>
</div>

{#if panneauOuvert}
  <PanneauAffiner
    {criteres}
    {compter}
    bind:affinage
    on:fermer={fermerPanneau}
    on:modifier={modifierLaRecherche}
  />
{/if}

<div class="zone-resultats">
  <Results {resultats} {criteres} bind:tri />
</div>

<style>
  /* Le rappel des choix reste en haut de l'écran pendant qu'on parcourt les résultats. */
  .rappel {
    position: sticky;
    top: 0;
    z-index: 150;
    background: #ffffff;
    border-bottom: 1px solid #e6e2dc;
    font-family: 'Bricolage Grotesque', Arial, sans-serif;
    color: #221f20;
  }
  .rappel-int {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 32px;
  }
  /* Le rappel en une ligne de texte : le rose est réservé à ce qui est coché. */
  .rappel-texte {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rappel-titre {
    margin-right: 12px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #696561;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  .affiner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    flex: none;
    padding: 8px 18px 8px 16px;
    border: 1px solid #221f20;
    border-radius: 999px;
    background: #221f20;
    color: #ffffff;
    font: inherit;
    font-size: 17px;
    font-weight: 700;
    font-stretch: 87.5%;
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }
  .affiner:hover {
    background: #ffffff;
    color: #221f20;
  }
  .compteur {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: #f0c6da;
    color: #221f20;
    font-size: 14px;
    font-stretch: 100%;
  }
  .ico {
    width: 18px;
    height: 18px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
  }
  .rappel button:focus-visible {
    outline: 3px solid #221f20;
    outline-offset: 3px;
  }
  .zone-resultats {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 32px 48px;
  }
  @media (max-width: 767px) {
    .rappel-int {
      gap: 8px;
      padding: 8px 16px;
    }
    /* Sur téléphone, la barre ne garde que le bouton, sur toute la largeur :
       les critères choisis se relisent dans le panneau. */
    .rappel-texte {
      display: none;
    }
    .affiner {
      flex: 1;
      justify-content: center;
    }
    .zone-resultats {
      padding: 16px 16px 32px;
    }
  }
</style>
