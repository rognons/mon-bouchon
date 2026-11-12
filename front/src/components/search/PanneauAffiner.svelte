<script lang="ts">
// Le panneau « Affiner » : les critères principaux absents de la recherche,
// puis les critères secondaires, en pastilles rangées par famille
// (docs/adr/0003). Sur téléphone, plein écran et en accordéon (tout s'ouvre
// replié, un résumé des choix sous chaque titre) ; sur ordinateur, toutes les
// familles dépliées. Une pastille qui mènerait à zéro bouchon est indisponible.
import { createEventDispatcher, onMount, tick } from 'svelte';
import { BOUCHONS } from '../../data/bouchons';
import {
  type Ambiance,
  PORTIONS,
  type Portions,
  type ProfilMangeur,
  TYPES_BOUCHON,
  type TypeBouchon,
} from '../../data/referentiel';
import { JOURS, lieuxProposes, PALIERS, type TypeDeCritere } from '../../recherche/phrase';
import type { Affinage, Critere, PalierDePrix, Service } from '../../recherche/regles';
import FeuilleVege from '../FeuilleVege.svelte';
import CasesAvecLegende from './CasesAvecLegende.svelte';
import ChoixDesCriteres, { type Brouillon } from './ChoixDesCriteres.svelte';
import { CASES_AMBIANCE, CASES_PROFIL, CASES_TYPE_BOUCHON, type Case } from './cases';

// Les critères déjà choisis dans le bandeau : leurs familles n'apparaissent pas.
export let criteres: Critere[] = [];
// Les critères n°1 et n°2 en cours de choix, partagés avec le bandeau :
// on les modifie directement dans la fenêtre.
export let brouillons: Brouillon[] = [];
// Le nombre de bouchons affichés pour un affinage donné.
export let compter: (affinage: Affinage) => number;
export let affinage: Affinage = {};

const dispatch = createEventDispatcher<{ fermer: undefined }>();

type Valeur = string | number;
interface Champ {
  sousTitre?: string;
  multi?: boolean;
  options: { value: Valeur; label: string }[];
  // Des cases avec leur légende à la place des pastilles et des définitions.
  cases?: Case[];
}
interface Famille {
  id: string;
  titre: string;
  // Le critère principal que remplace cette famille, s'il y en a un.
  principal?: TypeDeCritere;
  champs: Champ[];
  definitions?: { terme: string; texte: string }[];
}

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

const FAMILLES: Famille[] = [
  {
    id: 'prix',
    titre: 'Prix',
    principal: 'prix',
    champs: [{ options: PALIERS.map((p) => ({ value: p.value, label: p.label })) }],
  },
  {
    id: 'lieu',
    titre: 'Lieu',
    principal: 'lieu',
    champs: [
      {
        multi: true,
        options: lieuxProposes(BOUCHONS).map((l) => ({ value: l.value, label: l.court })),
      },
    ],
  },
  {
    id: 'moment',
    titre: 'Jour et service',
    principal: 'moment',
    champs: [
      {
        sousTitre: 'Quel jour ? Plusieurs choix possibles',
        multi: true,
        options: JOURS.map((j) => ({
          value: j.value,
          label: majuscule(j.label.replace(/^le /, '')),
        })),
      },
      {
        sousTitre: 'Pour quel service ? Plusieurs choix possibles',
        multi: true,
        options: [
          { value: 'midi', label: 'Midi' },
          { value: 'soir', label: 'Soir' },
          { value: 'machon', label: 'Mâchon' },
        ],
      },
    ],
    definitions: [{ terme: 'Mâchon', texte: 'repas matinal typique de Lyon, sur réservation' }],
  },
  {
    id: 'typeBouchon',
    titre: 'Type de bouchon',
    principal: 'typeBouchon',
    champs: [
      {
        multi: true,
        options: TYPES_BOUCHON.map((t) => ({ value: t.code, label: majuscule(t.court ?? t.code) })),
        cases: CASES_TYPE_BOUCHON,
      },
    ],
  },
  {
    id: 'vegetarien',
    titre: 'Option végé',
    principal: 'vegetarien',
    champs: [{ options: [{ value: 'oui', label: 'Option végé' }] }],
  },
  {
    id: 'ambiance',
    titre: 'Ambiance',
    champs: [
      {
        multi: true,
        options: CASES_AMBIANCE,
        cases: CASES_AMBIANCE,
      },
    ],
  },
  {
    id: 'profil',
    titre: 'Profil de mangeur',
    champs: [
      {
        options: CASES_PROFIL,
        cases: CASES_PROFIL,
      },
    ],
  },
  {
    id: 'portions',
    titre: 'Des portions au moins',
    champs: [
      {
        options: PORTIONS.map((p) => ({ value: p.code, label: majuscule(p.court ?? p.code) })),
      },
    ],
  },
  {
    id: 'distinctions',
    titre: 'Distinctions',
    champs: [
      {
        multi: true,
        options: [
          { value: 'coupDeCoeurCompagnie', label: 'Top 10 de la Compagnie' },
          { value: 'coupDeCoeurVins', label: 'Coup de cœur vins' },
          { value: 'labelBouchonsLyonnais', label: 'Label « Les Bouchons Lyonnais »' },
          { value: 'selectionAuthentiques', label: 'Sélection Authentiques' },
        ],
      },
    ],
  },
  {
    id: 'options',
    titre: 'Options',
    champs: [
      {
        multi: true,
        options: [
          { value: 'terrasse', label: 'Terrasse' },
          { value: 'decorationRemarquable', label: 'Décoration remarquable' },
          { value: 'equipeRemarquable', label: 'Personnel remarquable' },
        ],
      },
    ],
  },
];

