# Direction artistique du prototype

Une présence de studio, avec la précision et la matérialité d’un métier de terrain. Le trait d’union sert de fil conducteur entre la conception et l’exécution, entre les acteurs du projet, et entre le texte et l’image.

## Composition

- Grande entrée typographique sur fond blanc, accompagnée d’une photographie de structure en béton.
- Contraste entre texte principal et seconde partie du titre, dans les deux couleurs du monogramme existant.
- Missions sur fond sombre, avec une liste dépliable plutôt qu’une grille de cartes.
- Retour au blanc pour l’approche, image de détail et textes sur la proximité, le dialogue et le terrain.
- Conclusion sur fond de surface, puis contact local.
- Page Équipe à dominante typographique, avec un emplacement de profil et aucun portrait de personne fictive.
- Page Références en galerie asymétrique, avec catégories de démonstration et opérations à renseigner.

Proxima Nova et les rôles de couleurs du repo assurent la continuité avec la marque. Pas de logo redessiné, pas de nouvelle palette, pas de photos attribuées à HYPHENS.

Le logo par défaut est désormais le H central stylisé sans barre prolongée, conformément à la précision de Jacques. Les attributs `position="milieu"`, `variant="aucune"` et `taille="auto"` consomment le composant actuel de `brand/`. Le générateur des fichiers maîtres utilise ce même composant pour la version « sans-barre ».

## Mouvement

Une entrée coordonnée du titre et de la photo d’accueil, puis quelques apparitions de blocs au défilement. Les survols répondent au geste du visiteur. Les accordéons déploient et replient leur hauteur ; un nouveau clic peut inverser le mouvement, et les hauteurs sont libérées une fois la transition terminée.

Les animations utilisent les capacités natives du navigateur, sans bibliothèque supplémentaire. La préférence de réduction des mouvements les désactive et annule les transitions en cours. Aucun contenu n’est masqué dans l’attente d’un script.

## Concepts et adaptation

- [Concept d’accueil](concept-accueil.png)
- [Concept des sections suivantes](concept-sections.png)

Les concepts ont été générés avec l’outil Image Gen intégré. Ils ont guidé la composition, la hiérarchie et les rapports entre images et textes. Les textes, contrôles, logos et icônes de l’implémentation sont du HTML, du CSS et les composants de marque existants.

Le brief a ensuite précisé la place centrale de la relation client. Le titre d’accueil est donc devenu « Le sens du détail. La force du lien. ». Le formulaire a été ajouté comme parcours de démonstration demandé par le caractère de prototype, avec une mention explicite d’absence d’envoi. Le fond de contact reste une surface issue des tokens, afin de suivre toutes les palettes.

Les visuels de production ont été générés séparément. Aucune portion de concept d’interface n’est utilisée comme image du site.

## Références Mobbin retenues

- [YLLW](https://mobbin.com/sites/sections/20db4fde-5843-481a-9907-f12cd851e211) : cadrage ample de l’espace matériel.
- [Koto](https://mobbin.com/sites/sections/2ce48fe2-bea1-438e-a2aa-0b1af12f7996) : hiérarchie et respiration d’une présentation de services.

Les résultats ont été examinés visuellement. Les images Mobbin servent uniquement de références de conception et ne sont ni embarquées dans le site ni reprises dans les visuels générés.

## Validation

À revoir avec Jacques et la dirigeante d’HYPHENS : degré d’expressivité, rythme des sections, palette, variante du logo et textes. Les illustrations générées restent fictives et ne documentent aucune opération réelle.

## Relecture du rendu

| Point comparé | Concept | Prototype et décision |
|---|---|---|
| Composition d’accueil | Texte ample à gauche, photographie rectangulaire à droite | Même organisation, avec adaptation verticale au mobile. |
| Titre | Exigence et rigueur de l’exécution | « Le sens du détail. La force du lien. » pour intégrer la précision du brief sur la relation client. |
| Typographie et marque | Sans empattement, mot HYPHENS de repérage | Proxima Nova et composant de logo exact du repo. |
| Couleurs | Blanc et Forêt et lichen | Rôles de marque conservés, toutes les palettes accessibles. La seconde moitié du titre reprend la couleur intérieure du monogramme. |
| Photographies | Escalier et détail de structure | Actifs générés séparément, sans teinte ajoutée. La hauteur de la photographie de détail a été corrigée pour respecter son cadrage et l’alignement des textes. |
| Missions | Liste ouverte sur fond sombre | Même famille de composants, avec états dépliés et repliés testés. |
| Contact | Bouton sur fond de surface | Surface issue des tokens et dialogue local explicite. Aucun canal d’envoi présenté comme connecté. |

Les captures finales ont été comparées aux concepts. Les différences ci-dessus sont des choix de ce prototype proposé, à valider avec HYPHENS.
