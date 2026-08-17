/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   dialogs.js — modal alert / confirm boxes
   ----------------------------------------------------------------------------
   Classic message boxes with the pixel glyph on the left and plain-language
   buttons on the right. Every dialog traps focus, restores focus on close,
   and can always be dismissed with Escape as well as with a labelled button.

   House rule for the copy in these boxes: never blame the reader, never use
   jargon, and always say what will happen next.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});
  var el = CS95.el;

  var FOCUSABLE =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  var openDialogs = [];

  /**
   * Show a modal message box.
   *
   * @param {object} options
   *   title    {string}   window title
   *   heading  {string}   optional bold line above the message
   *   message  {string}   plain text, or an array of paragraphs
   *   body     {Node}     optional rich content used instead of `message`
   *   kind     {string}   "info" | "caution" | "stop" | "help"
   *   buttons  {array}    [{ label, value, variant, isDefault }]
   *   onClose  {function} receives the chosen value, or null for Escape
   */
  function show(options) {
    var kind = options.kind || "info";
    var glyphName = { info: "info", caution: "caution", stop: "stop", help: "help" }[kind] || "info";
    var previouslyFocused = document.activeElement;

    var buttons = options.buttons && options.buttons.length
      ? options.buttons
      : [{ label: "OK", value: "ok", isDefault: true }];

    var backdrop = el("div", { class: "modal-backdrop" });
    var dialog = el("section", {
      class: "dialog",
      role: kind === "stop" || kind === "caution" ? "alertdialog" : "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dlg-title",
      "aria-describedby": "dlg-desc"
    });

    var closeBtn = el("button", {
      type: "button",
      class: "title-btn",
      html:
        '<svg viewBox="0 0 10 10" width="12" height="12" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
        '<path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" stroke-width="2"/></svg>',
      "aria-label": "Close this message"
    });

    var titleBar = el("div", { class: "title-bar" }, [
      el("span", { class: "title-bar-icon", "aria-hidden": "true", html: CS95.icon(glyphName, 22) }),
      el("h2", { class: "title-bar-text", id: "dlg-title", text: options.title || "Message" }),
      el("div", { class: "title-bar-controls" }, [closeBtn])
    ]);

    var textCol = el("div", { class: "dialog-text", id: "dlg-desc" });
    if (options.heading) textCol.appendChild(el("h2", { text: options.heading }));
    if (options.body) {
      textCol.appendChild(options.body);
    } else {
      var paragraphs = Array.isArray(options.message) ? options.message : [options.message || ""];
      paragraphs.forEach(function (text) { textCol.appendChild(el("p", { text: text })); });
    }

    var footer = el("div", { class: "window-footer" }, [el("span", { class: "spacer" })]);
    var defaultButton = null;

    buttons.forEach(function (config) {
      var button = el("button", {
        type: "button",
        class: "btn" + (config.variant ? " btn--" + config.variant : "") + (config.isDefault ? " btn--default" : ""),
        text: config.label,
        onclick: function () { finish(config.value === undefined ? config.label : config.value); }
      });
      if (config.isDefault) defaultButton = button;
      footer.appendChild(button);
    });

    dialog.append(
      titleBar,
      el("div", { class: "dialog-body" }, [
        el("div", { class: "dialog-glyph", "aria-hidden": "true", html: CS95.icon(glyphName, 44) }),
        textCol
      ]),
      footer
    );
    backdrop.appendChild(dialog);

    function finish(value) {
      backdrop.remove();
      openDialogs = openDialogs.filter(function (entry) { return entry !== handle; });
      document.removeEventListener("keydown", onKeydown, true);
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
      if (typeof options.onClose === "function") options.onClose(value);
    }

    function onKeydown(event) {
      if (openDialogs[openDialogs.length - 1] !== handle) return;

      if (event.key === "Escape") {
        event.preventDefault();
        finish(null);
        return;
      }
      if (event.key !== "Tab") return;

      var stops = Array.from(dialog.querySelectorAll(FOCUSABLE));
      if (!stops.length) return;
      var first = stops[0];
      var last = stops[stops.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    closeBtn.addEventListener("click", function () { finish(null); });
    backdrop.addEventListener("pointerdown", function (event) {
      /* Clicking the grey surround is a deliberate "never mind". */
      if (event.target === backdrop) finish(null);
    });

    var handle = { close: function () { finish(null); } };
    openDialogs.push(handle);
    document.body.appendChild(backdrop);
    document.addEventListener("keydown", onKeydown, true);

    (defaultButton || dialog.querySelector(FOCUSABLE)).focus();
    CS95.announce((options.title || "Message") + ". " +
      (options.heading || (Array.isArray(options.message) ? options.message[0] : options.message) || ""));

    return handle;
  }

  /* ------------------------------------------------------- conveniences - */

  var dialogs = {
    show: show,

    alert: function (title, message, kind) {
      return show({
        title: title,
        message: message,
        kind: kind || "info",
        buttons: [{ label: "OK", value: "ok", isDefault: true }]
      });
    },

    confirm: function (options) {
      return show({
        title: options.title,
        heading: options.heading,
        message: options.message,
        kind: options.kind || "caution",
        buttons: [
          { label: options.confirmLabel || "Yes, go ahead", value: true, isDefault: true, variant: options.destructive ? "danger" : null },
          { label: options.cancelLabel || "No, take me back", value: false }
        ],
        onClose: options.onClose
      });
    },

    /**
     * The honest "this part is not built yet" box.
     * It says exactly what the module will do and when it arrives, rather than
     * pretending to be a working feature.
     */
    notInstalled: function (config) {
      var body = el("div", { class: "install-sheet" }, [
        el("p", { html:
          "<strong>" + CS95.esc(config.name) + "</strong> is part of Ageless AI, " +
          "but it has not been installed on this disk yet." }),
        el("div", { class: "groupbox" }, [
          el("h3", { class: "groupbox-title", text: "What this program will do" }),
          el("p", { text: config.does })
        ]),
        el("p", { html: "<strong>Arrives in:</strong> " + CS95.esc(config.eta) }),
        el("div", { class: "meter", role: "img", "aria-label": "Build progress: " + config.progress + " per cent" }, [
          el("i", { style: "width:" + config.progress + "%" })
        ]),
        el("p", { text: "Nothing is broken and you have not done anything wrong. " +
                        "Everything else on this desktop works today." })
      ]);

      return show({
        title: config.name,
        kind: "info",
        body: body,
        buttons: config.buttons || [{ label: "OK, take me back", value: "ok", isDefault: true }],
        onClose: config.onClose
      });
    }
  };

  CS95.dialogs = dialogs;
})();
