<script lang="ts">
// La feuille de l'option végé, seule icône en couleur du site : remplie du vert
// de la charte, avec un trait de la couleur du texte, comme le cœur des
// coups de cœur. Dessin repris de Lucide (licence ISC).
// biome-ignore lint/style/useConst: Svelte prop
export let taille = 18;
</script>

<svg class="feuille" width={taille} height={taille} aria-hidden="true" viewBox="0 0 24 24"
  ><path
    class="limbe"
    d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"
  /><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" /></svg
>

<style>
  .feuille {
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .limbe {
    fill: #65b88e;
  }
</style>
