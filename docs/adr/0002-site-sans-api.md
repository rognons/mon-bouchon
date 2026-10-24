# Un site statique sans API

Statut : acceptée (2026-10-24), à soumettre à Matias

La liste ne compte que 38 bouchons : une API Deno, son image Docker et ses
serveurs de secours étaient disproportionnés. Son découpage des résultats
6 par 6 gênait aussi « À un critère près », l'affinage et le tri, qui
demandent de voir tous les bouchons d'un coup. La liste est désormais
incluse dans la page à la fabrication du site, et toute la recherche se
fait dans le navigateur, dans un module de règles séparé de l'affichage et
couvert par un test par règle (le contrôle qualité bloque si un test
échoue).

Ce qui ne change pas : l'hébergement (image Docker du site, Coolify,
Cloudflare) ; seule l'image de l'API disparaît. Les scripts de mise à jour
(Google Sheet, Google Places) passent de Deno à Node et sont rangés avec le
site et `bouchons.json` : le projet n'utilise plus qu'une technologie.

Options écartées : garder l'API (rien d'autre ne l'utilise, à notre
connaissance) ; charger `bouchons.json` depuis le navigateur (page vide au
départ, bouchons peu visibles pour Google) ; lire le Google Sheet à chaque
fabrication (la mise en ligne dépendrait de Google) ; passer sur Vercel en
même temps (deux changements à faire accepter au lieu d'un).

Conséquence non évidente : changer un bouchon demande toujours de
refabriquer et remettre en ligne le site, comme c'était déjà le cas.
