/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   icons.js — hand-drawn pixel icons
   ----------------------------------------------------------------------------
   Every icon is plain SVG on an integer grid with shape-rendering="crispEdges",
   which is what gives them the chunky, un-antialiased 1995 look at any zoom
   level. Icons are always decorative: the visible text label next to them
   carries the meaning, so they all render aria-hidden.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});

  var ART = {
    /* Manila folder — the catalog's file-finder icon. */
    folder:
      '<path d="M2 10 L2 5 L13 5 L16 8 L30 8 L30 10 Z" fill="#c8a13a" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="2" y="9" width="28" height="18" fill="#ffe680" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="5" y="13" width="16" height="2" fill="#8a6d1d"/>' +
      '<rect x="5" y="18" width="20" height="2" fill="#8a6d1d"/>',

    /* Open folder, used for the currently-open catalog directory. */
    folderOpen:
      '<path d="M2 27 L2 6 L12 6 L15 9 L26 9 L26 13 L8 13 L3 27 Z" fill="#ffe680" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M8 13 L31 13 L26 27 L3 27 Z" fill="#f2cf52" stroke="#000" stroke-width="1.5"/>',

    /* Book / installation guide. */
    book:
      '<rect x="3" y="3" width="26" height="26" fill="#c00000" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="7" y="3" width="22" height="26" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="11" y="9"  width="14" height="2" fill="#000"/>' +
      '<rect x="11" y="14" width="14" height="2" fill="#000"/>' +
      '<rect x="11" y="19" width="9"  height="2" fill="#000"/>',

    /* Terminal / chat window. */
    terminal:
      '<rect x="2" y="4" width="28" height="22" fill="#c0c0c0" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="5" y="7" width="22" height="16" fill="#000000"/>' +
      '<rect x="7" y="10" width="8" height="2" fill="#00ff66"/>' +
      '<rect x="7" y="14" width="14" height="2" fill="#00ff66"/>' +
      '<rect x="7" y="18" width="4" height="3" fill="#00ff66"/>' +
      '<rect x="10" y="27" width="12" height="3" fill="#808080" stroke="#000" stroke-width="1"/>',

    /* Warning shield — the scam-spotting simulator. */
    shield:
      '<path d="M16 2 L29 7 L29 16 C29 24 22 29 16 31 C10 29 3 24 3 16 L3 7 Z" fill="#ffe680" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="14" y="9"  width="4" height="12" fill="#000"/>' +
      '<rect x="14" y="23" width="4" height="4"  fill="#000"/>',

    /* Certificate with a ribbon. */
    certificate:
      '<rect x="3" y="4" width="26" height="19" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="7" y="9"  width="18" height="2" fill="#000"/>' +
      '<rect x="7" y="13" width="12" height="2" fill="#000"/>' +
      '<circle cx="22" cy="22" r="5" fill="#c00000" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M19 26 L17 31 L22 29 L26 31 L24 26 Z" fill="#c00000" stroke="#000" stroke-width="1.5"/>',

    /* Briefcase — the enterprise / B2B desk. */
    briefcase:
      '<rect x="12" y="4" width="8" height="4" fill="none" stroke="#000" stroke-width="2"/>' +
      '<rect x="2" y="8" width="28" height="20" fill="#8a5a2b" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="2" y="15" width="28" height="4" fill="#5e3c1c" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="13" y="14" width="6" height="6" fill="#c0c0c0" stroke="#000" stroke-width="1.5"/>',

    /* Control panel sliders. */
    sliders:
      '<rect x="2" y="4" width="28" height="24" fill="#c0c0c0" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="6" y="9"  width="20" height="2" fill="#000"/>' +
      '<rect x="6" y="16" width="20" height="2" fill="#000"/>' +
      '<rect x="6" y="23" width="20" height="2" fill="#000"/>' +
      '<rect x="9"  y="6"  width="5" height="8" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="18" y="13" width="5" height="8" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="12" y="20" width="5" height="8" fill="#ffffff" stroke="#000" stroke-width="1.5"/>',

    /* Question mark — help and human support. */
    help:
      '<circle cx="16" cy="16" r="14" fill="#000080" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M11 12 C11 8 21 8 21 13 C21 17 16 17 16 21" fill="none" stroke="#ffffff" stroke-width="3"/>' +
      '<rect x="14" y="24" width="4" height="4" fill="#ffffff"/>',

    /* Desktop computer — the About box and the boot logo. */
    computer:
      '<rect x="2" y="4" width="28" height="20" fill="#c0c0c0" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="6" y="8" width="20" height="12" fill="#000080"/>' +
      '<rect x="8" y="10" width="10" height="2" fill="#00ff66"/>' +
      '<rect x="8" y="14" width="14" height="2" fill="#00ff66"/>' +
      '<rect x="10" y="24" width="12" height="4" fill="#808080" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="6" y="28" width="20" height="2" fill="#000"/>',

    /* Stop sign — errors. */
    stop:
      '<circle cx="16" cy="16" r="14" fill="#c00000" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="8" y="13" width="16" height="6" fill="#ffffff"/>',

    /* Caution triangle — warnings. */
    caution:
      '<path d="M16 2 L31 29 L1 29 Z" fill="#ffe680" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="14" y="11" width="4" height="10" fill="#000"/>' +
      '<rect x="14" y="23" width="4" height="4"  fill="#000"/>',

    /* Information — the friendly default. */
    info:
      '<circle cx="16" cy="16" r="14" fill="#000080" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="14" y="6"  width="4" height="4"  fill="#ffffff"/>' +
      '<rect x="14" y="13" width="4" height="13" fill="#ffffff"/>',

    /* Floppy disk — the welcome disk. */
    floppy:
      '<rect x="3" y="3" width="26" height="26" fill="#404040" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="9" y="3" width="14" height="11" fill="#c0c0c0" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="18" y="5" width="3" height="7" fill="#404040"/>' +
      '<rect x="7" y="18" width="18" height="11" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="10" y="21" width="12" height="2" fill="#000"/>' +
      '<rect x="10" y="25" width="8"  height="2" fill="#000"/>',

    /* Telephone — the scam-call lessons. */
    phone:
      '<path d="M6 3 L13 3 L15 11 L11 14 C13 19 17 23 22 25 L25 21 L31 23 L31 29 C18 31 3 17 4 4 Z" fill="#101010" stroke="#000" stroke-width="1.5"/>',

    /* Heart-rate line — the health module. */
    pulse:
      '<rect x="2" y="6" width="28" height="20" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M4 17 L10 17 L13 10 L17 24 L20 17 L28 17" fill="none" stroke="#c00000" stroke-width="2.5"/>',

    /* Coin stack — the money module. */
    coins:
      '<ellipse cx="16" cy="9"  rx="11" ry="4" fill="#ffe680" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M5 9 L5 15 C5 17 10 19 16 19 C22 19 27 17 27 15 L27 9" fill="#ffe680" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M5 16 L5 22 C5 24 10 26 16 26 C22 26 27 24 27 22 L27 16" fill="#f2cf52" stroke="#000" stroke-width="1.5"/>',

    /* Speech balloon — the communication module. */
    balloon:
      '<rect x="2" y="4" width="28" height="18" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M8 22 L8 29 L15 22 Z" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<rect x="6" y="9"  width="20" height="2" fill="#000"/>' +
      '<rect x="6" y="14" width="13" height="2" fill="#000"/>',

    /* Microphone — the voice-first module. */
    mic:
      '<rect x="12" y="2" width="8" height="15" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M7 14 C7 22 25 22 25 14" fill="none" stroke="#000" stroke-width="2.5"/>' +
      '<rect x="14" y="22" width="4" height="6" fill="#000"/>' +
      '<rect x="9" y="28" width="14" height="3" fill="#000"/>',

    /* Brain-in-a-grid — the cognitive longevity module. */
    brain:
      '<rect x="3" y="4" width="26" height="24" fill="#ffffff" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M11 22 C6 20 7 12 12 11 C13 7 20 7 21 11 C26 12 27 20 21 22 Z" fill="#d6e4ff" stroke="#000" stroke-width="1.5"/>' +
      '<path d="M16 11 L16 22 M12 15 L20 15" fill="none" stroke="#000" stroke-width="1.5"/>'
  };

  /**
   * Return an <svg> string for the named icon.
   * @param {string} name  key of ART
   * @param {number} size  rendered CSS pixel size (the grid is always 32x32)
   */
  CS95.icon = function (name, size) {
    var body = ART[name] || ART.info;
    var px = size || 32;
    return (
      '<svg class="pixel-icon" viewBox="0 0 32 32" width="' + px + '" height="' + px + '" ' +
      'shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + body + "</svg>"
    );
  };

  /** Same, but returned as a live element. */
  CS95.iconEl = function (name, size) {
    var holder = document.createElement("span");
    holder.className = "icon-holder";
    holder.setAttribute("aria-hidden", "true");
    holder.innerHTML = CS95.icon(name, size);
    return holder;
  };

  CS95.iconNames = Object.keys(ART);
})();
