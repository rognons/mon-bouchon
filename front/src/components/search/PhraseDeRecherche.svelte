<script lang="ts">
// La phrase de recherche : un critère principal, puis jusqu'à trois
// critères complémentaires en « et qui… ».
import { PORTIONS, PROFILS_MANGEUR, QUARTIERS, type Quartier } from '../../data/referentiel';
import {
  critereParDefaut,
  JOURS,
  LIEUX,
  PALIERS,
  SERVICES,
  TYPES_DE_CRITERE,
  type TypeDeCritere,
} from '../../recherche/phrase';
import { type Critere, MAX_CRITERES_COMPLEMENTAIRES } from '../../recherche/regles';

// Le premier critère est le critère principal ; les suivants sont complémentaires.
export let criteres: Critere[] = [];

// Un même critère ne figure qu'une fois dans la phrase.
function typesLibres(index: number): typeof TYPES_DE_CRITERE {
  const pris = criteres.filter((_, i) => i !== index).map((c) => c.type);
  return TYPES_DE_CRITERE.filter((t) => !pris.includes(t.type));
}

function changerType(index: number, type: string) {
  criteres = criteres.map((c, i) => (i === index ? critereParDefaut(type as TypeDeCritere) : c));
}

function modifier(index: number, critere: Critere) {
  criteres = criteres.map((c, i) => (i === index ? critere : c));
}

function ajouter() {
  const libre = typesLibres(-1)[0];
  if (libre) criteres = [...criteres, critereParDefaut(libre.type)];
}

function retirer(index: number) {
  criteres = criteres.filter((_, i) => i !== index);
}

// Coche ou décoche une valeur ; la dernière valeur cochée ne peut être
// décochée (pour l'enlever, on retire le critère).
function basculer<T>(liste: T[], valeur: T): T[] {
  if (!liste.includes(valeur)) return [...liste, valeur];
  return liste.length > 1 ? liste.filter((v) => v !== valeur) : liste;
}

$: peutAjouter = criteres.length < MAX_CRITERES_COMPLEMENTAIRES + 1 && typesLibres(-1).length > 0;
</script>

