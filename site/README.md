# Prototype du site HYPHENS

## Résumé

Site vitrine exploratoire autour de la maîtrise d’œuvre d’exécution, de l’OPC et du suivi des dernières étapes du chantier. Le parti pris associe une typographie ample, des cadrages d’architecture, une présentation ouverte des missions et une relation client mise au premier plan. Identité, textes et périmètre métier restent soumis à validation humaine par HYPHENS. [S1]

## Ouvrir le prototype

Ouvrir [index.html](index.html) directement dans un navigateur récent. Pour un aperçu HTTP, depuis la racine du repo :

```powershell
python -m http.server 8130 --bind 127.0.0.1
```

Puis ouvrir [le prototype local](http://127.0.0.1:8130/site/). Le serveur reste limité à cet ordinateur. Aucun build, aucune installation de dépendance et aucun compte ne sont nécessaires.

La police Proxima Nova est chargée via le kit Adobe Fonts existant. Sans connexion, le repli déclaré dans les tokens de marque s’applique. Les images et les scripts du prototype sont locaux. [S2]

## Périmètre

- Accueil, présentation du rôle, missions dépliables, approche et contact.
- [Équipe](equipe.html) : engagement, relation client et emplacement de profil avec portrait, nom, fonction et parcours à renseigner.
- [Missions](missions.html) : les trois missions détaillées (MOEX, OPC, réception), leurs axes, la façon d’intervenir et un contact par mission. Textes repris de l’accueil, périmètres à valider.
- [Références](references.html) : galerie d’emplacements, filtres MOEX / OPC / réception et contenu de futures fiches à renseigner. Aucune opération attribuée à HYPHENS.
- Navigation adaptée au mobile, liens d’ancrage, navigation clavier et réduction des mouvements.
- Barre d’atelier fixe : toutes les palettes existantes et les variantes sans barre, prolongée ou détachée du logo. Le réglage par défaut est le H central stylisé, sans barre, avec le dessin adapté automatiquement à sa taille. C’est le même composant que celui utilisé pour les fichiers maîtres de marque. [S2]
- Réglages d’identité conservés entre les pages et partageables dans l’URL, par exemple `?palette=encre-et-prusse&variant=aucune`.
- Animations d’entrée des titres et de l’image d’accueil, apparitions ponctuelles au défilement, ouverture du menu et du dialogue, survol des liens.
- Accordéons animés en hauteur à l’ouverture et à la fermeture, avec inversion possible pendant le mouvement et groupe exclusif pour les missions.
- Respect de la préférence système de réduction des mouvements, y compris si elle change pendant une animation. Le contenu reste visible et la navigation disponible sans JavaScript.
- Parcours de contact local : validation des champs, prévisualisation, modification, copie et téléchargement d’un brouillon. Aucun message envoyé. Aucune coordonnée de contact saisie n’est enregistrée dans le stockage local.
- Deux images d’architecture générées, légendées au plus près. Elles ne représentent aucun projet HYPHENS.

Les couleurs proviennent exclusivement des tokens de marque ; logos et monogrammes utilisent les composants existants. Les fichiers de `brand/` sont consommés sans modification. [S2]

## Sources

- [S1] Brief de Jacques et précisions dans le chat : maîtres d’ouvrage et architectes à parts égales ; studio singulier, expressif, technique et exigeant ; qualité et relation client prioritaires. Ajouts demandés : pages Équipe et Références avec emplacements à renseigner, animations et H central stylisé sans barre prolongée.
- [S2] [Contexte projet](../AGENTS.md), [documentation de marque](../brand/README.md), [palettes](../brand/tokens/palettes.json) et [composants de marque](../brand/hyphens-brand.js).
- [S3] [Site Upside Management](https://www.upsidemanagement.fr/) et documentation locale du projet Upside : architecture accueil, missions, présentation, références et contact. Adaptation aux contenus disponibles pour HYPHENS.
- [S4] [YLLW dans Mobbin](https://mobbin.com/sites/sections/20db4fde-5843-481a-9907-f12cd851e211) : importance donnée à la photographie et aux espaces matériels.
- [S5] [Koto dans Mobbin](https://mobbin.com/sites/sections/2ce48fe2-bea1-438e-a2aa-0b1af12f7996) : respiration, hiérarchie typographique et liste de services. Référence de composition, sans reproduction des contenus ni des actifs.

Les [concepts visuels](design/README.md) et [briefs de génération](design/prompts-images.json) sont conservés pour permettre les itérations.

## Hypothèses

Le prototype comprend un accueil et des pages Missions, Équipe et Références. La navigation principale pointe vers Missions ; le lien « Notre approche » a été retiré, l’approche est reprise sur la page Missions. Le logo de l’en-tête et du pied de page est la version retenue : trait prolongé, H à trois lignes. Les personnes, leurs portraits et les opérations restent des emplacements explicites, conformément au choix de Jacques. Les clients et les partenariats présents dans l’architecture Upside ne sont pas repris faute de contenus HYPHENS validés. Les textes proposés décrivent des intentions de service ; ils ne définissent pas le périmètre d’un contrat. [S1] [S3]

Forêt et lichen est le réglage de départ de cette maquette, sans décision sur la palette définitive. Le titre a été ajusté après la précision du brief sur la qualité de la relation : « Le sens du détail. La force du lien. ». [S1] [S2]

## Limites et validation avant publication

Prototype exploratoire, sans publication. Le formulaire permet seulement une démonstration locale. Il faudra confirmer les activités et la méthode, les typologies d’opérations, la zone d’intervention, les coordonnées, les mentions légales et les informations de confidentialité, puis connecter un canal de contact réellement exploitable.

Les images générées sont des illustrations fictives. Les références réelles pourront remplacer ces illustrations lorsque les missions attribuées et les droits de diffusion seront validés. Aucune référence, équipe, ancienneté, performance ou témoignage client n’est inventé.

Vérification du rendu et des interactions dans le navigateur intégré de Codex sur ordinateur, tablette et mobile. La revue indépendante a conduit à renforcer les bordures des champs en utilisant un rôle de couleur plus contrasté. Une validation humaine du design et des contenus reste nécessaire ; les autres moteurs de navigateur et les lecteurs d’écran n’ont pas fait l’objet d’une campagne complète.
