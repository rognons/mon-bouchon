<script lang="ts">
import { BOUCHONS } from '../data/bouchons';
import { rechercher, type Critere } from '../recherche/regles';
import Results from './search/Results.svelte';
const criteres: Critere[] = [
  { type: 'prix', palier: 'max-35' },
  { type: 'vegetarien' },
];
let tri: 'defaut' | 'note' | 'prix' = 'defaut';
$: resultats = rechercher(BOUCHONS, { principal: criteres[0], complementaires: criteres.slice(1) }, {}, tri);
</script>
<div style="max-width:1200px;margin:0 auto;padding:32px 16px" id="resultats">
  <Results {resultats} {criteres} bind:tri />
</div>
