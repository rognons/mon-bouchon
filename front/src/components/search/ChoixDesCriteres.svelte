<script lang="ts" context="module">
import type { TypeDeCritere as Type } from '../../recherche/phrase';
// Un critère en cours de choix : ses valeurs, champ par champ.
// Partagé entre le bandeau et la fenêtre « Modifier ou affiner ».
export interface Brouillon {
  type: Type;
  choix: (string | number)[][];
}
</script>

<script lang="ts">
// Le bandeau d'accueil : deux questions, chacune avec ses critères principaux
// en pastilles, puis leurs valeurs, et le bouton « Voir les N bouchons ».
// La liste s'affiche déjà juste en dessous et se met à jour à chaque choix :
// le bouton est un raccourci pour y descendre, utile surtout sur téléphone.
// Le premier critère complet est le critère principal, le second le critère
// complémentaire (docs/adr/0003).
import { BOUCHONS } from '../../data/bouchons';
import { TYPES_BOUCHON, type TypeBouchon } from '../../data/referentiel';
import {
  JOURS,
  lieuxProposes,
  nomDuCritere,
  PALIERS,
  TYPES_DE_CRITERE,
  type TypeDeCritere,
} from '../../recherche/phrase';
import type { Critere, PalierDePrix, Service } from '../../recherche/regles';
import { createEventDispatcher } from 'svelte';
import FeuilleVege from '../FeuilleVege.svelte';
import CasesAvecLegende from './CasesAvecLegende.svelte';
import { type Case, CASES_TYPE_BOUCHON } from './cases';

export let criteres: Critere[] = [];
// Les critères en cours de choix : la même liste dans le bandeau et dans la
// fenêtre « Modifier ou affiner », pour qu'une modification se voie partout.
export let brouillons: Brouillon[] = [];
// Dans la fenêtre « Modifier ou affiner » : seulement les deux questions,
// sans logo, titre ni bouton, sur fond blanc.
export let dansFenetre = false;
export let nbExacts = 0;
export let nbProches = 0;

const dispatch = createEventDispatcher<{ voir: undefined }>();

$: texteVoir =
  nbExacts > 1
    ? `Voir les ${nbExacts} bouchons →`
    : nbExacts === 1
      ? 'Voir le bouchon →'
      : nbProches > 0
        ? 'Voir les bouchons les plus proches →'
        : 'Voir le résultat →';

type Valeur = string | number;
interface Champ {
  titre: string;
  multi?: boolean;
  options: { value: Valeur; label: string }[];
  // Des définitions courtes sous les pastilles, une ligne par terme, quand les
  // mots ne suffisent pas. Le terme reprend le libellé de la pastille.
  definitions?: { terme?: string; texte: string }[];
  // Des cases avec leur légende à la place des pastilles (essai sur « Type de bouchon »).
  cases?: Case[];
}

// Une pastille porte toujours une icône de même largeur : « + » au repos,
// « ✓ » une fois choisie. Elle ne change donc pas de taille au clic, et les
// pastilles voisines ne bougent pas.
const PLUS = 'M12 5v14M5 12h14';
const COCHE = 'M5 12l5 5 9-10';

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

