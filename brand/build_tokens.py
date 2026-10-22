"""Génère les jetons de marque HYPHENS à partir de tokens/palettes.json.

Sorties :
  tokens/hyphens-tokens.css   variables CSS, une palette par sélecteur [data-palette="..."]
  tokens/hyphens-palettes.js  la même donnée pour le JavaScript (window.HYPHENS_PALETTES)

Usage : python brand/build_tokens.py
"""
import json
import re
from pathlib import Path

ICI = Path(__file__).resolve().parent
SRC = ICI / "tokens" / "palettes.json"


def kebab(nom):
    return re.sub(r"(?<!^)(?=[A-Z])", "-", nom).lower()


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    roles = list(data["roles"])
    defaut = data["defaut"]
    lignes = [
        "/* Fichier généré par brand/build_tokens.py à partir de tokens/palettes.json. Ne pas modifier à la main. */",
        "",
        ":root {",
        '  --hy-font: "proxima-nova", "Montserrat", "Helvetica Neue", Arial, sans-serif;',
        "  --hy-font-weight-regular: 400;",
        "  --hy-font-weight-semibold: 600;",
        "  --hy-font-weight-bold: 700;",
        "  --hy-logo-tracking: 0.06em;",
        "}",
        "",
    ]
    for cle, p in data["palettes"].items():
        sel = f':root, [data-palette="{cle}"]' if cle == defaut else f'[data-palette="{cle}"]'
        lignes.append(f"/* {p['nom']} : {p['idee']} */")
        lignes.append(sel + " {")
        for r in roles:
            lignes.append(f"  --hy-{kebab(r)}: {p[r]};")
        lignes.append("}")
        lignes.append("")
    # Contexte foncé : le logo bascule sur ses couleurs « Fonce » sans changer de palette
    lignes += [
        "/* Toute zone marquée data-tone=\"fonce\" (en-tête sombre, pied de page...) */",
        '[data-tone="fonce"] {',
        "  --hy-logo-exterieur: var(--hy-logo-exterieur-fonce);",
        "  --hy-logo-interieur: var(--hy-logo-interieur-fonce);",
        "  --hy-texte: var(--hy-logo-exterieur-fonce);",
        "  background: var(--hy-fonce);",
        "  color: var(--hy-logo-exterieur-fonce);",
        "}",
        "",
    ]
    (ICI / "tokens" / "hyphens-tokens.css").write_text("\n".join(lignes), encoding="utf-8")
    js = ("/* Fichier généré par brand/build_tokens.py. Ne pas modifier à la main. */\n"
          f"window.HYPHENS_PALETTES = {json.dumps(data['palettes'], ensure_ascii=False, indent=2)};\n"
          f"window.HYPHENS_PALETTE_DEFAUT = {json.dumps(defaut)};\n")
    (ICI / "tokens" / "hyphens-palettes.js").write_text(js, encoding="utf-8")
    print(f"{len(data['palettes'])} palettes générées, défaut : {defaut}")


if __name__ == "__main__":
    main()
