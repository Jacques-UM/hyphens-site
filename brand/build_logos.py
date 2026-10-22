"""Fichiers maîtres du logo HYPHENS : SVG et PDF vectoriels (lettres vectorisées) et favicons PNG.

Usage :
  python brand/build_logos.py                        palette par défaut (palettes.json)
  python brand/build_logos.py --palette foret-et-lichen
  python brand/build_logos.py --reperage             couleurs de repérage rouge et vert (import Figma)

Sorties dans brand/logo/<palette>/ :
  logo/<version>/<taille>-<fond>.svg et .pdf   versions : prolongee, detachee, sans-barre, h-en-tete
  symbole/<taille>-<fond>.svg et .pdf          tailles : grand, moyen, petit ; fonds : clair, fonce
  favicons/favicon-16.png, favicon-32.png, favicon-48.png (calés au pixel), favicon.svg,
           apple-touch-icon-180.png, icone-512.png
Les dessins viennent de brand/hyphens-brand.js : ce script ne redessine rien, il exporte.
Nécessite Microsoft Edge et PyMuPDF.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

import fitz
from PIL import Image, ImageDraw

ICI = Path(__file__).resolve().parent
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
VERSIONS = {"prolongee": 'variant="prolongee"', "detachee": 'variant="detachee"',
            "sans-barre": 'variant="aucune" compact="0"', "h-en-tete": 'position="debut"'}
TAILLES = ["grand", "moyen", "petit"]
FONDS = ["clair", "fonce"]


def couleurs(palette, reperage):
    if reperage:
        return {"clair": ("#FF0000", "#00FF00"), "fonce": ("#FF0000", "#00FF00")}
    p = json.loads((ICI / "tokens" / "palettes.json").read_text(encoding="utf-8"))["palettes"][palette]
    return {"clair": (p["logoExterieur"], p["logoInterieur"]), "fonce": (p["logoExterieurFonce"], p["logoInterieurFonce"]), "_p": p}


def pages(cols):
    """Une page par élément, chacun avec ses couleurs, pour un seul passage d'impression."""
    items = []
    for v, attr in VERSIONS.items():
        for t in TAILLES:
            for f in FONDS:
                items.append((f"logo/{v}/{t}-{f}", f'<hyphens-logo {attr} taille="{t}" style="font-size:100px"></hyphens-logo>', f))
    for t in TAILLES:
        for f in FONDS:
            items.append((f"symbole/{t}-{f}", f'<hyphens-mark taille="{t}" style="font-size:200px"></hyphens-mark>', f))
    corps = "".join(
        f'<section style="--hy-logo-exterieur:{cols[f][0]};--hy-logo-interieur:{cols[f][1]}">{html}</section>' for _, html, f in items)
    b = ICI.as_uri()
    doc = (f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://use.typekit.net/ted1nei.css">'
           f'<link rel="stylesheet" href="{b}/tokens/hyphens-tokens.css"><script src="{b}/tokens/hyphens-palettes.js"></script>'
           f'<script src="{b}/hyphens-brand.js"></script><style>@page{{size:1400px 500px;margin:0}}html,body{{margin:0;background:transparent}}'
           f'section{{height:500px;padding:80px;box-sizing:border-box;page-break-after:always}}</style></head><body>{corps}</body></html>')
    return items, doc


def svg_propre(page):
    """SVG à lettres vectorisées, sans masques, recadré sur le dessin."""
    s = page.get_svg_image(text_as_path=True)
    w, h = re.search(r'width="([\d.]+)" height="([\d.]+)"', s).groups()
    glyph = {}
    for gid, body in re.findall(r'<g id="(font_[^"]+)">(.*?)</g>', s, re.S):
        m = re.search(r'd="([^"]+)"', body)
        glyph[gid] = m.group(1) if m else None
    corps = re.sub(r"<defs>.*?</defs>", "", s, flags=re.S)
    els = []
    for m in re.finditer(r'<use [^>]*xlink:href="#([^"]+)" transform="matrix\(([^)]+)\)" fill="([^"]+)"/>|<path ([^>]*)/>', corps):
        if m.group(1):
            g = glyph.get(m.group(1))
            if not g:
                continue
            a, _, _, d, e, f = [float(x) for x in re.split(r"[ ,]+", m.group(2).strip())]
            els.append(f'<path d="{g}" transform="matrix({a * 0.001:.6f},0,0,{-d * 0.001:.6f},{e:.4f},{f:.4f})" fill="{m.group(3)}"/>')
        elif "clip-rule" not in m.group(4):
            els.append("<path " + m.group(4) + "/>")
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">' + "".join(els) + "</svg>"