type Selection = Record<string, Valeur[][]>;
const vide = (): Selection =>
  Object.fromEntries(FAMILLES.map((f) => [f.id, f.champs.map(() => [] as Valeur[])]));

let sel: Selection = selectionDepuis(affinage);

// Retrouve les pastilles cochées à partir de l’affinage, quand on rouvre le panneau.
function selectionDepuis(a: Affinage): Selection {
  const s = vide();
  for (const c of a.principaux ?? []) {
    if (c.type === 'prix') s.prix[0] = [c.palier];
    if (c.type === 'lieu') s.lieu[0] = [...c.valeurs];
    if (c.type === 'moment') s.moment = [[...c.jours], [...c.services]];
    if (c.type === 'typeBouchon') s.typeBouchon[0] = [...c.valeurs];
    if (c.type === 'vegetarien') s.vegetarien[0] = ['oui'];
  }
  s.ambiance[0] = [...(a.ambiances ?? [])];
  if (a.profil) s.profil[0] = [a.profil];
  if (a.portionsMinimum) s.portions[0] = [a.portionsMinimum];
  const drapeaux = (cles: string[]) => cles.filter((k) => a[k as keyof Affinage] === true);
  s.distinctions[0] = drapeaux([
    'coupDeCoeurCompagnie',
    'coupDeCoeurVins',
    'labelBouchonsLyonnais',
    'selectionAuthentiques',
  ]);
  s.options[0] = drapeaux(['terrasse', 'decorationRemarquable', 'equipeRemarquable']);
  return s;
}

// Les familles proposées : pas celles des critères déjà choisis dans le bandeau.
$: familles = FAMILLES.filter((f) => !f.principal || !criteres.some((c) => c.type === f.principal));

function versAffinage(s: Selection, visibles: Famille[]): Affinage {
  const ids = new Set(visibles.map((f) => f.id));
  const a: Affinage = { principaux: [] };
  const principaux = a.principaux as Critere[];
  if (ids.has('prix') && s.prix[0].length) {
    principaux.push({ type: 'prix', palier: s.prix[0][0] as PalierDePrix });
  }
  if (ids.has('lieu') && s.lieu[0].length) {
    principaux.push({ type: 'lieu', valeurs: s.lieu[0] as string[] });
  }
  if (ids.has('moment') && s.moment[0].length && s.moment[1].length) {
    principaux.push({
      type: 'moment',
      jours: s.moment[0] as number[],
      services: s.moment[1] as Service[],
    });
  }
  if (ids.has('typeBouchon') && s.typeBouchon[0].length) {
    principaux.push({ type: 'typeBouchon', valeurs: s.typeBouchon[0] as TypeBouchon[] });
  }
  if (ids.has('vegetarien') && s.vegetarien[0].length) principaux.push({ type: 'vegetarien' });
  if (s.ambiance[0].length) a.ambiances = s.ambiance[0] as Ambiance[];
  if (s.profil[0].length) a.profil = s.profil[0][0] as ProfilMangeur;
  if (s.portions[0].length) a.portionsMinimum = s.portions[0][0] as Portions;
  for (const k of [...s.distinctions[0], ...s.options[0]]) {
    (a as Record<string, unknown>)[k as string] = true;
  }
  return a;
}

