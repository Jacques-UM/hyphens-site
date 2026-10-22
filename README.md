# HYPHENS · prototype de site et marque

Prototype exploratoire du site de HYPHENS SAS (maîtrise d'œuvre d'exécution), avec la marque qui l'alimente.

- `site/` : le prototype (accueil, missions, équipe, références). Ouvrir `site/index.html`.
- `brand/` : la marque, source de vérité (palettes, composants `<hyphens-logo>`, `<hyphens-mark>`, `<hyphens-icon>`, fichiers maîtres du logo). Mode d'emploi dans `brand/README.md`.

Le site est publié avec GitHub Pages ; la racine redirige vers `site/`. Les pages portent une balise `noindex` : le prototype n'est pas destiné aux moteurs de recherche.

Prototype de travail : positionnement, textes, périmètre des missions, identité visuelle et coordonnées restent à valider par HYPHENS avant toute publication officielle. Les images sont des illustrations générées et ne représentent aucune réalisation HYPHENS. Aucune référence client, aucun témoignage ni chiffre d'activité n'est présenté.

Aperçu local, depuis la racine du dépôt :

```
python -m http.server 8130 --bind 127.0.0.1
```

puis `http://127.0.0.1:8130/site/`.