// Les valeurs de chaque critère, telles qu'elles s'affichent en pastilles.
const CHAMPS: Record<TypeDeCritere, Champ[]> = {
  prix: [
    {
      titre: 'Un menu à',
      options: PALIERS.map((p) => ({ value: p.value, label: p.label })),
      // Texte provisoire, à faire valider par la Compagnie.
      definitions: [{ texte: 'Prix du menu le moins cher' }],
    },
  ],
  lieu: [
    {
      titre: 'Où ? Plusieurs choix possibles',
      multi: true,
      options: lieuxProposes(BOUCHONS).map((l) => ({ value: l.value, label: l.court })),
    },
  ],
  moment: [
    {
      titre: 'Quel jour ? Plusieurs choix possibles',
      multi: true,
      options: JOURS.map((j) => ({
        value: j.value,
        label: majuscule(j.label.replace(/^le /, '')),
      })),
    },
    {
      titre: 'Pour quel service ? Plusieurs choix possibles',
      multi: true,
      options: [
        { value: 'midi', label: 'Midi' },
        { value: 'soir', label: 'Soir' },
        { value: 'machon', label: 'Mâchon' },
      ],
      definitions: [{ terme: 'Mâchon', texte: 'repas matinal typique de Lyon, sur réservation' }],
    },
  ],
  typeBouchon: [
    {
      titre: 'Quel style ? Plusieurs choix possibles',
      multi: true,
      options: TYPES_BOUCHON.map((t) => ({ value: t.code, label: majuscule(t.court ?? t.code) })),
      cases: CASES_TYPE_BOUCHON,
    },
  ],
  vegetarien: [],
};

let message = '';

const complet = (b: Brouillon) => CHAMPS[b.type].every((_, j) => b.choix[j].length > 0);

function versCritere(b: Brouillon): Critere | null {
  if (!complet(b)) return null;
  const [premier = [], second = []] = b.choix;
  switch (b.type) {
    case 'prix':
      return { type: 'prix', palier: premier[0] as PalierDePrix };
    case 'lieu':
      return { type: 'lieu', valeurs: premier as string[] };
    case 'moment':
      return { type: 'moment', jours: premier as number[], services: second as Service[] };
    case 'typeBouchon':
      return { type: 'typeBouchon', valeurs: premier as TypeBouchon[] };
    case 'vegetarien':
      return { type: 'vegetarien' };
  }
}

// Le second critère ne compte que si le premier est complet.
$: criteres = (() => {
  const principal = brouillons[0] ? versCritere(brouillons[0]) : null;
  if (!principal) return [];
  const complementaire = brouillons[1] ? versCritere(brouillons[1]) : null;
  return complementaire ? [principal, complementaire] : [principal];
})();

// Les valeurs d'un critère se replient dès qu'il est complet : la pastille
// affiche alors la valeur choisie (« Traditionnel » au lieu de « Type de
// bouchon »). Recliquer la pastille rouvre les valeurs ; la recliquer encore
// retire le critère. Un critère incomplet garde toujours ses valeurs ouvertes.
// Lieu et Jour et service, où l'on coche plusieurs valeurs à la suite,
// restent ouverts. « Type de bouchon » se replie (on peut rouvrir pour en
// ajouter un autre).
const SE_REPLIE: TypeDeCritere[] = ['prix', 'typeBouchon'];
let rouverts: boolean[] = [false, false];
$: ouverts = [0, 1].map((rang) => {
  const b = brouillons[rang];
  return b !== undefined && (!SE_REPLIE.includes(b.type) || !complet(b) || rouverts[rang]);
});

// Le texte de la pastille une fois le critère complet : la valeur choisie,
// ou la première suivie du nombre d'autres (« Croix-Rousse +2 »). Pour
// « Jour et service », les deux parties : « Samedi · Soir ».
function resume(b: Brouillon): string {
  return CHAMPS[b.type]
    .map((champ, j) => {
      const labels = champ.options.filter((o) => b.choix[j].includes(o.value)).map((o) => o.label);
      return labels.length > 1 ? `${labels[0]} +${labels.length - 1}` : labels[0];
    })
    .join(' · ');
}

$: montrerSecond = brouillons.length > 1 || (brouillons[0] !== undefined && complet(brouillons[0]));

function retirer(rang: number) {
  const suivants = brouillons.filter((_, i) => i !== rang);
  rouverts = [false, false];
  message =
    rang === 0 && suivants.length
      ? `« ${nomDuCritere(suivants[0].type)} » devient ce qui compte le plus.`
      : '';
  brouillons = suivants;
}

