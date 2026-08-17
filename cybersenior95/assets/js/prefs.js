/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   prefs.js — global namespace, screen-reader announcements, saved preferences
   ----------------------------------------------------------------------------
   Loaded first. Everything else hangs off window.CS95.
   Plain scripts (no ES modules) so the desktop also runs straight off the
   file system with a double-click, exactly like the software it imitates.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});

  /* ---------------------------------------------------------------- utils */

  /** Build an element from a tag, an attribute bag and children. */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value === null || value === undefined || value === false) return;
        if (key === "class") node.className = value;
        else if (key === "html") node.innerHTML = value;
        else if (key === "text") node.textContent = value;
        else if (key === "dataset") {
          Object.keys(value).forEach(function (d) { node.dataset[d] = value[d]; });
        } else if (key.slice(0, 2) === "on" && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (value === true) {
          node.setAttribute(key, "");
        } else {
          node.setAttribute(key, value);
        }
      });
    }
    (Array.isArray(children) ? children : children ? [children] : []).forEach(function (child) {
      if (child === null || child === undefined || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  CS95.el = el;

  /** Escape text destined for an innerHTML string. */
  CS95.esc = function (value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /** Announce something to screen readers without moving focus. */
  var announceTimer = null;
  CS95.announce = function (message) {
    var region = document.getElementById("sr-announcer");
    if (!region) return;
    window.clearTimeout(announceTimer);
    region.textContent = "";
    announceTimer = window.setTimeout(function () {
      region.textContent = message;
    }, 60);
  };

  /* ------------------------------------------------------------ storage - */
  /* localStorage is unavailable in some privacy modes; degrade quietly. */
  var STORE_KEY = "agelessai.prefs.v1";

  function readStore() {
    try {
      return JSON.parse(window.localStorage.getItem(STORE_KEY) || "{}") || {};
    } catch (err) {
      return {};
    }
  }
  function writeStore(data) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (err) {
      /* Preferences simply will not persist. The session still works. */
    }
  }

  /* -------------------------------------------------------------- prefs - */
  var DEFAULTS = { textSize: 1, contrast: "normal", pattern: "teal" };
  var TEXT_SIZE_MIN = 1;
  var TEXT_SIZE_MAX = 5;
  var TEXT_SIZE_LABELS = {
    1: "Normal (18 point)",
    2: "Large (21 point)",
    3: "Larger (24 point)",
    4: "Extra large (27 point)",
    5: "Biggest (30 point)"
  };

  var state = Object.assign({}, DEFAULTS, readStore());
  state.textSize = Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, Number(state.textSize) || 1));

  var prefs = {
    TEXT_SIZE_MIN: TEXT_SIZE_MIN,
    TEXT_SIZE_MAX: TEXT_SIZE_MAX,

    get: function (key) { return state[key]; },

    set: function (key, value) {
      state[key] = value;
      writeStore(state);
      prefs.apply();
      document.dispatchEvent(new CustomEvent("cs95:prefschange", { detail: { key: key, value: value } }));
    },

    textSizeLabel: function () { return TEXT_SIZE_LABELS[state.textSize]; },

    /** Step the base font size. Returns true when the size actually changed. */
    stepTextSize: function (delta) {
      var next = Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, state.textSize + delta));
      if (next === state.textSize) {
        CS95.announce(
          delta > 0
            ? "Text is already at the biggest size."
            : "Text is already at the smallest size."
        );
        return false;
      }
      prefs.set("textSize", next);
      CS95.announce("Text size is now " + TEXT_SIZE_LABELS[next] + ".");
      return true;
    },

    resetTextSize: function () {
      prefs.set("textSize", 1);
      CS95.announce("Text size reset to normal, 18 point.");
    },

    toggleContrast: function () {
      var on = state.contrast !== "high";
      prefs.set("contrast", on ? "high" : "normal");
      CS95.announce(on ? "High contrast is now on." : "High contrast is now off.");
      return on;
    },

    /** Push the current preferences into the document and the shell chrome. */
    apply: function () {
      var root = document.documentElement;
      root.setAttribute("data-text-size", String(state.textSize));
      root.setAttribute("data-contrast", state.contrast);

      var desktop = document.getElementById("desktop");
      if (desktop) desktop.setAttribute("data-pattern", state.pattern);

      var contrastBtn = document.getElementById("tool-contrast");
      if (contrastBtn) {
        var on = state.contrast === "high";
        contrastBtn.setAttribute("aria-pressed", on ? "true" : "false");
        contrastBtn.textContent = on ? "Normal Contrast" : "High Contrast";
      }

      var traySlot = document.getElementById("tray-contrast");
      if (traySlot) traySlot.hidden = state.contrast !== "high";

      var smaller = document.getElementById("tool-text-smaller");
      var bigger = document.getElementById("tool-text-bigger");
      if (smaller) smaller.disabled = state.textSize <= TEXT_SIZE_MIN;
      if (bigger) bigger.disabled = state.textSize >= TEXT_SIZE_MAX;
    }
  };

  CS95.prefs = prefs;
})();
