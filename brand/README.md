# Marque HYPHENS : mode d'emploi

Ouvrir `playground.html` dans un navigateur pour voir et comparer les palettes, la barre et la taille du H en direct. Adresse directe d'un réglage : `playground.html?palette=foret-et-lichen&variant=detachee&scale=1.4`.

## Intégrer la marque dans une page

```html
<link rel="stylesheet" href="https://use.typekit.net/ted1nei.css">
<link rel="stylesheet" href="../brand/tokens/hyphens-tokens.css">
<script src="../brand/tokens/hyphens-palettes.js"></script>
<script src="../brand/hyphens-brand.js"></script>

<html data-palette="tirage-de-plan">
<hyphens-logo variant="prolongee" style="font-size:32px"></hyphens-logo>
<hyphens-mark style="font-size:64px"></hyphens-mark>
```

Pour un favicon qui suit la palette : `<link rel="icon" data-hyphens href="data:,">`.

## `<hyphens-logo>`

| Attribut | Valeurs | Défaut |
|---|---|---|
| `variant` | `prolongee`, `detachee`, `detachee-courte`, `aucune` | `prolongee` |
| `scale` | taille du H central par rapport aux capitales | `1.15` |
| `gap` | espace d'encre de part et d'autre du H, en em, identique côté P et côté E : le trait d'union est symétrique | `0.07` |
| `compact` | taille en px sous laquelle la barre disparaît | `22` |
| `position` | `milieu` (HYP·H·ENS) ou `debut` (H stylisé en tête, sans trait) | `milieu` |
| `bar-weight` | épaisseur du trait d'union, en part de la barre du H. Le trait est aligné sur la barre centrale du E | `1` |

| `taille` | `auto`, `grand`, `moyen`, `petit` : dessin du H (voir ci-dessous) | `auto` |

La taille du logo suit le `font-size` de l'élément, comme du texte.

## Le H à trois tailles

En réduisant, les lignes du H se fondent. Le H a donc trois dessins, choisis automatiquement d'après sa hauteur affichée :

| Taille | Dessin | Logo (hauteur du H) | Symbole seul |
|---|---|---|---|
| `grand` | trois lignes par fût, lignes en U et en n | 36 px et plus | 48 px et plus |
| `moyen` | deux lignes droites par fût et la barre | 15 à 36 px | 20 à 48 px |
| `petit` | H plein : fûts en couleur extérieure, barre en couleur intérieure | sous 15 px | sous 20 px |

Forcer un dessin : `taille="moyen"`. L'ancien attribut `lines` du symbole reste accepté (`3` vaut `grand`, `2` vaut `moyen`).

## Fichiers maîtres (SVG, PDF, favicons)

Pour les usages hors site (imprimeur, Word, signalétique) : `python brand/build_logos.py` (palette par défaut) ou `--palette foret-et-lichen`. Sorties dans `logo/<palette>/` : `logo/<version>/<taille>-<fond>.svg|.pdf` (versions prolongee, detachee, sans-barre, h-en-tete), `symbole/<taille>-<fond>.svg|.pdf`, et `favicons/` (16, 32 et 48 px dessinés au pixel, `favicon.svg`, icônes 180 et 512 px). Lettres vectorisées, aucune police requise. `--reperage` produit les mêmes fichiers en rouge et vert de repérage, pour l'import dans Figma.

## `<hyphens-mark>`

Le H seul, haut de 1 em. Attribut `taille` (`auto` par défaut, `grand`, `moyen`, `petit`).

## `<hyphens-icon>`

Six icônes abstraites et carrées, dans la grammaire du monogramme (trois traits parallèles, trait du milieu en couleur intérieure). Hauteur 1 em, couleurs de la palette active, passage automatique en clair dans une zone `data-tone="fonce"`.

| `name` | Icône | Ce qu'elle évoque |
|---|---|---|
| `reception` | Coche à trois traits | Réserves levées, ouvrage reçu |
| `equerre` | Trois angles droits emboîtés | La rigueur |
| `carres-emboites` | Trois carrés concentriques | La stabilité |
| `reperes` | Quatre repères d'angle | Le cadrage, la précision |
| `assises` | Trois rangs de pierre de taille | La solidité |
| `niveau` | Cadre et barre de niveau | Le contrôle, l'exécution juste |

`HyphensBrand.icons()` renvoie la liste. Les explorations écartées (grue, échafaudage, spirale...) sont dans `Identité visuelle/04-icone-moex/`.

## Palettes et couleurs

Chaque palette définit les mêmes rôles (variables CSS `--hy-...`) :

| Variable | Rôle |
|---|---|
| `--hy-logo-exterieur` / `--hy-logo-interieur` | les deux couches du H, sur fond clair |
| `--hy-logo-exterieur-fonce` / `--hy-logo-interieur-fonce` | les mêmes sur fond foncé |
| `--hy-texte` / `--hy-texte-secondaire` | texte courant, légendes |
| `--hy-fond` / `--hy-surface` / `--hy-fonce` | fond principal, fonds doux, fonds sombres |
| `--hy-trait` | filets et bordures |
| `--hy-signal` | seule couleur vive : alertes, retards, appel à l'action rare |

- Changer de palette : `HyphensBrand.setPalette("encre-et-prusse")` ou l'attribut `data-palette` sur `<html>` ou sur une section.
- Zone sombre : `data-tone="fonce"` sur l'élément. Le logo y prend automatiquement ses couleurs claires.
- Ajouter ou retoucher une palette : modifier `tokens/palettes.json`, puis `python brand/build_tokens.py`.

## Géométrie du monogramme

Trame de 1000 unités de haut, largeur 900. Version 3 lignes : traits verticaux de 62, interstices de 26, horizontales à 93 % de l'épaisseur des verticales (correction optique), barre centrale au centre optique (47,9 % de la hauteur). Les proportions d'origine de l'image ChatGPT (trait 30, interstice 24 sur 660 de haut) sont dans `Identité visuelle/03-monogramme-H/monogrammes-H-v4/`.
