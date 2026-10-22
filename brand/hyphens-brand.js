/*
 * HYPHENS · composants de marque (sans dépendance, fonctionne aussi en file://)
 *
 *   <hyphens-logo variant="prolongee" scale="1.15"></hyphens-logo>
 *   <hyphens-mark></hyphens-mark>  (déclinaison grand, moyen ou petit choisie selon la taille)
 *   HyphensBrand.setPalette("foret-et-lichen")
 *
 * Les couleurs viennent des variables CSS --hy-* (tokens/hyphens-tokens.css) :
 * changer de palette recolore instantanément tous les logos de la page.
 * La taille suit le font-size de l'élément (comme du texte).
 */
(function () {
  "use strict";

  var CAP = 0.667; // hauteur de capitale de Proxima Nova, en em
  // Mesures Proxima Nova Semibold (millièmes d'em) pour centrer le H entre HYP et ENS
  // Approches lues dans les contours des glyphes (P : 582 sur 608, E et H : départ à 71)
  var INK_HYP = 1891, INK_ENS = 1797, LSB_H = 71, RSB_P = 26, LSB_E = 71, RSB_S = 31.5;
  // Correction optique côté P (vide sous la boucle) : rapproche le H du P de OPT_P, rendu à l'interlettrage de HYP.
  // Mise à 0 le 21 octobre 2026 : le trait d'union doit être symétrique (même longueur côté P et côté E).
  var OPT_P = 0;
  var TRACK_ENS = 0.045 + (INK_HYP - INK_ENS) / 2000, TRACK_HYP = 0.045 + OPT_P / 2;
  var E_BAR = 0.3395; // centre de la barre centrale du E de Proxima Nova Semibold, en em au-dessus de la ligne de base
  var SVGNS = "http://www.w3.org/2000/svg";

  /* Géométrie du monogramme, trame de 1000 unités de haut et 900 de large, en trois déclinaisons de taille.
   * Sous une certaine taille, des lignes plus fines qu'un pixel se fondent : on change alors de dessin.
   *   grand : 3 lignes par fût (fût extérieur, fût médian + barre, ligne en U et en n). Version de référence.
   *   moyen : 2 lignes droites par fût et la barre centrale, interstices élargis (le H intérieur reste lisible).
   *   petit : H plein, fûts dans la couleur extérieure, barre dans la couleur intérieure. */
  function geometry(taille) {
    if (taille === 3 || taille === "3") taille = "grand";
    if (taille === 2 || taille === "2") taille = "moyen";
    var Hh = 1000, W = 900, ext = [], int = [], S, G, HS, YC;
    if (taille === "petit") {
      S = 250; HS = 190; YC = Math.round(Hh * 0.479 - HS / 2);
      ext.push([0, 0, S, Hh], [W - S, 0, S, Hh]);
      int.push([S, YC, W - 2 * S, HS]);
    } else if (taille === "moyen") {
      S = 135; G = 95; HS = 130; YC = Math.round(Hh * 0.479 - HS / 2);
      ext.push([0, 0, S, Hh], [W - S, 0, S, Hh]);
      int.push([S + G, 0, S, Hh], [W - 2 * S - G, 0, S, Hh], [S + G, YC, W - 2 * (S + G), HS]);
    } else {
      S = 62; G = 26; HS = Math.round(S * 0.93); YC = Math.round(Hh * 0.479 - HS / 2);
      ext.push([0, 0, S, Hh], [W - S, 0, S, Hh]);
      int.push([S + G, 0, S, Hh], [W - 2 * S - G, 0, S, Hh], [S + G, YC, W - 2 * (S + G), HS]);
      var xi = 2 * (S + G), xr = W - 3 * S - 2 * G, yb = YC - G - HS, yt = YC + HS + G;
      ext.push([xi, 0, S, yb + HS], [xr, 0, S, yb + HS], [xi, yb, xr + S - xi, HS],
               [xi, yt, S, Hh - yt], [xr, yt, S, Hh - yt], [xi, yt, xr + S - xi, HS]);
    }
    return { W: W, H: Hh, HS: HS, YC: YC, ext: ext, int: int, taille: taille || "grand" };
  }
  /* Choix automatique de la déclinaison selon la hauteur affichée du H, en pixels */
  var SEUIL_GRAND = 36, SEUIL_MOYEN = 15;
  function tailleAuto(hPx) { return hPx >= SEUIL_GRAND ? "grand" : (hPx >= SEUIL_MOYEN ? "moyen" : "petit"); }

  function rect(r, fill) {
    var e = document.createElementNS(SVGNS, "rect");
    e.setAttribute("x", r[0]); e.setAttribute("y", r[1]);
    e.setAttribute("width", r[2]); e.setAttribute("height", r[3]);
    e.setAttribute("fill", fill);
    return e;
  }

  function markSVG(taille, extL, extR) {
    var g = geometry(taille);
    var vbx = -(extL || 0), vbw = g.W + (extL || 0) + (extR || 0);
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", vbx + " 0 " + vbw + " " + g.H);
    svg.setAttribute("aria-hidden", "true");
    g.ext.forEach(function (r) { svg.appendChild(rect(r, "var(--hy-logo-exterieur)")); });
    g.int.forEach(function (r) { svg.appendChild(rect(r, "var(--hy-logo-interieur)")); });
    return { svg: svg, g: g };
  }

  var BASE_CSS = ":host{display:inline-block;line-height:1;color:var(--hy-logo-exterieur)}" +
    "svg{display:inline-block;overflow:visible} .w{font-family:var(--hy-font);font-weight:600;white-space:nowrap}";

  /* <hyphens-logo>
   *   variant : prolongee (défaut) | detachee | detachee-courte | aucune
   *   position : milieu (défaut) | debut (H stylisé en tête, sans trait)
   *   bar-weight : épaisseur du trait d'union en part de la barre du H (défaut 1)
   *   scale   : taille du H central par rapport aux capitales (défaut 1.15, retenu le 21 octobre 2026 pour mieux intégrer le H au mot)
   *   gap     : espace d'encre entre H et E en em (défaut 0.07), identique côté P : trait d'union symétrique
   *   compact : taille en px sous laquelle la barre disparaît automatiquement (défaut 22)
   *   taille  : auto (défaut, selon la hauteur affichée du H) | grand | moyen | petit
   */
  class HyphensLogo extends HTMLElement {
    static get observedAttributes() { return ["variant", "scale", "gap", "compact", "position", "bar-weight", "taille"]; }
    constructor() { super(); this.attachShadow({ mode: "open" }); }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      var fs = parseFloat(getComputedStyle(this).fontSize) || 16;
      var position = this.getAttribute("position") || "milieu";
      var variant = this.getAttribute("variant") || "prolongee";
      if (position === "debut" || fs < parseFloat(this.getAttribute("compact") || 22)) variant = "aucune";
      var k = parseFloat(this.getAttribute("scale") || 1.15);
      var gap = parseFloat(this.getAttribute("gap") || 0.07);   // espace d'encre H|E, en em
      var gapP = gap - OPT_P;  // espace d'encre P|H, corrigé optiquement (compensé dans l'interlettrage de HYP)
      var hEm = k * CAP, sc = hEm / 1000; // em par unité de trame
      var va = CAP * (1 - k) / 2;          // H centré sur la hauteur des capitales
      var taille = this.getAttribute("taille") || "auto";
      if (taille === "auto") taille = tailleAuto(fs * hEm);
      this.setAttribute("data-taille", taille);
      var w = document.createElement("span");
      w.className = "w";
      if (position === "debut") {
        // H stylisé en tête du mot, sans trait d'union : [H]YPHENS
        var md = gap - 1 / 1000;             // approche du Y quasi nulle
        var mh = markSVG(taille, 0, md / sc);
        mh.svg.style.height = hEm + "em";
        mh.svg.style.width = (mh.g.W * sc + md) + "em";
        mh.svg.style.verticalAlign = va + "em";
        w.appendChild(mh.svg);
        var reste = document.createElement("span");
        reste.innerHTML = '<span style="letter-spacing:0.06em">YPHEN</span>S';
        w.appendChild(reste);
      } else {
        var ml = gapP - RSB_P / 1000, mr = gap - LSB_E / 1000;
        var m = markSVG(taille, ml / sc, mr / sc), g = m.g;
        var court = { aucune: null, prolongee: 0, detachee: 0.02, "detachee-courte": 0.035 }[variant];
        if (court !== null && court !== undefined) {
          // Trait d'union : épaisseur de la barre du H (bar-weight pour l'affiner), aligné sur la barre centrale du E
          var bw = parseFloat(this.getAttribute("bar-weight") || 1);
          var th = g.HS * bw;
          var yc = (hEm - (E_BAR - va)) / sc;  // centre de la barre du E, en unités de trame depuis le haut du H
          var LL = Math.max(0, gapP - court) / sc, LR = Math.max(0, gap - court) / sc;
          m.svg.appendChild(rect([-LL, yc - th / 2, LL, th], "var(--hy-logo-interieur)"));
          m.svg.appendChild(rect([g.W, yc - th / 2, LR, th], "var(--hy-logo-interieur)"));
        }
        m.svg.style.height = hEm + "em";
        m.svg.style.width = (g.W * sc + ml + mr) + "em";
        m.svg.style.verticalAlign = va + "em";
        w.style.paddingRight = ((LSB_H - RSB_S) / 1000) + "em"; // centrage à l'encre
        w.innerHTML = '<span style="letter-spacing:' + TRACK_HYP + 'em">HY</span>P';
        w.appendChild(m.svg);
        var ens = document.createElement("span");
        ens.innerHTML = '<span style="letter-spacing:' + TRACK_ENS + 'em">EN</span>S';
        w.appendChild(ens);
      }
      this.shadowRoot.innerHTML = "<style>" + BASE_CSS + "</style>";
      this.shadowRoot.appendChild(w);
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", "HYPHENS");
    }
  }

  /* <hyphens-mark> : le H seul (avatar, favicon, tampon). Hauteur = 1em par défaut.
   *   taille : auto (défaut : grand dès 48 px, moyen dès 20 px, petit en dessous) | grand | moyen | petit
   *   lines  : ancien attribut conservé (3 = grand, 2 = moyen, auto = auto) */
  class HyphensMark extends HTMLElement {
    static get observedAttributes() { return ["lines", "taille"]; }
    constructor() { super(); this.attachShadow({ mode: "open" }); }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      var t = this.getAttribute("taille") || ({ "3": "grand", "2": "moyen" }[this.getAttribute("lines")]) || "auto";
      if (t === "auto") { var px = parseFloat(getComputedStyle(this).fontSize) || 16; t = px >= 48 ? "grand" : (px >= 20 ? "moyen" : "petit"); }
      this.setAttribute("data-taille", t);
      var m = markSVG(t, 0, 0);
      m.svg.style.height = "1em"; m.svg.style.width = (m.g.W / m.g.H) + "em";
      this.shadowRoot.innerHTML = "<style>" + BASE_CSS + "</style>";
      this.shadowRoot.appendChild(m.svg);
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", "HYPHENS");
    }
  }

  /* Icônes de marque : signes abstraits et carrés, grammaire du monogramme
   * (trois traits parallèles, épaisseur 62, interstice 26 sur une trame de 1000, trait du milieu en couleur intérieure). */
  var IS = 62, IP = 88, E = "var(--hy-logo-exterieur)", I = "var(--hy-logo-interieur)", TRIO = [E, I, E];
  function ipl(pts, col) {
    return '<polyline points="' + pts.map(function (p) { return Math.round(p[0]) + "," + Math.round(p[1]); }).join(" ") +
      '" fill="none" stroke="' + col + '" stroke-width="' + IS + '" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="10"/>';
  }
  function irect(o, col, fill) {
    return '<rect x="' + o + '" y="' + o + '" width="' + (1000 - 2 * o) + '" height="' + (1000 - 2 * o) + '" fill="' + (fill ? col : "none") +
      '"' + (fill ? "" : ' stroke="' + col + '" stroke-width="' + IS + '"') + "/>";
  }
  function ibloc(x, y, w, h, col) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + col + '"/>'; }
  var ICONES = {
    reception: { nom: "Réception", sens: "Réserves levées, ouvrage reçu", dessin: function () {
      return TRIO.map(function (c, k) { var d = k * IP * 1.4142; return ipl([[60, 560 - d], [330, 830 - d], [940, 220 - d]], c); }).join("");
    } },
    equerre: { nom: "Équerre", sens: "La rigueur, l'angle droit", dessin: function () {
      return TRIO.map(function (c, k) { var o = k * IP; return ipl([[31 + o, 0], [31 + o, 969 - o], [1000, 969 - o]], c); }).join("");
    } },
    "carres-emboites": { nom: "Carrés emboîtés", sens: "La stabilité", dessin: function () {
      return TRIO.map(function (c, k) { return irect(31 + k * IP, c); }).join("");
    } },
    reperes: { nom: "Repères d'angle", sens: "Le cadrage, la précision", dessin: function () {
      var s = "", L = 330;
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (q) {
        TRIO.forEach(function (c, k) {
          var o = 31 + k * IP, a = q[0] ? 1000 - o : o, b = q[1] ? 1000 - o : o, dx = q[0] ? -1 : 1, dy = q[1] ? -1 : 1;
          s += ipl([[a, b + dy * (L - k * IP)], [a, b], [a + dx * (L - k * IP), b]], c);
        });
      });
      return s;
    } },
    assises: { nom: "Assises", sens: "La solidité", dessin: function () {
      return ibloc(0, 140, 1000, 200, E) + ibloc(0, 400, 440, 200, I) + ibloc(500, 400, 500, 200, I) + ibloc(0, 660, 1000, 200, E);
    } },
    niveau: { nom: "Niveau", sens: "Le contrôle, l'exécution juste", dessin: function () {
      return irect(31, E) + irect(31 + IP, E) + ibloc(2 * IP, 448, 1000 - 4 * IP, IS, I);
    } }
  };

  /* <hyphens-icon name="reception">, hauteur 1em. Noms : reception, equerre, carres-emboites, reperes, assises, niveau */
  class HyphensIcon extends HTMLElement {
    static get observedAttributes() { return ["name"]; }
    constructor() { super(); this.attachShadow({ mode: "open" }); }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      var ic = ICONES[this.getAttribute("name")] || ICONES.reception;
      this.shadowRoot.innerHTML = "<style>:host{display:inline-block;line-height:0}svg{height:1em;width:1em;display:block;overflow:visible}</style>" +
        '<svg viewBox="0 0 1000 1000" aria-hidden="true">' + ic.dessin() + "</svg>";
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", ic.nom);
    }
  }

  function rerender() {
    document.querySelectorAll("hyphens-logo, hyphens-mark, hyphens-icon").forEach(function (el) { el.render(); });
  }

  var HyphensBrand = {
    palettes: function () { return window.HYPHENS_PALETTES || {}; },
    current: function () { return document.documentElement.getAttribute("data-palette") || window.HYPHENS_PALETTE_DEFAUT; },
    setPalette: function (cle, cible) {
      (cible || document.documentElement).setAttribute("data-palette", cle);
      HyphensBrand.updateFavicon();
    },
    /* SVG autonome du H avec les couleurs résolues de la palette courante (favicon, export) */
    markSVGString: function (taille, cle) {
      var p = HyphensBrand.palettes()[cle || HyphensBrand.current()] || {};
      var m = markSVG(taille || "petit", 0, 0);
      var s = new XMLSerializer().serializeToString(m.svg)
        .replace(/var\(--hy-logo-exterieur\)/g, p.logoExterieur || "#000")
        .replace(/var\(--hy-logo-interieur\)/g, p.logoInterieur || "#000");
      return s.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
    },
    updateFavicon: function () {
      var link = document.querySelector('link[rel="icon"][data-hyphens]');
      if (!link) return;
      link.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(HyphensBrand.markSVGString("petit"));
    },
    /* Liste des icônes disponibles : { cle: { nom, sens } } */
    icons: function () {
      var r = {};
      Object.keys(ICONES).forEach(function (k) { r[k] = { nom: ICONES[k].nom, sens: ICONES[k].sens }; });
      return r;
    },
    rerender: rerender
  };

  if (!customElements.get("hyphens-logo")) customElements.define("hyphens-logo", HyphensLogo);
  if (!customElements.get("hyphens-mark")) customElements.define("hyphens-mark", HyphensMark);
  if (!customElements.get("hyphens-icon")) customElements.define("hyphens-icon", HyphensIcon);
  window.HyphensBrand = HyphensBrand;
  // Re-mesure après chargement de la police (la taille de repli peut différer)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rerender);
  document.addEventListener("DOMContentLoaded", HyphensBrand.updateFavicon);
})();