function choisirCritere(rang: number, type: TypeDeCritere) {
  const actuel = brouillons[rang];
  if (actuel?.type === type) {
    // Replié : on rouvre ses valeurs. Ouvert : on le retire.
    if (!ouverts[rang]) rouverts = rouverts.map((r, i) => (i === rang ? true : r));
    else retirer(rang);
    return;
  }
  rouverts = rouverts.map((r, i) => (i === rang ? false : r));
  let suivants = [...brouillons];
  suivants[rang] = { type, choix: CHAMPS[type].map(() => []) };
  // Le critère choisi en premier ne peut pas rester aussi en second.
  if (rang === 0 && suivants[1]?.type === type) suivants = suivants.slice(0, 1);
  brouillons = suivants;
  message = '';
}

function choisirValeur(rang: number, champ: number, value: Valeur) {
  const b = brouillons[rang];
  const def = CHAMPS[b.type][champ];
  const actuelles = b.choix[champ];
  let nouvelles: Valeur[];
  if (def.multi) {
    nouvelles = actuelles.includes(value)
      ? actuelles.filter((v) => v !== value)
      : def.options.map((o) => o.value).filter((v) => v === value || actuelles.includes(v));
  } else {
    nouvelles = actuelles.includes(value) ? [] : [value];
  }
  const modifie = { ...b, choix: b.choix.map((c, j) => (j === champ ? nouvelles : c)) };
  brouillons = brouillons.map((x, i) => (i === rang ? modifie : x));
  // Chaque choix replie les valeurs (si le critère est complet).
  rouverts = rouverts.map((r, i) => (i === rang ? false : r));
  message = '';
}

const typesProposes = (rang: number) =>
  TYPES_DE_CRITERE.filter((t) => rang === 0 || t.type !== brouillons[0]?.type);
</script>

