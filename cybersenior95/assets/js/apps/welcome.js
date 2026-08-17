/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   apps/welcome.js — "The Welcome Disk"
   ----------------------------------------------------------------------------
   The homepage, dressed as a 1995 software installation wizard. Five panels,
   Back / Next, a visible step counter spelled out in words, and a sidebar that
   shows the whole journey at once so nobody ever wonders how much is left.

   Deliberate choices for this audience:
     · The step count is always visible AND announced. No mystery progress.
     · "Back" is always available and never destructive.
     · The last panel's actions are the only large green buttons in the wizard,
       so the eye is drawn to the one thing to do next.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});
  var el = CS95.el;
  var WIN_ID = "welcome";

  var STEPS = [
    { key: "hello",    label: "Say hello" },
    { key: "safety",   label: "Safety first" },
    { key: "learn",    label: "What you will learn" },
    { key: "pace",     label: "How the lessons run" },
    { key: "start",    label: "Start learning" }
  ];

  /* ------------------------------------------------------- panel content */

  function panelHello() {
    return el("div", null, [
      el("p", { class: "wizard-eyebrow", text: "Ageless AI Setup" }),
      el("h2", { text: "Welcome. Let us take this at your pace." }),
      el("p", { class: "wizard-lede", text:
        "Ageless AI teaches you what artificial intelligence actually is, how people are " +
        "misusing it to take money from your neighbours, and how to make it genuinely useful " +
        "in an ordinary week." }),
      el("div", { class: "wizard-figure" }, [
        el("h3", { text: "Three things before we begin" }),
        el("ul", { class: "tick-list" }, [
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "1" }),
            el("span", { html: "<strong>Nothing here can break.</strong> You cannot damage this " +
              "computer by clicking the wrong thing. Every window has a Close button." })
          ]),
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "2" }),
            el("span", { html: "<strong>The text can be made bigger.</strong> Use the " +
              "<em>A plus</em> button at the top right of the screen. It affects everything, " +
              "and it remembers your choice." })
          ]),
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "3" }),
            el("span", { html: "<strong>A person is available.</strong> Help, then " +
              "<em>Get Human Help</em>, gives you a telephone number answered by a human being." })
          ])
        ])
      ]),
      el("p", { text:
        "Press the Next button below when you are ready. There is no timer and nothing is being " +
        "recorded about how long you take." })
    ]);
  }

  function panelSafety() {
    return el("div", null, [
      el("p", { class: "wizard-eyebrow", text: "Step Two" }),
      el("h2", { text: "Safety comes before anything clever" }),
      el("p", { class: "wizard-lede", text:
        "The single fastest-growing crime against people over 60 uses AI to copy a familiar " +
        "voice. We teach the defence before we teach anything else." }),

      el("div", { class: "notice" }, [
        el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("caution", 40) }),
        el("div", null, [
          el("h3", { text: "The old warning signs have stopped working" }),
          el("p", { text:
            "For twenty years the advice was to watch for bad spelling and clumsy grammar. " +
            "AI writes perfectly. It also copies a voice from a few seconds of audio taken from " +
            "a birthday video. Spelling is no longer evidence of anything." })
        ])
      ]),

      el("div", { class: "groupbox" }, [
        el("h3", { class: "groupbox-title", text: "What every one of these attempts needs from you" }),
        el("ul", { class: "tick-list" }, [
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "!" }),
            el("span", { html: "<strong>Urgency.</strong> It must happen right now, this minute." })
          ]),
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "!" }),
            el("span", { html: "<strong>Secrecy.</strong> Do not tell your husband, your daughter, the bank." })
          ]),
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "!" }),
            el("span", { html: "<strong>An unusual payment.</strong> Gift cards, a transfer, a courier at the door." })
          ])
        ]),
        el("p", { html:
          "Remove any one of the three and the whole thing collapses. That is why the answer is " +
          "always the same: <strong>hang up, and ring the person back on the number you already have.</strong>" })
      ]),

      el("p", { text:
        "The Scam Spotter program on the desktop lets you practise this on realistic fakes, in a " +
        "place where being wrong costs nothing at all." })
    ]);
  }

  function panelLearn() {
    var shelfCounts = {};
    CS95.courses.forEach(function (course) {
      shelfCounts[course.shelf] = (shelfCounts[course.shelf] || 0) + 1;
    });

    return el("div", null, [
      el("p", { class: "wizard-eyebrow", text: "Step Three" }),
      el("h2", { text: "What you will learn" }),
      el("p", { class: "wizard-lede", text:
        "Eight courses, grouped into four shelves. You may take them in any order, though we " +
        "suggest starting with Spotting AI Scams." }),

      el("div", { class: "wizard-figure" }, [
        el("ul", { class: "tick-list" }, CS95.courses.map(function (course) {
          return el("li", null, [
            el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon(course.icon, 26) }),
            el("span", null, [
              el("strong", { text: course.name }),
              el("span", { text: " — " + course.tagline })
            ])
          ]);
        }))
      ]),

      el("p", { html:
        "That is <strong>" + CS95.courses.length + " courses</strong> across " +
        CS95.shelves.length + " shelves, " +
        "roughly <strong>" +
        Math.round(CS95.courses.reduce(function (total, course) {
          return total + CS95.courseMinutes(course);
        }, 0) / 60) +
        " hours</strong> of lessons in total. Nobody expects you to do it in a week." })
    ]);
  }

  function panelPace() {
    return el("div", null, [
      el("p", { class: "wizard-eyebrow", text: "Step Four" }),
      el("h2", { text: "How the lessons run" }),

      el("div", { class: "groupbox" }, [
        el("h3", { class: "groupbox-title", text: "Four promises about your time" }),
        el("ul", { class: "tick-list" }, [
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "✓" }),
            el("span", { html: "<strong>Short lessons.</strong> Between eight and fourteen minutes. " +
              "Never a forty-minute video." })
          ]),
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "✓" }),
            el("span", { html: "<strong>Every word written down.</strong> Each lesson has a full " +
              "transcript beside the video, in large type, that you can read instead of watching." })
          ]),
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "✓" }),
            el("span", { html: "<strong>Master one thing, then move on.</strong> A short practice run " +
              "closes each course. Repeat it as often as you like; nothing is scored against you." })
          ]),
          el("li", null, [
            el("span", { class: "tick", "aria-hidden": "true", text: "✓" }),
            el("span", { html: "<strong>You can stop mid-lesson.</strong> We remember where you were, " +
              "and the desktop reopens exactly as you left it." })
          ])
        ])
      ]),

      el("div", { class: "notice notice--calm" }, [
        el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("terminal", 40) }),
        el("div", null, [
          el("h3", { text: "Practice happens in a walled garden" }),
          el("p", { text:
            "The AI Terminal on this desktop is a safe practice room. It never asks for your name, " +
            "your bank, or your address, and it will stop you if you start to type something " +
            "personal. You cannot get into trouble in there." })
        ])
      ])
    ]);
  }

  function panelStart() {
    var actions = el("div", { style: "display:grid; gap:0.8rem; margin-top:1.2rem;" }, [
      el("button", {
        type: "button",
        class: "btn btn--huge btn--go",
        onclick: function () {
          CS95.apps.openCatalog();
        }
      }, [
        el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("folderOpen", 30) }),
        el("span", { text: "Open the Course Catalog" })
      ]),
      el("button", {
        type: "button",
        class: "btn btn--huge",
        onclick: function () {
          CS95.apps.openCourse("safety");
        }
      }, [
        el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("shield", 30) }),
        el("span", { text: "Go straight to Spotting AI Scams" })
      ]),
      el("button", {
        type: "button",
        class: "btn btn--huge",
        onclick: function () { CS95.apps.openHelp(); }
      }, [
        el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon("help", 30) }),
        el("span", { text: "Show me how this desktop works first" })
      ])
    ]);

    return el("div", null, [
      el("p", { class: "wizard-eyebrow", text: "Setup Complete" }),
      el("h2", { text: "You are ready. Where would you like to begin?" }),
      el("p", { class: "wizard-lede", text:
        "This welcome guide stays on the desktop. You can reopen it at any time from the " +
        "Ageless AI menu at the top left, or from the Welcome Guide icon." }),
      actions,
      el("hr", { class: "hr" }),
      el("p", { html:
        "<strong>Arranging this for an organisation?</strong> The Enterprise Desk icon on the " +
        "desktop covers seat licences, workforce reporting and public-sector procurement." })
    ]);
  }

  var PANELS = [panelHello, panelSafety, panelLearn, panelPace, panelStart];

  /* --------------------------------------------------------- the window - */

  var current = 0;

  function sidebar() {
    return el("aside", { class: "wizard-sidebar" }, [
      el("div", { class: "wizard-sidebar-art", "aria-hidden": "true", html: CS95.icon("floppy", 64) }),
      el("h2", { text: "Ageless AI" }),
      el("ol", { class: "wizard-steps", id: "wizard-steps" }, STEPS.map(function (step, index) {
        return el("li", {
          class: "wizard-step",
          dataset: { state: index === current ? "current" : index < current ? "done" : "todo" }
        }, [
          el("span", { class: "wizard-step-mark", "aria-hidden": "true",
                       text: index < current ? "✓" : String(index + 1) + "." }),
          el("span", { text: step.label })
        ]);
      }))
    ]);
  }

  function render() {
    var record = CS95.wm.get(WIN_ID);
    if (!record) return;

    var main = el("div", { class: "wizard-main", id: "wizard-main", tabindex: "-1" }, [PANELS[current]()]);
    var wrap = el("div", { class: "wizard" }, [sidebar(), main]);

    CS95.wm.setBody(WIN_ID, wrap);
    updateFooter();

    CS95.wm.setTitle(WIN_ID, "Welcome Guide — Step " + (current + 1) + " of " + STEPS.length);
    CS95.announce("Step " + (current + 1) + " of " + STEPS.length + ": " + STEPS[current].label + ".");
    main.focus();
  }

  var footerRefs = {};

  function buildFooter() {
    var back = el("button", {
      type: "button",
      class: "btn",
      text: "◀ Back",
      onclick: function () { if (current > 0) { current -= 1; render(); } }
    });
    var next = el("button", {
      type: "button",
      class: "btn btn--primary btn--default",
      text: "Next ▶",
      onclick: function () { if (current < STEPS.length - 1) { current += 1; render(); } }
    });
    var progressFill = el("div", { class: "wizard-progress-fill" });
    var progressText = el("span", { id: "wizard-progress-text" });

    footerRefs = { back: back, next: next, fill: progressFill, text: progressText };

    return el("div", { class: "window-footer" }, [
      el("div", { class: "wizard-progress", role: "group", "aria-label": "Setup progress" }, [
        progressText,
        el("div", { class: "wizard-progress-track", "aria-hidden": "true" }, [progressFill])
      ]),
      el("span", { class: "spacer" }),
      back,
      next,
      el("button", {
        type: "button",
        class: "btn",
        text: "Close",
        onclick: function () { CS95.wm.close(WIN_ID); }
      })
    ]);
  }

  function updateFooter() {
    if (!footerRefs.back) return;
    var isLast = current === STEPS.length - 1;
    footerRefs.back.disabled = current === 0;
    footerRefs.next.disabled = isLast;
    footerRefs.next.textContent = isLast ? "Finished" : "Next ▶";
    footerRefs.fill.style.width = Math.round(((current + 1) / STEPS.length) * 100) + "%";
    footerRefs.text.textContent = "Step " + (current + 1) + " of " + STEPS.length;
  }

  CS95.apps = CS95.apps || {};

  CS95.apps.openWelcome = function (startStep) {
    if (typeof startStep === "number") current = Math.min(STEPS.length - 1, Math.max(0, startStep));

    if (CS95.wm.isOpen(WIN_ID)) {
      CS95.wm.restore(WIN_ID);
      CS95.wm.focus(WIN_ID);
      render();
      return;
    }

    CS95.wm.open({
      id: WIN_ID,
      title: "Welcome Guide",
      icon: "floppy",
      width: 880,
      height: 620,
      x: 156,
      y: 24,
      bodyClass: "window-body--flush",
      footer: buildFooter(),
      status: ["Ageless AI Setup", "Disk 1 of 1"]
    });
    render();
  };

  CS95.apps.restartWelcome = function () {
    current = 0;
    CS95.apps.openWelcome(0);
  };
})();