<form class="phrase" on:submit|preventDefault aria-label="Phrase de recherche">
  <p class="debut">Je cherche un bouchon lyonnais</p>

  {#each criteres as critere, index (index)}
    <fieldset class="critere" class:principal={index === 0}>
      <legend class="sr-only">
        {index === 0 ? 'Critère principal' : `Critère complémentaire ${index}`}
      </legend>
      <span class="liaison">{index === 0 ? 'qui' : 'et qui'}</span>

      <select
        aria-label={index === 0 ? 'Critère principal' : `Critère complémentaire ${index}`}
        value={critere.type}
        on:change={(e) => changerType(index, e.currentTarget.value)}
      >
        {#each typesLibres(index) as t}
          <option value={t.type}>{t.verbe}</option>
        {/each}
      </select>

      {#if critere.type === 'prix'}
        <select
          aria-label="Budget"
          value={critere.palier}
          on:change={(e) =>
            modifier(index, { type: 'prix', palier: e.currentTarget.value as typeof critere.palier })}
        >
          {#each PALIERS as p}
            <option value={p.value}>{p.label}</option>
          {/each}
        </select>
      {:else if critere.type === 'arrondissement'}
        <span class="choix-multiples" role="group" aria-label="Arrondissements ou communes">
          {#each LIEUX as lieu}
            <label class="pastille" class:coche={critere.valeurs.includes(lieu.value)}>
              <input
                type="checkbox"
                checked={critere.valeurs.includes(lieu.value)}
                on:change={(e) => {
                  const valeurs = basculer(critere.valeurs, lieu.value);
                  e.currentTarget.checked = valeurs.includes(lieu.value);
                  modifier(index, { type: 'arrondissement', valeurs });
                }}
              />
              {lieu.label}
            </label>
          {/each}
        </span>
      {:else if critere.type === 'quartier'}
        <span class="choix-multiples" role="group" aria-label="Quartiers">
          {#each QUARTIERS as q}
            <label class="pastille" class:coche={critere.valeurs.includes(q.code)}>
              <input
                type="checkbox"
                checked={critere.valeurs.includes(q.code)}
                on:change={(e) => {
                  const valeurs = basculer<Quartier>(critere.valeurs, q.code);
                  e.currentTarget.checked = valeurs.includes(q.code);
                  modifier(index, { type: 'quartier', valeurs });
                }}
              />
              {q.libelle}
            </label>
          {/each}
        </span>
      {:else if critere.type === 'moment'}
        <select
          aria-label="Jour"
          value={critere.jour}
          on:change={(e) =>
            modifier(index, { ...critere, jour: Number(e.currentTarget.value) })}
        >
          {#each JOURS as j}
            <option value={j.value}>{j.label}</option>
          {/each}
        </select>
        <select
          aria-label="Service"
          value={critere.service}
          on:change={(e) =>
            modifier(index, {
              ...critere,
              service: e.currentTarget.value as typeof critere.service,
            })}
        >
          {#each SERVICES as s}
            <option value={s.value}>{s.label}</option>
          {/each}
        </select>
      {:else if critere.type === 'profil'}
        <select
          aria-label="Profil de mangeur"
          value={critere.profil}
          on:change={(e) =>
            modifier(index, {
              type: 'profil',
              profil: e.currentTarget.value as typeof critere.profil,
            })}
        >
          {#each PROFILS_MANGEUR as p}
            <option value={p.code}>{p.court}</option>
          {/each}
        </select>
      {:else if critere.type === 'portions'}
        <select
          aria-label="Portions minimum"
          value={critere.minimum}
          on:change={(e) =>
            modifier(index, {
              type: 'portions',
              minimum: e.currentTarget.value as typeof critere.minimum,
            })}
        >
          {#each PORTIONS as p}
            <option value={p.code}>{p.court}</option>
          {/each}
        </select>
      {/if}

      <button
        type="button"
        class="retirer"
        on:click={() => retirer(index)}
        aria-label={index === 0 ? 'Retirer le critère principal' : `Retirer le critère ${index}`}
      >
        Retirer
      </button>
    </fieldset>
  {/each}

  {#if peutAjouter}
    <button type="button" class="ajouter" on:click={ajouter}>
      {criteres.length === 0 ? 'Choisir un critère →' : 'Ajouter « et qui… » →'}
    </button>
  {/if}
</form>

<style>
  /* Couleurs et formes de la charte de la Compagnie du Rognon */
  .phrase {
    --rose: #f0c6da;
    --noir: #221f20;
    --blanc: #ffffff;
    --gris: #e6e2dc;
    --texte-secondaire: #696561;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 24px;
    margin-bottom: 32px;
    background: var(--blanc);
    border: 1px solid var(--gris);
    border-radius: 4px;
    color: var(--noir);
    font-size: 17px;
    line-height: 1.6;
  }
  .debut {
    margin: 0;
    font-family: 'GiltonRegular', 'Playfair Display', serif;
    font-size: 27px;
    line-height: 1.1;
  }
  .critere {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }
  .liaison {
    font-weight: 600;
  }
  select {
    min-height: 44px;
    max-width: 100%;
    padding: 0 12px;
    border: 1px solid var(--noir);
    border-radius: 4px;
    background: var(--blanc);
    color: var(--noir);
    font: inherit;
  }
  .choix-multiples {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pastille {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--noir);
    border-radius: 999px;
    background: var(--blanc);
    cursor: pointer;
  }
  .pastille.coche {
    background: var(--rose);
  }
  .pastille input {
    accent-color: var(--noir);
  }
  .ajouter,
  .retirer {
    min-height: 44px;
    padding: 0 20px;
    border: 1px solid var(--noir);
    border-radius: 999px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .ajouter {
    align-self: flex-start;
    background: var(--rose);
    color: var(--noir);
  }
  .retirer {
    background: var(--blanc);
    color: var(--noir);
    font-weight: 600;
  }
  .ajouter:hover,
  .retirer:hover {
    background: var(--noir);
    color: var(--blanc);
  }
  select:focus-visible,
  .ajouter:focus-visible,
  .retirer:focus-visible,
  .pastille:focus-within {
    outline: 3px solid var(--noir);
    outline-offset: 3px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
  @media (max-width: 600px) {
    .phrase {
      padding: 16px;
    }
    .debut {
      font-size: 22px;
    }
    select {
      width: 100%;
    }
  }
</style>
