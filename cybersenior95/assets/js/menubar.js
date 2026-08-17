/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   menubar.js — the top menu bar and the Start menu
   ----------------------------------------------------------------------------
   Menus open on CLICK and stay open until dismissed. They never open on hover,
   because a menu that appears when the pointer drifts past is exactly the kind
   of surprise this interface exists to avoid.

   Keyboard model (standard menubar pattern):
     Left / Right   move between menu titles
     Down / Enter   open the menu under the cursor
     Up / Down      move through the entries
     Home / End     first / last entry
     Escape         close and return focus to the menu title
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});
  var el = CS95.el;

  var layer;
  var openMenuButton = null;

  /* ------------------------------------------------------- menu contents */

  function separator() { return { separator: true }; }

  function menuDefinitions(name) {
    var wm = CS95.wm;
    var prefs = CS95.prefs;

    var defs = {
      system: [
        { label: "About Ageless AI…",        action: CS95.apps.openAbout },
        { label: "System Information…",      action: CS95.apps.openSystemInfo },
        separator(),
        { label: "Start The Welcome Guide Again", action: function () { CS95.apps.restartWelcome(); } },
        separator(),
        { label: "Shut Down…",               action: CS95.shell.shutDown }
      ],

      file: [
        { label: "Open Welcome Guide",       action: function () { CS95.apps.openWelcome(); } },
        { label: "Open Course Catalog",      action: function () { CS95.apps.openCatalog(); } },
        { label: "Open Help",                action: CS95.apps.openHelp, key: "F1" },
        separator(),
        {
          label: "Close This Window",
          key: "Ctrl+W",
          disabled: !wm.activeId,
          action: function () { if (wm.activeId) wm.close(wm.activeId); }
        },
        {
          label: "Close Every Window",
          disabled: wm.list().length === 0,
          action: function () { wm.closeAll(); }
        }
      ],

      windows: (function () {
        var entries = wm.list().slice().reverse().map(function (record) {
          return {
            label: record.title + (record.minimized ? "  (minimised)" : ""),
            mark: wm.activeId === record.id && !record.minimized ? "•" : "",
            action: function () {
              wm.restore(record.id);
              wm.focus(record.id);
              record.titleBar.focus();
            }
          };
        });
        if (!entries.length) entries = [{ label: "No windows are open", disabled: true }];
        return entries.concat([
          separator(),
          { label: "Arrange Windows Side By Side", disabled: wm.list().length < 2, action: function () { wm.tile(); } },
          { label: "Next Window", key: "Ctrl+Tab", disabled: wm.list().length < 2, action: function () { wm.cycle(); } }
        ]);
      })(),

      accessibility: [
        {
          label: "Make Text Bigger",
          key: "Alt++",
          disabled: prefs.get("textSize") >= prefs.TEXT_SIZE_MAX,
          action: function () { prefs.stepTextSize(1); }
        },
        {
          label: "Make Text Smaller",
          key: "Alt+−",
          disabled: prefs.get("textSize") <= prefs.TEXT_SIZE_MIN,
          action: function () { prefs.stepTextSize(-1); }
        },
        { label: "Reset Text To Normal Size", action: function () { prefs.resetTextSize(); } },
        separator(),
        {
          label: "High Contrast",
          mark: prefs.get("contrast") === "high" ? "✓" : "",
          action: function () { prefs.toggleContrast(); }
        },
        separator(),
        {
          label: "Desktop Colour: Teal",
          mark: prefs.get("pattern") === "teal" ? "•" : "",
          action: function () { prefs.set("pattern", "teal"); CS95.announce("Desktop colour set to teal."); }
        },
        {
          label: "Desktop Colour: Classic Grey",
          mark: prefs.get("pattern") === "macgray" ? "•" : "",
          action: function () { prefs.set("pattern", "macgray"); CS95.announce("Desktop colour set to classic grey."); }
        },
        {
          label: "Desktop Colour: Navy",
          mark: prefs.get("pattern") === "navy" ? "•" : "",
          action: function () { prefs.set("pattern", "navy"); CS95.announce("Desktop colour set to navy."); }
        }
      ],

      help: [
        { label: "How To Use This Desktop", key: "F1", action: CS95.apps.openHelp },
        { label: "Get Human Help…",         action: CS95.apps.openHumanHelp },
        separator(),
        { label: "About Ageless AI…",       action: CS95.apps.openAbout }
      ]
    };

    return defs[name] || [];
  }

  /* ------------------------------------------------------------ rendering */

  function buildPopup(entries, onDismiss) {
    var popup = el("div", { class: "menu-popup", role: "menu" });

    entries.forEach(function (entry) {
      if (entry.separator) {
        popup.appendChild(el("div", { class: "menu-separator", role: "separator" }));
        return;
      }
      var item = el("button", {
        type: "button",
        class: "menu-entry",
        role: "menuitem",
        tabindex: "-1",
        "aria-disabled": entry.disabled ? "true" : null,
        onclick: function () {
          if (entry.disabled) return;
          onDismiss();
          if (typeof entry.action === "function") entry.action();
        }
      }, [
        el("span", { class: "menu-entry-mark", "aria-hidden": "true", text: entry.mark || "" }),
        el("span", { style: "flex:1 1 auto", text: entry.label }),
        entry.key ? el("span", { class: "menu-entry-key", "aria-hidden": "true", text: entry.key }) : null
      ]);
      popup.appendChild(item);
    });

    return popup;
  }

  function itemsOf(popup) {
    return Array.from(popup.querySelectorAll('.menu-entry:not([aria-disabled="true"])'));
  }

  function closeMenu(refocus) {
    if (!openMenuButton) return;
    var button = openMenuButton;
    openMenuButton = null;
    button.setAttribute("aria-expanded", "false");
    layer.replaceChildren();
    layer.hidden = true;
    if (refocus) button.focus();
  }

  function openMenu(button, entries, anchor) {
    if (openMenuButton === button) { closeMenu(true); return; }
    closeMenu(false);

    var popup = buildPopup(entries, function () { closeMenu(false); });
    layer.replaceChildren(popup);
    layer.hidden = false;

    var rect = (anchor || button).getBoundingClientRect();
    popup.style.visibility = "hidden";
    popup.style.left = "0px";
    popup.style.top = "0px";
    var popupRect = popup.getBoundingClientRect();

    var left = Math.min(rect.left, Math.max(0, window.innerWidth - popupRect.width - 4));
    var top = anchor && anchor.dataset.menuUp === "true"
      ? Math.max(4, rect.top - popupRect.height)
      : rect.bottom;
    if (top + popupRect.height > window.innerHeight) {
      top = Math.max(4, rect.top - popupRect.height);
    }

    popup.style.left = Math.round(left) + "px";
    popup.style.top = Math.round(top) + "px";
    popup.style.visibility = "visible";

    button.setAttribute("aria-expanded", "true");
    openMenuButton = button;

    var items = itemsOf(popup);
    if (items.length) items[0].focus();

    popup.addEventListener("keydown", function (event) {
      var list = itemsOf(popup);
      var index = list.indexOf(document.activeElement);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          list[(index + 1 + list.length) % list.length].focus();
          break;
        case "ArrowUp":
          event.preventDefault();
          list[(index - 1 + list.length) % list.length].focus();
          break;
        case "Home":
          event.preventDefault();
          list[0].focus();
          break;
        case "End":
          event.preventDefault();
          list[list.length - 1].focus();
          break;
        case "Escape":
          event.preventDefault();
          closeMenu(true);
          break;
        case "ArrowLeft":
        case "ArrowRight":
          if (button.classList.contains("menubar-item")) {
            event.preventDefault();
            moveAlongMenubar(button, event.key === "ArrowRight" ? 1 : -1, true);
          }
          break;
        case "Tab":
          event.preventDefault();
          closeMenu(true);
          break;
        default:
          break;
      }
    });
  }

  function menubarButtons() {
    return Array.from(document.querySelectorAll("#menubar-list .menubar-item"));
  }

  function moveAlongMenubar(from, delta, thenOpen) {
    var buttons = menubarButtons();
    var index = buttons.indexOf(from);
    if (index === -1) return;
    var next = buttons[(index + delta + buttons.length) % buttons.length];
    closeMenu(false);
    next.focus();
    if (thenOpen) openMenu(next, menuDefinitions(next.dataset.menu));
  }

  /* ------------------------------------------------------------ Start menu */

  function startMenuEntries() {
    var entries = CS95.shell.programs().map(function (program) {
      return { label: program.label, action: program.open };
    });
    return entries.concat([
      separator(),
      { label: "Make Text Bigger",  action: function () { CS95.prefs.stepTextSize(1); } },
      { label: "High Contrast",     mark: CS95.prefs.get("contrast") === "high" ? "✓" : "",
        action: function () { CS95.prefs.toggleContrast(); } },
      separator(),
      { label: "Help",              action: CS95.apps.openHelp },
      { label: "Shut Down…",        action: CS95.shell.shutDown }
    ]);
  }

  /* ------------------------------------------------------------- wire up - */

  function init() {
    layer = document.getElementById("menu-layer");

    menubarButtons().forEach(function (button) {
      button.addEventListener("click", function () {
        openMenu(button, menuDefinitions(button.dataset.menu));
      });
      button.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          moveAlongMenubar(button, event.key === "ArrowRight" ? 1 : -1, false);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          openMenu(button, menuDefinitions(button.dataset.menu));
        }
      });
    });

    var startButton = document.getElementById("start-button");
    startButton.dataset.menuUp = "true";
    startButton.addEventListener("click", function () {
      openMenu(startButton, startMenuEntries(), startButton);
    });
    startButton.addEventListener("keydown", function (event) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        openMenu(startButton, startMenuEntries(), startButton);
      }
    });

    /* Any click outside an open menu dismisses it. */
    document.addEventListener("pointerdown", function (event) {
      if (!openMenuButton) return;
      if (event.target.closest(".menu-popup")) return;
      if (event.target === openMenuButton || openMenuButton.contains(event.target)) return;
      closeMenu(false);
    }, true);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && openMenuButton) closeMenu(true);
    });
  }

  CS95.menubar = { init: init, close: function () { closeMenu(false); } };
})();