def favicons(dossier, p):
    """Favicons dessinés directement sur la grille de pixels : aucun trait ne tombe entre deux pixels."""
    dossier.mkdir(parents=True, exist_ok=True)
    ext, inn, fonce, fe, fi = p["logoExterieur"], p["logoInterieur"], p["fonce"], p["logoExterieurFonce"], p["logoInterieurFonce"]

    def dessine(n, rects_ext, rects_int, fond=None, ce=ext, ci=inn):
        im = Image.new("RGBA", (n, n), fond or (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        for x, y, w, h in rects_ext:
            d.rectangle([x, y, x + w - 1, y + h - 1], fill=ce)
        for x, y, w, h in rects_int:
            d.rectangle([x, y, x + w - 1, y + h - 1], fill=ci)
        return im
    # 16 px : H plein bicolore, fûts de 4 px, barre de 3 px
    dessine(16, [(1, 1, 4, 14), (11, 1, 4, 14)], [(5, 6, 6, 3)]).save(dossier / "favicon-16.png")
    # 32 px : deux lignes droites par fût et barre, traits de 4 px, interstices de 3 px
    dessine(32, [(3, 2, 4, 28), (25, 2, 4, 28)], [(10, 2, 4, 28), (18, 2, 4, 28), (10, 14, 12, 4)]).save(dossier / "favicon-32.png")
    # 48 px : même dessin, traits de 6 px, interstices de 4 px
    dessine(48, [(5, 3, 6, 42), (37, 3, 6, 42)], [(15, 3, 6, 42), (27, 3, 6, 42), (15, 21, 18, 6)]).save(dossier / "favicon-48.png")
    return fe, fi, fonce


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--palette", default=None)
    ap.add_argument("--reperage", action="store_true")
    a = ap.parse_args()
    data = json.loads((ICI / "tokens" / "palettes.json").read_text(encoding="utf-8"))
    palette = a.palette or data["defaut"]
    nom = "reperage" if a.reperage else palette
    cols = couleurs(palette, a.reperage)
    out = ICI / "logo" / nom
    items, doc = pages(cols)
    tmp_html, tmp_pdf = ICI / "_logos.html", ICI / "_logos.pdf"
    tmp_html.write_text(doc, encoding="utf-8")
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=20000",
                    f"--print-to-pdf={tmp_pdf}", tmp_html.as_uri()], capture_output=True, timeout=240)
    src = fitz.open(tmp_pdf)
    assert src.page_count >= len(items), f"{src.page_count} pages pour {len(items)} éléments"
    for i, (chemin, _, _) in enumerate(items):
        page = src[i]
        boites = [fitz.Rect(b[1]) for b in page.get_bboxlog() if fitz.Rect(b[1]).width < page.rect.width * 0.99]
        r = boites[0]
        for b in boites[1:]:
            r |= b
        r = r & page.rect
        cible = out / chemin
        cible.parent.mkdir(parents=True, exist_ok=True)
        unique = fitz.open()
        unique.new_page(width=r.width, height=r.height).show_pdf_page(fitz.Rect(0, 0, r.width, r.height), src, i, clip=r)
        unique.save(cible.with_suffix(".pdf"), garbage=3, deflate=True)
        unique.close()
        page.set_cropbox(r)
        cible.with_suffix(".svg").write_text(svg_propre(page), encoding="utf-8")
    src.close()
    tmp_pdf.unlink(missing_ok=True)
    tmp_html.unlink(missing_ok=True)
    if not a.reperage:
        p = cols["_p"]
        fav = out / "favicons"
        fe, fi, fonce = favicons(fav, p)
        # favicon.svg : H petit (lisible de 16 à 32 px)
        (fav / "favicon.svg").write_text((out / "symbole" / "petit-clair.svg").read_text(encoding="utf-8"), encoding="utf-8")
        # icônes d'application : H grand sur fond foncé, rendu depuis le vecteur
        for n, nomf in ((180, "apple-touch-icon-180.png"), (512, "icone-512.png")):
            sv = fitz.open(out / "symbole" / "grand-fonce.pdf")
            pg = sv[0]
            z = (n * 0.62) / pg.rect.height
            pix = pg.get_pixmap(matrix=fitz.Matrix(z, z), alpha=True)
            h = Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)
            fond = Image.new("RGBA", (n, n), fonce)
            fond.paste(h, ((n - h.width) // 2, (n - h.height) // 2), h)
            fond.convert("RGB").save(fav / nomf)
            sv.close()
    print(f"{len(items)} fichiers SVG et PDF dans {out}")


if __name__ == "__main__":
    main()
