/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   main.js — the shell: startup, desktop icons, global keys, clock, shut down
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});
  var el = CS95.el;

  /* ======================================================== THE PROGRAMS = */
  /* Everything installed on this disk. Modules that are not built yet say so
     honestly through the Not Installed sheet rather than pretending to work. */

  function notInstalled(config) {
    return function () { CS95.dialogs.notInstalled(config); };
  }

  var PROGRAMS = [
    {
      id: "welcome",
      label: "Welcome Guide",
      hint: "Start here",
      icon: "floppy",
      open: function () { CS95.apps.openWelcome(); }
    },
    {
      id: "catalog",
      label: "Course Catalog",
      hint: "8 courses",
      icon: "folder",
      open: function () { CS95.apps.openCatalog(); }
    },
    {
      id: "terminal",
      label: "AI Terminal",
      hint: "Practice room",
      icon: "terminal",
      open: notInstalled({
        name: "AI Terminal",
        does:
          "A safe practice room for talking to an AI assistant. Giant ready-made starter " +
          "buttons, a written history of everything said, and a filter that stops you sending " +
          "anything personal. Your questions go through our own server, so you never touch a key " +
          "or a password.",
        eta: "Step 3 of the build, once the proxy backend is in place",
        progress: 0
      })
    },
    {
      id: "scamspotter",
      label: "Scam Spotter",
      hint: "Safe practice",
      icon: "shield",
      open: notInstalled({
        name: "Scam Spotter",
        does:
          "A pop-up alert simulator. It shows you realistic fake warnings, fake bank messages " +
          "and cloned-voice telephone calls, one at a time, and tells you afterwards exactly " +
          "which detail gave it away. Nothing in it can reach the real world.",
        eta: "Step 3 of the build",
        progress: 0
      })
    },
    {
      id: "certificates",
      label: "My Certificates",
      hint: "Your record",
      icon: "certificate",
      open: notInstalled({
        name: "My Certificates",
        does:
          "Your completed courses, with a printable certificate for each one and a single " +
          "summary page you can hand to an employer or a family member.",
        eta: "Step 4 of the build, once lessons record progress",
        progress: 0
      })
    },
    {
      id: "enterprise",
      label: "Enterprise Desk",
      hint: "For employers",
      icon: "briefcase",
      open: notInstalled({
        name: "Enterprise Desk",
        does:
          "The business window: seat licences, workforce completion reporting, invoicing and " +
          "public-sector procurement details, laid out like a vintage business terminal.",
        eta: "Step 5 of the build",
        progress: 0
      })
    },
    {
      id: "controlpanel",
      label: "Control Panel",
      hint: "For administrators",
      icon: "sliders",
      open: notInstalled({
        name: "Control Panel",
        does:
          "The administrator's side: building courses, ordering modules, uploading transcripts, " +
          "and the spreadsheet-style seat manager for distributing licences.",
        eta: "Step 5 of the build",
        progress: 0
      })
    },
    {
      id: "help",
      label: "Help & Human Support",
      hint: "Ask a person",
      icon: "help",
      open: function () { CS95.apps.openHelp(); }
    }
  ];

  /* ==================================================== THE DESKTOP ICONS */

  var selectedIcon = null;

  function buildDesktopIcons() {
    var list = document.getElementById("desktop-icons");
    list.replaceChildren();

    PROGRAMS.forEach(function (program) {
      var button = el("button", {
        type: "button",
        class: "desktop-icon",
        dataset: { programId: program.id },
        "aria-pressed": "false",
        "aria-describedby": "icon-hint-" + program.id
      }, [
        el("span", { class: "desktop-icon-art", "aria-hidden": "true", html: CS95.icon(program.icon, 46) }),
        el("span", { class: "desktop-icon-label", text: program.label }),
        el("span", { class: "desktop-icon-hint", id: "icon-hint-" + program.id,
                     text: program.hint + " · click to open" })
      ]);

      /* One click opens. A double click also opens, and does not open twice.
         Both are correct, so nobody has to remember which one this desktop wants. */
      var opening = false;
      function open() {
        if (opening) return;
        opening = true;
        window.setTimeout(function () { opening = false; }, 400);
        select(button);
        program.open();
      }

      button.addEventListener("click", open);
      button.addEventListener("dblclick", function (event) { event.preventDefault(); });

      list.appendChild(el("li", null, button));
    });
  }

  function select(button) {
    if (selectedIcon && selectedIcon !== button) selectedIcon.setAttribute("aria-pressed", "false");
    selectedIcon = button;
    button.setAttribute("aria-pressed", "true");
  }

  /* Arrow keys walk the desktop icons, as they always did. */
  function wireIconKeys() {
    var list = document.getElementById("desktop-icons");
    list.addEventListener("keydown", function (event) {
      var icons = Array.from(list.querySelectorAll(".desktop-icon"));
      var index = icons.indexOf(document.activeElement);
      if (index === -1) return;

      var delta = 0;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") delta = 1;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") delta = -1;
      else if (event.key === "Home") { event.preventDefault(); icons[0].focus(); return; }
      else if (event.key === "End") { event.preventDefault(); icons[icons.length - 1].focus(); return; }
      else return;

      event.preventDefault();
      icons[(index + delta + icons.length) % icons.length].focus();
    });
  }

  /* ============================================================ THE CLOCK */

  function startClock() {
    var clock = document.getElementById("tray-clock");
    function tick() {
      var now = new Date();
      var hours = now.getHours();
      var suffix = hours >= 12 ? "PM" : "AM";
      var display = hours % 12 === 0 ? 12 : hours % 12;
      var minutes = String(now.getMinutes()).padStart(2, "0");
      clock.textContent = display + ":" + minutes + " " + suffix;
      clock.setAttribute("datetime", now.toISOString());
      clock.setAttribute("aria-label", "The time is " + display + " " + minutes + " " + suffix);
    }
    tick();
    window.setInterval(tick, 15000);
  }

  /* ======================================================== GLOBAL KEYS = */

  function wireGlobalKeys() {
    document.addEventListener("keydown", function (event) {
      /* Never steal a keystroke from someone typing. */
      var typing = event.target.matches("input, textarea, select");

      if (event.key === "F1") {
        event.preventDefault();
        CS95.apps.openHelp();
        return;
      }
      if (event.ctrlKey && !event.shiftKey && (event.key === "w" || event.key === "W")) {
        if (CS95.wm.activeId) {
          event.preventDefault();
          CS95.wm.close(CS95.wm.activeId);
        }
        return;
      }
      if (event.ctrlKey && event.key === "Tab") {
        event.preventDefault();
        CS95.wm.cycle();
        return;
      }
      if (event.altKey && !typing && (event.key === "+" || event.key === "=")) {
        event.preventDefault();
        CS95.prefs.stepTextSize(1);
        return;
      }
      if (event.altKey && !typing && (event.key === "-" || event.key === "_")) {
        event.preventDefault();
        CS95.prefs.stepTextSize(-1);
      }
    });
  }

  /* ====================================================== THE MENU TOOLS */

  function wireTools() {
    document.getElementById("tool-text-bigger")
      .addEventListener("click", function () { CS95.prefs.stepTextSize(1); });
    document.getElementById("tool-text-smaller")
      .addEventListener("click", function () { CS95.prefs.stepTextSize(-1); });
    document.getElementById("tool-contrast")
      .addEventListener("click", function () { CS95.prefs.toggleContrast(); });
  }

  /* =========================================================== SHUT DOWN */

  function shutDown() {
    CS95.dialogs.confirm({
      title: "Shut Down Ageless AI",
      heading: "Close everything and finish for now?",
      message:
        "Your text size and contrast settings are kept. Nothing you have done will be lost, " +
        "and you can come straight back by reloading the page.",
      confirmLabel: "Yes, shut down",
      cancelLabel: "No, keep working",
      onClose: function (confirmed) {
        if (confirmed !== true) return;
        CS95.wm.closeAll();
        var screen = el("div", { class: "shutdown-screen", role: "alertdialog", "aria-label": "Shut down" }, [
          el("div", null, [
            el("p", { text: "It is now safe to close this window." }),
            el("button", {
              type: "button",
              class: "btn btn--primary",
              text: "Start Ageless AI Again",
              onclick: function () { window.location.reload(); }
            })
          ])
        ]);
        document.body.appendChild(screen);
        screen.querySelector("button").focus();
        CS95.announce("Ageless AI has shut down. It is now safe to close this window.");
      }
    });
  }

  /* ============================================================== BOOT == */

  function runBoot(done) {
    var screen = document.getElementById("boot-screen");
    var fill = document.getElementById("boot-progress-fill");
    var status = document.getElementById("boot-status");
    var skip = document.getElementById("boot-skip");

    var alreadyBooted = false;
    try { alreadyBooted = window.sessionStorage.getItem("agelessai.booted") === "1"; } catch (err) { /* ignore */ }

    if (alreadyBooted) { done(); return; }

    var steps = [
      { at: 20, text: "Checking the disk…" },
      { at: 48, text: "Loading the course catalog…" },
      { at: 74, text: "Setting your text size…" },
      { at: 100, text: "Ready." }
    ];
    var index = 0;
    var timer = null;
    var finished = false;

    screen.hidden = false;
    skip.focus();

    function finish() {
      if (finished) return;
      finished = true;
      window.clearInterval(timer);
      try { window.sessionStorage.setItem("agelessai.booted", "1"); } catch (err) { /* ignore */ }
      screen.hidden = true;
      done();
    }

    skip.addEventListener("click", finish);

    timer = window.setInterval(function () {
      var step = steps[index];
      fill.style.width = step.at + "%";
      status.textContent = step.text;
      index += 1;
      if (index >= steps.length) {
        window.clearInterval(timer);
        window.setTimeout(finish, 420);
      }
    }, 380);
  }

  /* ============================================================= START == */

  function start() {
    document.getElementById("os").hidden = false;

    buildDesktopIcons();
    wireIconKeys();
    wireTools();
    wireGlobalKeys();
    startClock();
    CS95.menubar.init();
    CS95.prefs.apply();

    /* Rebuild the Windows menu label state whenever the stack changes. */
    document.addEventListener("cs95:windowschange", function () { CS95.menubar.close(); });

    CS95.apps.openWelcome(0);
  }

  CS95.shell = {
    programs: function () { return PROGRAMS; },
    shutDown: shutDown
  };

  document.addEventListener("DOMContentLoaded", function () {
    CS95.prefs.apply();
    runBoot(start);
  });
})();