// Un critère de famille est actif quand il filtre vraiment (jour ET service).
const estActive = (f: Famille, s: Selection) =>
  f.id === 'moment' ? s.moment[0].length > 0 && s.moment[1].length > 0 : s[f.id][0].length > 0;

$: affinage = versAffinage(sel, familles);
$: nbBouchons = compter(affinage);

function avecChoix(s: Selection, f: Famille, j: number, value: Valeur): Selection {
  const champ = f.champs[j];
  const actuelles = s[f.id][j];
  const nouvelles = champ.multi
    ? actuelles.includes(value)
      ? actuelles.filter((v) => v !== value)
      : [...actuelles, value]
    : actuelles.includes(value)
      ? []
      : [value];
  return { ...s, [f.id]: s[f.id].map((c, k) => (k === j ? nouvelles : c)) };
}

// Une pastille non cochée est indisponible si la cocher ne laissait aucun bouchon.
const indisponible = (s: Selection, visibles: Famille[], f: Famille, j: number, value: Valeur) =>
  !s[f.id][j].includes(value) && compter(versAffinage(avecChoix(s, f, j, value), visibles)) === 0;

function choisir(f: Famille, j: number, value: Valeur) {
  sel = avecChoix(sel, f, j, value);
}

function reinitialiser() {
  sel = vide();
}

const resume = (f: Famille, s: Selection) =>
  f.champs
    .flatMap((c, j) => c.options.filter((o) => s[f.id][j].includes(o.value)).map((o) => o.label))
    .join(', ');

$: nbActives = familles.filter((f) => estActive(f, sel)).length;
$: texteVoir =
  nbBouchons > 1
    ? `Voir les ${nbBouchons} bouchons`
    : nbBouchons === 1
      ? 'Voir le bouchon'
      : 'Fermer';

// Sur téléphone, accordéon : tout s'ouvre replié.
let mobile = false;
let ouverts: Record<string, boolean> = {};
let titre: HTMLElement;
onMount(() => {
  const requete = window.matchMedia('(max-width: 767px)');
  mobile = requete.matches;
  const suivre = (e: MediaQueryListEvent) => {
    mobile = e.matches;
  };
  requete.addEventListener('change', suivre);
  tick().then(() => titre?.focus());
  return () => {
    requete.removeEventListener('change', suivre);
    document.body.style.overflow = '';
  };
});

// Le panneau s'ouvre par-dessus la page : derrière lui, la page ne défile pas.
onMount(() => {
  document.body.style.overflow = 'hidden';
});

function basculer(id: string) {
  ouverts = { ...ouverts, [id]: !ouverts[id] };
}

function surTouche(e: KeyboardEvent) {
  if (e.key === 'Escape') dispatch('fermer');
}

const PLUS = 'M12 5v14M5 12h14';
const COCHE = 'M5 12l5 5 9-10';
</script>

<svelte:window on:keydown={surTouche} />

<div
  id="panneau-affiner"
  class="panneau"
  class:mobile
  role="dialog"
  aria-modal="true"
  aria-labelledby="titre-affiner"
