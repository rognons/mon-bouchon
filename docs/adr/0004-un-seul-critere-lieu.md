# Un seul critère « Lieu » à la place d'Arrondissement et Quartier

Statut : acceptée (2026-10-24). Remplace en partie la n° 0001.

Dans les données, chaque quartier recouvre exactement des arrondissements
(Presqu'île = 1er et 2e, Vieux-Lyon = 5e, Croix-Rousse = 4e) : proposer les
deux critères faisait choisir deux fois la même chose. Il n'y a donc plus
qu'un critère principal « Lieu » : le quartier du bouchon s'il en a un, sinon
son arrondissement ou sa commune. Seuls les lieux où se trouve au moins un
bouchon sont proposés.

Options écartées : un bouton pour choisir entre « par quartier » et « par
arrondissement » (un choix de plus avant de choisir) ; une carte cliquable
(lourde sur téléphone et difficile au clavier).

Conséquence non évidente : un bouchon sans quartier dans un arrondissement
découpé en quartiers (par exemple dans les Pentes du 1er) apparaîtrait sous
son arrondissement : il faut lui donner un quartier dans le Google Sheet.
