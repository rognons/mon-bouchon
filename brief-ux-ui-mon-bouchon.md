# Brief UX/UI — Mon Bouchon (générateur de bouchons lyonnais)

## Objectif et public

Mon Bouchon est l'outil de La Compagnie du Rognon, une association lyonnaise
qui teste les bouchons (restaurants lyonnais traditionnels). Il aide chacun à
trouver **le bouchon idéal pour sa situation** (ses invités, l'endroit où il
se trouve, son appétit, ce qu'il aime) parmi les 38 bouchons testés et
retenus par la Compagnie.

Public : le grand public lyonnais et les visiteurs, souvent sur téléphone, qui
organisent un repas (en couple, entre amis, en famille, pour le travail). Ils
ne connaissent pas forcément le vocabulaire des bouchons.

Ce qui doit mieux marcher :
- comprendre tout de suite comment chercher, sans mode d'emploi ;
- voir pourquoi chaque bouchon proposé correspond à la demande ;
- ne jamais tomber sur une page vide sans alternative ;
- respecter enfin la charte graphique de la Compagnie (le site actuel ne la
  suit pas) ;
- être pleinement utilisable au clavier et au lecteur d'écran.

## Pages et parcours à concevoir

Une seule page, à concevoir en **mobile d'abord (375 px)**, puis tablette
(768 px) et ordinateur (1280 px, contenu centré, 1200 px de large au plus).

De haut en bas :

1. **Bandeau d'accueil** (aplat `rose`) : logo complet, titre « Trouvez votre
   bouchon lyonnais idéal », chapeau « Une sélection préparée par des experts,
   des résultats adaptés à vos critères. »
2. **La phrase de recherche** (le cœur de l'outil), puis les **raccourcis de
   recherche** quand la phrase est vide.
3. **La ligne « Affiner : »**, sous la phrase.
4. **L'en-tête des résultats** : nombre de bouchons trouvés, choix du tri,
   bouton « Partager cette recherche ».
5. **Les résultats exacts** : grille de cartes bouchon.
6. **La section « À un critère près »**, quand elle s'affiche.
7. **Le pied de page** (aplat `noir`).

### La phrase de recherche

L'utilisateur décrit sa situation en complétant une phrase :

> Je cherche un bouchon lyonnais **qui a un menu à [moins de 32 €]**,
> **et qui se trouve [dans le 1er ou le 2e]**,
> **et qui propose une option végétarienne**.

- Le premier critère est le **critère principal** : le plus important pour
  l'utilisateur, il n'est jamais assoupli. Il faut le **distinguer
  visuellement** (mention du type « le plus important » et style à part).
- On peut ajouter jusqu'à **trois critères complémentaires** (« et qui… »),
  chacun une seule fois. Chaque critère a un bouton « Retirer ». Chaque
  critère complémentaire a aussi un bouton **« Rendre principal »**, qui
  l'échange avec le critère principal. Quand on retire le critère principal,
  le suivant prend visiblement sa place.
- Les critères possibles, et la façon dont chacun se dit :

| Critère | Début de phrase | Valeurs |
| --- | --- | --- |
| Prix | a un menu à | moins de 32 € · moins de 38 € · n'importe quel prix |
| Arrondissement | se trouve | dans le 1er … dans le 9e · à Villeurbanne · aux Chères (**plusieurs choix possibles**) |
| Quartier | se trouve dans le quartier | Presqu'île · Vieux-Lyon · Croix-Rousse (plusieurs choix possibles) |
| Jour et service | est ouvert | le lundi … le dimanche + midi · soir · pour le mâchon (le matin) |
| Profil de mangeur | convient à | un découvreur curieux · un amateur averti · un puriste canaille |
| Portions | sert des portions au moins | raisonnables · généreuses · gargantuesques |
| Option végétarienne | propose une option végétarienne | (pas de valeur) |

- Les valeurs à choix multiples (arrondissement, quartier) s'affichent dans la
  phrase sous la forme « dans le 1er ou le 2e ▾ » et s'ouvrent en **liste
  repliable à cases à cocher**. Pas de rangée de 11 pastilles.
- La phrase doit garder l'allure d'une phrase qu'on lit, y compris sur mobile,
  où chaque critère passe à la ligne.

### Les raccourcis de recherche

Sous la phrase vide, quelques situations toutes faites, cliquables ; un clic
remplit la phrase, que l'utilisateur ajuste ensuite. Exemples de structure
(les libellés définitifs seront écrits par la Compagnie) :
- « Un petit budget » → qui a un menu à moins de 32 €
- « Un mâchon samedi » → qui est ouvert le samedi pour le mâchon
- « Avec un végétarien » → qui propose une option végétarienne
- « Pour un puriste » → qui convient à un puriste canaille

Prévoir 4 à 6 raccourcis. Ils disparaissent quand la phrase contient un
critère (ou restent repliés sous un lien « Idées de recherche »).

### La ligne « Affiner : »

Après la phrase, une ligne « Affiner : » sur toute la largeur, avec quatre
listes repliables : **type de bouchon** (traditionnel, moderne, bourgeois),
**ambiance** (calme & spacieux, convivial & vivant, chaleureux & animé),
**distinctions** (coup de cœur de la Compagnie, sélection vins, label « Les
Bouchons Lyonnais », Sélection Authentiques), **options** (terrasse,
décoration remarquable, personnel remarquable). Un bouton « Réinitialiser »
apparaît quand un affinage est actif. Sur mobile, la ligne se replie derrière
un bouton **« Affiner »** (avec le nombre d'affinages actifs).

L'affinage retire les bouchons partout (résultats exacts et « À un critère
près »). Il ne contient jamais les critères de la phrase.

### L'en-tête des résultats

« 12 bouchons trouvés » (titre de section), le tri (« Coups de cœur » par
défaut, « Note Google », « Prix »), et le bouton **« Partager cette
recherche »** : il copie le lien de la recherche (sur mobile, il ouvre le
partage du téléphone) et confirme « Lien copié ». L'adresse de la page reflète
toujours la recherche en cours.

### La carte bouchon

Contenu, dans cet ordre :
1. Nom du bouchon (titre `h3` 22 px) ; badge coup de cœur si c'est un coup de
   cœur de la Compagnie (image fournie : le cochon de la Compagnie).
2. **Étiquettes « ce qui répond à votre recherche »** : une par critère de la
   phrase rempli par ce bouchon, par exemple « Menu à 31 € », « Dans le 2e »,
   « Ouvert samedi midi », « Option végétarienne », « Portions généreuses ».
   Sans critère dans la phrase, pas d'étiquettes.
3. **2 ou 3 spécialités** (ex. « Quenelle de brochet · Tarte aux pralines ·
   Pâté-croûte »).
4. Adresse (lien vers Google Maps), prix du menu de base (« 31 € », format
   français, sans décimales inutiles), téléphone (lien d'appel).
5. Description (2 à 4 lignes, ex. « Derrière sa façade bourgeoise, le
   Vivarais garde le cœur d'un vrai bouchon lyonnais. »).
6. Boutons « Voir notre article » et « Voir le menu » quand ils existent ;
   note Google (« Google : 4,5/5 », en `texte-secondaire`).

### La section « À un critère près »

Elle s'affiche **quand il y a moins de 3 résultats exacts** : des bouchons qui
remplissent le critère principal et tous les critères complémentaires sauf
un. Section à **fond `creme`** sur toute la largeur, titre `h2` « À un
critère près », chapeau « Aucun bouchon ne remplit tous vos critères, mais
ceux-ci n'en manquent qu'un. » (ou « Peu de bouchons… » s'il y a 1 ou 2
résultats exacts). Mêmes cartes que les résultats exacts, avec **en tête de
chaque carte** ce qui manque : « Il ne se trouve pas dans le 1er. » ou « Prix
non renseigné. ».

### Les états à prévoir

- Phrase vide (38 bouchons affichés, raccourcis visibles).
- Phrase avec un critère, avec trois critères complémentaires (le bouton
  d'ajout disparaît au maximum).
- Beaucoup de résultats (grille), 1 ou 2 résultats + « À un critère près »,
  0 résultat exact + « À un critère près ».
- Aucun résultat du tout : message « Aïe, on n'a pas encore trouvé de bouchon
  comme celui-ci. Mais dites-nous et on le teste ! » et proposition de retirer
  un critère.

## Charte à respecter

Charte de La Compagnie du Rognon (design system officiel). Identité :
gourmande, joueuse, un peu canaille, jamais guindée. Un cochon à lunettes
noires, un rose poudré, un noir profond.

### Couleurs (thème clair uniquement)

| Nom | Hexa | Rôle |
| --- | --- | --- |
| rose | #f0c6da | Couleur principale : bandeau, boutons (pastille), soulignement des liens sur blanc, surlignage, titres et liens sur noir. **Jamais en texte sur blanc** (1,5:1). |
| noir | #221f20 | Titres et texte courant sur blanc, rose, crème et accents ; bordure et texte des boutons ; contour de focus sur fonds clairs ; pied de page. |
| blanc | #ffffff | Fond de page, des cartes et des encadrés. |
| creme | #eeebe4 | Fonds chaleureux (section « À un critère près ») et liseré des images détourées. |
| gris | #e6e2dc | Séparateurs, bordure 1 px des cartes. Jamais pour du texte. |
| texte-secondaire | #696561 | Dates, légendes, libellés, note Google, sur blanc uniquement (5,8:1). |
| texte-inverse | #d0cbc7 | Texte courant sur noir (pied de page). |
| texte-inverse-doux | #9c9894 | Mentions légales sur noir. |
| Accents | mauve #da9de3 · corail #ff8a8a · jaune #f4ee80 · vert #65b88e · bleu #4ba1e2 | D'abord pour teinter les images. En aplat (étiquette), toujours avec texte noir, deux accents au maximum par écran, jamais mauve sur rose. Ce ne sont pas des couleurs d'état. |

Règles : **aucun gris neutre** (#666, #ccc, #eee…), **aucun dégradé** (bandeau
et pied de page en aplats unis), **aucune opacité** pour éclaircir un texte,
**aucun émoji** dans l'interface (la flèche « → » est permise en fin de
libellé de bouton). La charte n'a pas de couleur d'erreur ou de succès.

### Polices

- **Titres** : GiltonRegular (fichier fourni, licence commerciale), graisse
  normale, interligne 1,05 à 1,15. Échelle ordinateur : hero 52 px, h1 42,
  h2 33, h3 27 (cartes : 22), h4 21. Téléphone : hero 36, h1 32, h2 27.
- **Tout le reste** : Bricolage Grotesque (Google Fonts), trois combinaisons
  seulement :
  - Regular 400 : texte courant `corps` 17 px / 1,6, en noir, 70 caractères
    par ligne au plus ; légendes `secondaire` 14 px / 1,5 en texte-secondaire ;
  - SemiBold 600 : chapeau 20 px / 1,45 ; mots importants 17 px ; libellés en
    capitales 14 px, interlettrage 0,5 px, en texte-secondaire ;
  - Bold 700 en largeur SemiCondensed (font-stretch 87,5 %) : boutons 17 px /
    1,2.
- Rien en dessous de 14 px. Pas d'italique ni de souligné pour mettre en
  valeur (le souligné est réservé aux liens). Titres en casse de phrase.

### Espacements, rayons, ombres

- Grille de 8 px : 4, 8, 12, 16, 24 (padding des cartes), 32 (marges latérales
  des sections), 48 (entre blocs d'une section), 64 (entre sections sur
  téléphone), 96 (entre sections sur ordinateur).
- Rayons : cartes, encadrés, champs 4 px ; pastilles et étiquettes 20 px ;
  boutons 999 px (pastille entièrement arrondie).
- Ombres : carte au repos 0 2px 5px rgba(0,0,0,0.1) ; au survol
  0 4px 10px rgba(0,0,0,0.15).
- Transitions douces de 0,2 à 0,3 s, pas d'animation décorative.

### Logo

Logo complet noir sur le bandeau rose, 60 px de haut au minimum ; logo nom
seul dans le pied de page en rose ou blanc sur noir. Zone de protection de
1/8 de la hauteur du logo. Ne jamais redessiner, recolorer ni déformer le logo.

## Composants et leurs états

- **Bouton principal** : pastille rose bordée de noir 1 px, texte noir style
  bouton, 44 px de haut au minimum. Survol : fond noir, texte blanc. Sur fond
  rose : pastille blanche. Sur fond noir : pastille bordée de rose.
  Désactivé : à proposer sans opacité sur le texte (par exemple bordure et
  texte en texte-secondaire, fond blanc).
- **Bouton secondaire** (« Retirer », « Rendre principal », « Réinitialiser »,
  « Partager cette recherche ») : pastille blanche bordée de noir, mêmes
  survol et focus.
- **Lien** : noir souligné de rose sur blanc ; noir souligné de noir sur rose ;
  rose souligné sur noir.
- **Listes déroulantes et listes repliables** (valeurs de la phrase, affinage,
  tri) : champ blanc bordé de noir, rayon 4 px, 44 px de haut ; liste ouverte
  avec cases à cocher pour les choix multiples ; nombre de choix actifs
  visible quand la liste est fermée.
- **Étiquettes** (critères remplis sur la carte) : rayon 20 px, texte noir
  14 px SemiBold, fond blanc bordé de gris ou fond d'un accent (deux accents
  au plus).
- **Mention « ce qui manque »** (cartes « À un critère près ») : en tête de
  carte, bien visible, texte noir ou blanc sur noir.
- **Focus clavier** sur tous les éléments interactifs : contour plein de 3 px
  décalé de 3 px, noir sur fonds clairs, rose sur noir. Ne jamais le
  supprimer.

## Problèmes à corriger

1. [Haute] La charte n'est pas appliquée (Open Sans 14 px gris #666, titres
   36 px, gris neutres, dégradés, émojis, liens roses sur blanc, opacité au
   survol) — toute la page — appliquer la charte ci-dessus — (charte de la
   Compagnie).
2. [Haute] La phrase démarre vide et ne s'explique pas — en haut des
   résultats — raccourcis de recherche sous la phrase — (Nielsen 6 et 10,
   Krug).
3. [Haute] Le critère principal n'est pas distingué et change en silence quand
   on le retire — dans la phrase — style à part, mention, bouton « Rendre
   principal » — (Nielsen 1 et 3).
4. [Haute] La barre d'affinage passe avant la phrase au clavier et au lecteur
   d'écran, dans une colonne de gauche surdimensionnée — ligne « Affiner : »
   sous la phrase, dans cet ordre de lecture — (WCAG 2.4.3, Gestalt
   proximité).
5. [Haute] 11 pastilles d'arrondissements, une demi-hauteur d'écran sur
   mobile — dans la phrase — liste repliable à choix multiples — (Hick,
   mobile d'abord).
6. [Haute] Textes de 11,2 px (libellés, « Voir notre article », note Google) —
   cartes — 14 px au minimum — (charte, Butterick).
7. [Haute] Zones cliquables de 18 à 19 px de haut (adresse, téléphone) —
   cartes — 44 px — (WCAG 2.5.8, Fitts).
8. [Moyenne] On ne voit pas pourquoi un bouchon correspond — cartes —
   étiquettes des critères remplis + spécialités — (Nielsen 1).
9. [Moyenne] « À un critère près » ressemble aux résultats exacts — section —
   fond crème, ce qui manque en tête de carte — (Gestalt régions communes).
10. [Moyenne] Focus clavier presque invisible (1 px natif, aucun sur le tri) —
    partout — focus de la charte — (WCAG 2.4.7).
11. [Moyenne] Trois styles de bouton — partout — un bouton principal, un
    secondaire — (Gestalt similarité).
12. [Moyenne] Vocabulaire incohérent (« Filtres » / « Affiner », « Top 10 » /
    « Coup de cœur ») — partout — « Affiner » partout ; libellés des
    distinctions à fournir par la Compagnie — (Nielsen 4).
13. [Moyenne] Prix au format anglais « 35.00 € » — cartes — « 35 € » —
    (convention française).
14. [Moyenne] Recherche impossible à partager — en-tête des résultats —
    adresse qui reflète la recherche + bouton « Partager » — (loi de Jakob,
    Nielsen 3).
15. [Basse] Nombre de résultats non annoncé quand il change — en-tête des
    résultats — message d'état pour les lecteurs d'écran — (WCAG 4.1.3).

## Accessibilité et mobile

- WCAG 2.2 AA : texte 4,5:1 sur son fond (3:1 à partir de 24 px, et pour les
  bordures de champs, les icônes et le focus). Toutes les paires de couleurs
  de la charte listées plus haut le respectent ; ne pas en inventer d'autres.
- Zones cliquables de 44 × 44 px (minimum absolu 24 px, WCAG 2.5.8).
- Tout est utilisable au clavier, dans l'ordre : phrase, raccourcis,
  affinage, en-tête des résultats, résultats, « À un critère près ».
- Un seul `h1` (le titre du bandeau) ; `h2` pour « N bouchons trouvés » et
  « À un critère près » ; `h3` pour les noms de bouchons.
- Les listes repliables s'ouvrent et se ferment au clavier, annoncent leur
  état (ouvert/fermé) et leurs choix cochés.
- Images : textes alternatifs (« La Compagnie du Rognon » pour le logo,
  « Coup de cœur de la Compagnie » pour le badge) ; éléments décoratifs avec
  alt vide.
- Mobile (375 px) : marges latérales de 16 px, aucun défilement horizontal ;
  la phrase passe un critère par ligne, les listes s'ouvrent sur toute la
  largeur ; le bouton « Affiner » ouvre l'affinage en panneau plein écran
  avec un bouton « Voir les N bouchons ».

## À garder tel quel

- Le principe de la phrase de recherche, du critère principal et de la
  section « À un critère près » (décisions de la Compagnie).
- Les règles de recherche : budget maximum, cascades (un puriste voit aussi
  les bouchons pour amateurs et découvreurs ; « au moins généreuses » montre
  aussi les gargantuesques), tri par défaut coups de cœur d'abord.
- Le contenu et les libellés de la phrase listés plus haut (à affiner par la
  Compagnie, pas par le design).
- Le logo, le badge coup de cœur (cochon) et les photos fournies.

## Hypothèses et questions ouvertes

- Les libellés des raccourcis, la reformulation du « puriste canaille » vers
  un « j'aime tout », le nom de la « Sélection Authentiques » (à ne pas
  confondre avec le bouchon traditionnel) et un nom unique pour le coup de
  cœur sont **à écrire par la Compagnie** : prévoir des emplacements de la
  bonne longueur.
- Le service « mâchon » repose pour l'instant sur une règle provisoire ; le
  design n'a pas à en tenir compte.
- Aucune photo de bouchon n'est disponible aujourd'hui sur les cartes ; la
  maquette doit fonctionner sans. Une variante avec le sticker du bouchon
  (illustration ronde détourée, liseré crème) peut être proposée en option.
- La note Google reste affichée, mais discrète : l'avis qui compte est celui
  de la Compagnie.
- Exemple de bouchon réaliste pour la maquette : **Le Vivarais**, 1 place
  Gailleton, 69002 Lyon, menu à 31 €, 04 78 37 85 15, Google 4,5/5,
  spécialités « Quenelle de brochet · Tarte aux pralines · Pâté-croûte »,
  bouchon bourgeois, ambiance calme & spacieux, portions raisonnables, option
  végétarienne, terrasse.