>
  <div class="tete">
    <h2 id="titre-affiner" class="titre" tabindex="-1" bind:this={titre}>Modifier ou affiner</h2>
    <button type="button" class="fermer" aria-label="Fermer l’affinage" on:click={() => dispatch('fermer')}>
      <svg class="ico" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  </div>

  <div class="corps">
    <!-- Les critères n°1 et n°2 se modifient ici, comme dans le bandeau. -->
    <div class="recherche">
      <p class="libelle">Votre recherche</p>
      <ChoixDesCriteres dansFenetre bind:brouillons />
    </div>
    <p class="libelle titre-affiner">Affiner</p>
    {#each familles as f (f.id)}
      {@const ouverte = !mobile || Boolean(ouverts[f.id])}
      {@const choix = resume(f, sel)}
      <div class="famille" role="group" aria-labelledby="famille-{f.id}">
        {#if mobile}
          <button
            type="button"
            class="entete"
            id="famille-{f.id}"
            aria-expanded={ouverte}
            on:click={() => basculer(f.id)}
          >
            <span class="entete-texte">
              <span class="entete-titre">{f.titre}</span>
              {#if choix}<span class="entete-resume">{choix}</span>{/if}
            </span>
            <svg class="chevron" class:chevron-ouvert={ouverte} aria-hidden="true" viewBox="0 0 24 24"
              ><path d="M6 9l6 6 6-6" /></svg
            >
          </button>
        {:else}
          <p class="libelle" id="famille-{f.id}">{f.titre}</p>
        {/if}

        {#if ouverte}
          <div class="contenu">
            {#each f.champs as champ, j}
              {#if champ.sousTitre}<p class="libelle">{champ.sousTitre}</p>{/if}
              {#if champ.cases}
                <CasesAvecLegende
                  options={champ.cases}
                  choisies={sel[f.id][j]}
                  indisponible={(v) => indisponible(sel, familles, f, j, v)}
                  on:choisir={(e) => choisir(f, j, e.detail)}
                />
              {:else}
              <ul class="puces">
                {#each champ.options as o (o.value)}
                  {@const on = sel[f.id][j].includes(o.value)}
                  {@const off = indisponible(sel, familles, f, j, o.value)}
                  <li>
                    <button
                      type="button"
                      class="puce"
                      class:puce-on={on}
                      class:puce-off={off}
                      aria-pressed={on}
                      aria-disabled={off}
                      disabled={off}
                      title={off ? 'Aucun bouchon avec ce choix' : undefined}
                      on:click={() => choisir(f, j, o.value)}
                    >
                      <svg class="ico" aria-hidden="true" viewBox="0 0 24 24"
                        ><path d={on ? COCHE : PLUS} /></svg
                      >
                      {#if f.id === 'vegetarien'}<FeuilleVege />{/if}
                      {o.label}{#if off}<span class="sr">{' (indisponible)'}</span>{/if}
                    </button>
                  </li>
                {/each}
              </ul>
              {/if}
            {/each}
            {#if f.definitions}
              <ul class="definitions">
                {#each f.definitions as d}
                  <li>
                    <svg class="ampoule" aria-hidden="true" viewBox="0 0 24 24"
                      ><path
                        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"
                      /></svg
                    >
                    <span><strong>{d.terme}</strong>{' : '}{d.texte}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="pied">
    {#if nbBouchons === 0}<p class="vide" role="status">Aucun bouchon avec tous ces choix.</p>{/if}
    {#if nbActives > 0}
      <button type="button" class="btn" on:click={reinitialiser}>Réinitialiser</button>
    {/if}
    <button type="button" class="btn btn-principal" on:click={() => dispatch('fermer')}>{texteVoir}</button>
  </div>
</div>

<style>
  .panneau {
    --rose: #f0c6da;
    --noir: #221f20;
    --blanc: #ffffff;
    --gris: #e6e2dc;
    --texte-secondaire: #696561;
    background: var(--blanc);
    color: var(--noir);
    font-family: 'Bricolage Grotesque', Arial, sans-serif;
    font-size: 17px;
    line-height: 1.6;
    border-bottom: 1px solid var(--gris);
  }
  .panneau,
  .panneau :global(*) {
    box-sizing: border-box;
  }
  .panneau :global(:focus-visible) {
    outline: 3px solid var(--noir);
    outline-offset: 3px;
  }
  /* Ordinateur comme téléphone : plein écran, par-dessus la page.
     Sur ordinateur, le contenu reste centré sur 1200 px de large. */
  .panneau {
    --marge: max(32px, calc((100% - 1200px) / 2 + 32px));
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    flex-direction: column;
    border: 0;
  }
  .tete {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px var(--marge);
    border-bottom: 1px solid var(--gris);
  }
  .titre {
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    font-weight: 400;
    font-size: 27px;
    line-height: 1.1;
    margin: 0;
    padding: 0;
    color: var(--noir);
  }
  .corps {
    flex: 1;
    min-height: 0;
    overflow: auto;
    width: 100%;
    margin: 0;
    padding: 24px var(--marge);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
    gap: 28px 40px;
  }
  .recherche {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--gris);
  }
  .titre-affiner {
    grid-column: 1 / -1;
    margin-bottom: -16px;
  }
  .famille {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .libelle {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    line-height: 1.4;
    color: var(--texte-secondaire);
  }
  .contenu {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .puces {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .puce {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 8px 16px 8px 14px;
    border: 1px solid var(--noir);
    border-radius: 20px;
    background: transparent;
    color: var(--noir);
    font: inherit;
    font-weight: 600;
    line-height: 1.2;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }
  .puce:hover {
    background: var(--gris);
  }
  .puce-on,
  .puce-on:hover {
    background: var(--noir);
    color: var(--blanc);
  }
  /* Indisponible : pointillés et texte gris, sans transparence. */
  .puce-off,
  .puce-off:hover {
    border-style: dashed;
    border-color: var(--texte-secondaire);
    color: var(--texte-secondaire);
    background: transparent;
    cursor: not-allowed;
  }
  .ico {
    width: 18px;
    height: 18px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
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
  .definitions li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .ampoule {
    width: 18px;
    height: 18px;
    flex: none;
    margin-top: 1px;
    fill: none;
    stroke: var(--noir);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .definitions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 14px;
    line-height: 1.5;
    color: var(--texte-secondaire);
  }
  .definitions strong {
    font-weight: 600;
    color: var(--noir);
  }
  .pied {
    width: 100%;
    margin: 0;
    padding: 16px var(--marge);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid var(--gris);
  }
  .vide {
    margin: 0 auto 0 0;
    font-weight: 600;
  }
  .btn,
  .fermer {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 20px;
    border: 1px solid var(--noir);
    border-radius: 999px;
    background: var(--blanc);
    color: var(--noir);
    font: inherit;
    font-weight: 700;
    font-stretch: 87.5%;
    line-height: 1.2;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;
  }
  .btn:hover,
  .fermer:hover {
    background: var(--noir);
    color: var(--blanc);
  }
  .btn-principal {
    background: var(--rose);
  }
  .fermer {
    width: 44px;
    padding: 0;
  }

  /* Téléphone : plein écran, en accordéon */
  .mobile {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    flex-direction: column;
    border: 0;
  }
  .mobile .tete {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--gris);
  }
  .mobile .corps {
    flex: 1;
    width: 100%;
    margin: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0 16px 16px;
  }
  .mobile .recherche {
    margin-top: 16px;
  }
  .mobile .titre-affiner {
    margin: 24px 0 0;
  }
  .mobile .famille {
    gap: 0;
  }
  .mobile .contenu {
    padding: 12px 0 16px;
    border-bottom: 1px solid var(--gris);
  }
  .mobile .pied {
    margin: 0;
    padding: 12px 16px;
    width: 100%;
    background: var(--blanc);
  }
  .mobile .btn-principal {
    flex: 1;
  }
  .entete {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: 56px;
    padding: 8px 0;
    border: 0;
    border-bottom: 1px solid var(--gris);
    background: transparent;
    color: var(--noir);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .entete-texte {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .entete-titre {
    font-weight: 600;
    line-height: 1.3;
  }
  .entete-resume {
    font-size: 14px;
    line-height: 1.4;
    color: var(--texte-secondaire);
  }
  .chevron {
    width: 20px;
    height: 20px;
    flex: none;
    fill: none;
    stroke: var(--noir);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.2s;
  }
  .chevron-ouvert {
    transform: rotate(180deg);
  }
</style>