<svelte:element this={dansFenetre ? 'div' : 'header'} class="bandeau" class:fenetre={dansFenetre}>
  {#if !dansFenetre}
  <!-- Les effets des affiches de la Compagnie : une trame de points en haut à
       droite, un damier noir et blanc en bas. Purement décoratifs. -->
  <div class="trame" aria-hidden="true"></div>
  <div class="damier" aria-hidden="true"></div>
  {/if}
  <div class="conteneur bandeau-int">
    {#if !dansFenetre}
    <a class="logo-lien" href="https://rognons.fr">
      <img class="logo" src="/logo-compagnie-image-text-black.png" alt="La Compagnie du Rognon" />
    </a>

    <!-- Espace insécable : « bouchon lyonnais » ne se coupe jamais. -->
    <h1 class="titre">Trouvez votre bouchon&nbsp;lyonnais</h1>
    {/if}

    {#each [0, 1] as rang}
      {#if rang === 0 || montrerSecond}
        <div class="etape" role="group" aria-labelledby="{dansFenetre ? 'fenetre-' : ''}critere-{rang + 1}">
          <!-- Espaces insécables avant « ? » (typographie française). -->
          {#if rang === 0}
            <h2 id="{dansFenetre ? 'fenetre-' : ''}critere-1" class="question">Quel est votre critère n°1&nbsp;?</h2>
          {:else}
            <h2 id="{dansFenetre ? 'fenetre-' : ''}critere-2" class="question">
              Et quel est votre critère n°2&nbsp;? <span class="facultatif">Facultatif</span>
            </h2>
          {/if}

          <ul class="puces">
            {#each typesProposes(rang) as t (t.type)}
              {@const choisi = brouillons[rang]?.type === t.type}
              {@const valeur = choisi && !ouverts[rang] && CHAMPS[t.type].length > 0 ? resume(brouillons[rang]) : ''}
              <li>
                <button
                  type="button"
                  class="puce"
                  class:puce-choisie={choisi}
                  aria-pressed={choisi}
                  aria-expanded={CHAMPS[t.type].length > 0 && choisi ? ouverts[rang] : undefined}
                  aria-label={valeur ? `${t.nom} : ${valeur}` : undefined}
                  title={valeur ? t.nom : undefined}
                  on:click={() => choisirCritere(rang, t.type)}
                >
                  <svg class="coche" aria-hidden="true" viewBox="0 0 24 24"
                    ><path d={choisi ? COCHE : PLUS} /></svg
                  >
                  {#if t.type === 'vegetarien'}<FeuilleVege />{/if}
                  {valeur || t.nom}
                </button>
              </li>
            {/each}
          </ul>

          {#if ouverts[rang] && CHAMPS[brouillons[rang].type].length > 0}
            <div class="valeurs">
              {#each CHAMPS[brouillons[rang].type] as champ, j}
                <div class="groupe" role="group" aria-label={champ.titre}>
                  <p class="groupe-titre">{champ.titre}</p>
                  {#if champ.cases}
                    <CasesAvecLegende
                      options={champ.cases}
                      choisies={brouillons[rang].choix[j]}
                      on:choisir={(e) => choisirValeur(rang, j, e.detail)}
                    />
                  {:else}
                  <ul class="puces">
                    {#each champ.options as option (option.value)}
                      {@const coche = brouillons[rang].choix[j].includes(option.value)}
                      <li>
                        <button
                          type="button"
                          class="puce"
                          class:puce-choisie={coche}
                          aria-pressed={coche}
                          on:click={() => choisirValeur(rang, j, option.value)}
                        >
                          <svg class="coche" aria-hidden="true" viewBox="0 0 24 24"
                            ><path d={coche ? COCHE : PLUS} /></svg
                          >
                          {option.label}
                        </button>
                      </li>
                    {/each}
                  </ul>
                  {/if}
                  {#if champ.definitions}
                    <ul class="definitions">
                      {#each champ.definitions as d}
                        <li>
                          <!-- Ampoule « bon à savoir » devant chaque ligne : repère décoratif, qui ne ressemble pas à un bouton. -->
                          <svg class="picto-info" aria-hidden="true" viewBox="0 0 24 24"
                            ><path
                              d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"
                            /></svg
                          >
                          <!-- « Terme : texte », avec une espace insécable avant les deux-points. -->
                          <span>{#if d.terme}<strong>{d.terme}</strong>{' : '}{/if}{d.texte}</span>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}

    {#if dansFenetre}
      {#if message}<p class="statut" role="status">{message}</p>{/if}
    {:else}
    <div class="voir" id="voir-les-bouchons">
      <button type="button" class="bouton" on:click={() => dispatch('voir')}>{texteVoir}</button>
      <p class="statut" role="status">{message}</p>
    </div>
    {/if}
  </div>
</svelte:element>

<style>
  .bandeau {
    --rose: #f0c6da;
    --noir: #221f20;
    --blanc: #ffffff;
    --gris: #e6e2dc;
    --texte-secondaire: #696561;
    background: var(--rose);
    color: var(--noir);
    font-family: 'Bricolage Grotesque', Arial, sans-serif;
    font-size: 17px;
    line-height: 1.6;
    padding: 24px 0 48px;
    /* Le rose ne prend que la place des questions : la liste des bouchons
       commence juste en dessous. */
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }
  /* Une grille de points identiques (un tous les 6 px), déjà adoucis dans
     l'angle haut droit (35 % d'opacité, comme sur les affiches), puis de plus
     en plus transparents en s'éloignant. */
  .trame {
    position: absolute;
    top: 0;
    right: 0;
    width: 320px;
    height: 320px;
    pointer-events: none;
    background: radial-gradient(circle, var(--noir) 1.3px, transparent 1.6px) 0 0 / 6px 6px;
    -webkit-mask-image: radial-gradient(circle at top right, rgb(0 0 0 / 35%) 0, transparent 320px);
    mask-image: radial-gradient(circle at top right, rgb(0 0 0 / 35%) 0, transparent 320px);
  }
  .damier {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 16px;
    /* Deux rangées de carrés de 8 px, noir et blanc. */
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23ffffff'/%3E%3Crect width='8' height='8' fill='%23221f20'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23221f20'/%3E%3C/svg%3E")
      repeat-x;
  }
  .conteneur {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }
  .bandeau-int {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .logo-lien {
    align-self: flex-start;
  }
  .logo {
    display: block;
    height: 64px;
    width: auto;
  }
  .etape {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 900px;
  }
  .titre,
  .question {
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    font-weight: 400;
    color: var(--noir);
    margin: 0;
    padding: 0;
  }
  .titre {
    font-size: 36px;
    line-height: 1.05;
  }
  /* La première question suit le titre de près : ils forment un tout. */
  .titre + .etape {
    margin-top: -16px;
  }
  /* Style « chapeau » de la charte (sous-titre de bandeau) : le titre reste
     seul en Gilton, la question se lit comme une consigne. */
  .question {
    font-family: 'Bricolage Grotesque', Arial, sans-serif;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.3;
  }
  /* En noir : le gris secondaire n'est pas assez contrasté sur le rose. */
  .facultatif {
    display: inline-block;
    margin-left: 4px;
    font-family: 'Bricolage Grotesque', Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    line-height: 1.4;
    vertical-align: middle;
    white-space: nowrap;
  }
  .puces {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  /* Sur téléphone, pastilles resserrées pour que les 5 critères tiennent
     sur 2 lignes malgré l'icône ; la hauteur reste de 44 px. */
  .puce {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 44px;
    padding: 8px 12px 8px 10px;
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
    background: var(--blanc);
  }
  .puce-choisie,
  .puce-choisie:hover {
    background: var(--noir);
    color: var(--blanc);
  }
  .coche {
    width: 16px;
    height: 16px;
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .valeurs {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: var(--blanc);
    border-radius: 4px;
  }
  .valeurs .puce:hover {
    background: var(--gris);
  }
  .valeurs .puce-choisie,
  .valeurs .puce-choisie:hover {
    background: var(--noir);
  }
  .groupe {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .groupe-titre {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    line-height: 1.4;
    color: var(--texte-secondaire);
  }
  .definitions li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .picto-info {
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
    max-width: 70ch;
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
  .voir {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }
  .bouton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    padding: 12px 28px;
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
  .bouton:hover {
    background: var(--noir);
    color: var(--blanc);
  }
  .statut {
    margin: 0;
    min-height: 21px;
    font-weight: 600;
  }
  .bandeau :global(:focus-visible) {
    outline: 3px solid var(--noir);
    outline-offset: 3px;
  }
  /* Dans la fenêtre « Modifier ou affiner » : fond blanc, les valeurs sur
     fond crème comme le reste de la fenêtre. */
  .fenetre {
    background: transparent;
    padding: 0;
    overflow: visible;
  }
  .fenetre .conteneur {
    max-width: none;
    margin: 0;
    padding: 0;
  }
  .fenetre .bandeau-int {
    gap: 24px;
  }
  .fenetre .question {
    font-size: 18px;
  }
  .fenetre .puce:hover {
    background: var(--gris);
  }
  .fenetre .puce-choisie,
  .fenetre .puce-choisie:hover {
    background: var(--noir);
  }
  .fenetre .valeurs {
    background: #f6f4ef;
  }
  @media (min-width: 768px) {
    .puce {
      gap: 6px;
      padding: 8px 16px 8px 14px;
    }
    .coche {
      width: 18px;
      height: 18px;
    }
    .bandeau:not(.fenetre) {
      padding: 32px 0 64px;
    }
    .bandeau:not(.fenetre) .conteneur {
      padding: 0 32px;
    }
    .bandeau:not(.fenetre) .bandeau-int {
      gap: 40px;
    }
    .logo {
      height: 96px;
    }
    .titre {
      font-size: 52px;
    }
  }
</style>
