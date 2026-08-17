/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   apps/help.js — Help book, keyboard reference, human support, About box
   ----------------------------------------------------------------------------
   The help window is written for somebody who has never used this desktop and
   is not sure whether they are allowed to click. It answers the questions
   people actually ask out loud, in the order they ask them.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});
  var el = CS95.el;

  /* ================================================================ HELP = */

  var HELP_ENTRIES = [
    {
      q: "How do I open a program?",
      a: "Click once on any picture on the coloured background, then press Enter. Or click the " +
         "picture twice quickly. Either way works, and neither can break anything. Every program " +
         "opens in its own window."
    },
    {
      q: "How do I close a window?",
      a: "Every window has a Close button in its bottom row, spelled out in words. There is also " +
         "an X button in the top right corner of the window. Closing a window never deletes " +
         "anything and never loses your place."
    },
    {
      q: "A window has disappeared. Where did it go?",
      a: "Look along the grey strip at the very bottom of the screen. Every open window has a " +
         "button there with its name on it. Click that button to bring the window back."
    },
    {
      q: "The text is too small.",
      a: "Press the button marked A plus at the top right of the screen. Press it again for more. " +
         "There are five sizes, from 18 point up to 30 point, and every part of the screen grows " +
         "together. Your choice is remembered the next time you visit."
    },
    {
      q: "I find the grey hard to look at.",
      a: "Press the High Contrast button at the top right. The whole desktop switches to white " +
         "text on black with heavier outlines. Press it again to switch back."
    },
    {
      q: "How do I move a window out of the way?",
      a: "Press and hold the mouse button on the blue strip at the top of the window, move the " +
         "mouse, then let go. Using the keyboard instead: press Tab until the blue strip is " +
         "outlined, then use the arrow keys."
    },
    {
      q: "Can I break something by clicking the wrong button?",
      a: "No. Nothing on this desktop deletes files, spends money, or sends anything to anyone. " +
         "Anything that would matter asks you to confirm first, in plain words, with an obvious " +
         "way to say no."
    },
    {
      q: "Is my information being collected?",
      a: "Your text size and contrast choice are stored on this computer only, so the desktop " +
         "looks the same when you return. Nothing you type into the practice terminal is used to " +
         "train anything, and you are never asked for your address, your bank, or your date of birth."
    },
    {
      q: "I would rather speak to a person.",
      a: "Press the button below marked Get Human Help. It gives you a telephone number answered " +
         "by a person, and the hours they are there. Asking for help is not a failure; it is how " +
         "everybody learns this."
    }
  ];

  var KEYS = [
    ["Tab", "Move forward to the next button or link."],
    ["Shift and Tab", "Move backwards to the previous one."],
    ["Enter or Space", "Press the button you are on."],
    ["Escape", "Close the message box or menu that is open."],
    ["Control and W", "Close the window you are working in."],
    ["Control and Tab", "Move to the next open window."],
    ["Arrow keys", "On a window's title strip, move the window around."],
    ["F1", "Open this help window from anywhere."],
    ["Alt and Plus", "Make all the text bigger."],
    ["Alt and Minus", "Make all the text smaller."]
  ];

  function helpBody() {
    var wrap = el("div", { class: "helpbook" });

    wrap.appendChild(el("div", { class: "help-entry" }, [
      el("h3", { text: "Ageless AI Help" }),
      el("p", { text:
        "This desktop works the way computers worked in the 1990s, on purpose. Buttons look " +
        "like buttons, windows have visible frames, and nothing is hidden until you hover over " +
        "it. If it looks like you can press it, you can press it." })
    ]));

    HELP_ENTRIES.forEach(function (entry) {
      wrap.appendChild(el("div", { class: "help-entry" }, [
        el("h3", { text: entry.q }),
        el("p", { text: entry.a })
      ]));
    });

    var table = el("table", { class: "keytable" }, [
      el("caption", { class: "visually-hidden", text: "Keyboard shortcuts for the Ageless AI desktop" }),
      el("thead", null, el("tr", null, [
        el("th", { scope: "col", text: "Press" }),
        el("th", { scope: "col", text: "What happens" })
      ])),
      el("tbody", null, KEYS.map(function (row) {
        return el("tr", null, [
          el("td", null, el("kbd", { text: row[0] })),
          el("td", { text: row[1] })
        ]);
      }))
    ]);

    wrap.appendChild(el("div", { class: "help-entry" }, [
      el("h3", { text: "If you prefer the keyboard to the mouse" }),
      el("p", { text: "Every single thing on this desktop can be done without a mouse." }),
      table
    ]));

    return wrap;
  }

  CS95.apps = CS95.apps || {};

  CS95.apps.openHelp = function () {
    var WIN_ID = "help";
    if (CS95.wm.isOpen(WIN_ID)) {
      CS95.wm.restore(WIN_ID);
      CS95.wm.focus(WIN_ID);
      return;
    }

    CS95.wm.open({
      id: WIN_ID,
      title: "Help & Human Support",
      icon: "help",
      width: 760,
      height: 600,
      body: helpBody(),
      footer: el("div", { class: "window-footer" }, [
        el("button", {
          type: "button",
          class: "btn btn--primary",
          onclick: CS95.apps.openHumanHelp
        }, [
          el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("phone", 22) }),
          el("span", { text: "Get Human Help" })
        ]),
        el("span", { class: "spacer" }),
        el("button", {
          type: "button",
          class: "btn btn--default",
          text: "Close",
          onclick: function () { CS95.wm.close(WIN_ID); }
        })
      ]),
      status: ["Ageless AI Help", "Updated for this release"]
    });
  };

  /* ========================================================= HUMAN HELP = */

  CS95.apps.openHumanHelp = function () {
    var body = el("div", null, [
      el("p", { html:
        "A person will answer. There is no menu of options to work through and no recorded voice." }),
      el("div", { class: "groupbox" }, [
        el("h3", { class: "groupbox-title", text: "Ageless AI help line" }),
        el("p", { html: '<strong style="font-size:1.4rem">1-800-555-0142</strong>' }),
        el("p", { text: "Monday to Friday, 8am to 8pm. Saturday, 9am to 5pm." }),
        el("p", { text: "Or write to us: help@agelessai.example" })
      ]),
      el("div", { class: "notice" }, [
        el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("caution", 36) }),
        el("div", null, [
          el("h3", { text: "We will never ask you for these" }),
          el("p", { text:
            "Your password, your bank details, a payment, or permission to control your computer " +
            "remotely. If anybody claiming to be from Ageless AI asks for any of those, they are " +
            "not from Ageless AI. Hang up and ring the number above." })
        ])
      ])
    ]);

    CS95.dialogs.show({
      title: "Get Human Help",
      kind: "help",
      body: body,
      buttons: [{ label: "Thank you, close this", value: "ok", isDefault: true }]
    });
  };

  /* =============================================================== ABOUT = */

  CS95.apps.openAbout = function () {
    var body = el("div", { class: "about" }, [
      el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("computer", 64) }),
      el("h2", { text: "Ageless AI" }),
      el("p", { html: "<strong>CyberSenior 95</strong> desktop environment" }),
      el("hr", { class: "hr about-rule" }),
      el("dl", null, [
        el("dt", { text: "Version" }),          el("dd", { text: "0.1 — Desktop shell" }),
        el("dt", { text: "Built for" }),        el("dd", { text: "Adults aged 55 and over" }),
        el("dt", { text: "Base text size" }),   el("dd", { text: CS95.prefs.textSizeLabel() }),
        el("dt", { text: "Contrast" }),         el("dd", { text: CS95.prefs.get("contrast") === "high" ? "High" : "Normal" }),
        el("dt", { text: "Courses on disk" }),  el("dd", { text: String(CS95.courses.length) }),
        el("dt", { text: "Standard" }),         el("dd", { text: "WCAG 2.2 AA, with AAA contrast throughout" })
      ]),
      el("hr", { class: "hr about-rule" }),
      el("p", { text:
        "Built deliberately in the visual language of the machines this audience learned on: " +
        "solid frames, raised buttons, and no hidden controls." })
    ]);

    CS95.dialogs.show({
      title: "About Ageless AI",
      kind: "info",
      body: body,
      buttons: [{ label: "OK", value: "ok", isDefault: true }]
    });
  };

  /* ==================================================== SYSTEM INFO BOX = */

  CS95.apps.openSystemInfo = function () {
    var openWindows = CS95.wm.list();
    var body = el("div", null, [
      el("div", { class: "groupbox" }, [
        el("h3", { class: "groupbox-title", text: "This desktop" }),
        el("dl", { style: "display:grid;grid-template-columns:auto 1fr;gap:0.4em 1.2em;" }, [
          el("dt", { style: "font-weight:700", text: "Screen size" }),
          el("dd", { text: window.innerWidth + " by " + window.innerHeight + " pixels" }),
          el("dt", { style: "font-weight:700", text: "Text size" }),
          el("dd", { text: CS95.prefs.textSizeLabel() }),
          el("dt", { style: "font-weight:700", text: "Contrast" }),
          el("dd", { text: CS95.prefs.get("contrast") === "high" ? "High contrast" : "Normal" }),
          el("dt", { style: "font-weight:700", text: "Wallpaper" }),
          el("dd", { text: CS95.prefs.get("pattern") }),
          el("dt", { style: "font-weight:700", text: "Windows open" }),
          el("dd", { text: openWindows.length ? openWindows.map(function (r) { return r.title; }).join(", ") : "None" })
        ])
      ]),
      el("p", { text:
        "Everything above is stored on this computer only. None of it is sent anywhere." })
    ]);

    CS95.dialogs.show({
      title: "System Information",
      kind: "info",
      body: body,
      buttons: [{ label: "OK", value: "ok", isDefault: true }]
    });
  };
})();
