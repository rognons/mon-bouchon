<script lang="ts">
// Des cases à choisir, chacune avec une icône, un titre en gras et sa légende
// juste en dessous : la définition se lit sur la case elle-même, au lieu d'une
// liste séparée sous les pastilles. Essayé d'abord sur « Type de bouchon ».
import { createEventDispatcher } from 'svelte';
import type { Case } from './casesTypeBouchon';

type Valeur = string | number;

export let options: Case[] = [];
export let choisies: Valeur[] = [];
// Une case qui ne mènerait à aucun bouchon est indisponible.
export let indisponible: (value: Valeur) => boolean = () => false;

const dispatch = createEventDispatcher<{ choisir: Valeur }>();

const PLUS = 'M12 5v14M5 12h14';
const COCHE = 'M5 12l5 5 9-10';
</script>

<ul class="cases">
  {#each options as o (o.value)}
    {@const on = choisies.includes(o.value)}
    {@const off = !on && indisponible(o.value)}
    <li>
      <button
        type="button"
        class="case"
        class:case-on={on}
        class:case-off={off}
        aria-pressed={on}
        aria-disabled={off}
        disabled={off}
        title={off ? 'Aucun bouchon avec ce choix' : undefined}
        on:click={() => dispatch('choisir', o.value)}
      >
        <span class="haut">
          <svg class="icone" aria-hidden="true" viewBox="0 0 24 24">
            {#each o.icone as d}<path {d} />{/each}
          </svg>
          <svg class="etat" aria-hidden="true" viewBox="0 0 24 24"><path d={on ? COCHE : PLUS} /></svg>
        </span>
        <span class="nom">{o.label}</span>
        <span class="legende">{o.legende}</span>
        {#if off}<span class="sr">{' (indisponible)'}</span>{/if}
      </button>
    </li>
  {/each}
</ul>

<style>
  .cases {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 12px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .cases li {
    display: flex;
  }
  .case {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
    padding: 16px;
    border: 1px solid #cfc9c1;
    border-radius: 8px;
    background: #ffffff;
    color: #221f20;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background-color 0.2s,
      color 0.2s;
  }
  .case:hover {
    border-color: #221f20;
  }
  .case-on,
  .case-on:hover {
    border-color: #221f20;
    background: #221f20;
    color: #ffffff;
  }
  /* Indisponible : pointillés et texte gris, comme les pastilles. */
  .case-off,
  .case-off:hover {
    border-style: dashed;
    border-color: #696561;
    color: #696561;
    cursor: not-allowed;
  }
  .haut {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
  }
  .icone,
  .etat {
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .icone {
    width: 32px;
    height: 32px;
    stroke-width: 1.5;
  }
  .etat {
    width: 18px;
    height: 18px;
    stroke-width: 3;
  }
  .nom {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.25;
  }
  .legende {
    font-size: 15px;
    line-height: 1.4;
    color: #696561;
  }
  .case-on .legende {
    color: #e6e2dc;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
