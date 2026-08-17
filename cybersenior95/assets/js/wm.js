/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   wm.js — the window manager
   ----------------------------------------------------------------------------
   Real windows: draggable, resizable, focusable, minimisable, maximisable,
   and fully operable from the keyboard alone. Windows are non-modal <section>
   landmarks labelled by their own title, so a screen reader user can jump
   between them with the regions rotor exactly as a mouse user clicks between
   them on screen.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});
  var el = CS95.el;

  var MIN_W = 320;
  var MIN_H = 220;
  var CASCADE_STEP = 34;

  var wm = {
    windows: new Map(),   // id -> record
    order: [],            // window ids, back to front
    zTop: 100,
    activeId: null,
    cascade: 0
  };

  /* ------------------------------------------------------------- helpers */

  function layer() { return document.getElementById("window-layer"); }
  function bounds() {
    var host = document.getElementById("desktop");
    return host
      ? { w: host.clientWidth, h: host.clientHeight }
      : { w: window.innerWidth, h: window.innerHeight };
  }
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  /* -------------------------------------------------------- title chrome */

  function titleGlyph(kind) {
    var glyphs = {
      close:
        '<svg viewBox="0 0 10 10" width="12" height="12" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
        '<path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" stroke-width="2"/></svg>',
      minimize:
        '<svg viewBox="0 0 10 10" width="12" height="12" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
        '<rect x="1" y="7" width="8" height="2" fill="currentColor"/></svg>',
      maximize:
        '<svg viewBox="0 0 10 10" width="12" height="12" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
        '<rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<rect x="1" y="1" width="8" height="2.5" fill="currentColor"/></svg>',
      restore:
        '<svg viewBox="0 0 10 10" width="12" height="12" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
        '<rect x="1" y="3" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
        '<path d="M3 3 L3 1 L9 1 L9 7 L7 7" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
    };
    return glyphs[kind] || "";
  }

  /* ----------------------------------------------------------- open/close */

  /**
   * Open (or re-focus) a window.
   *
   * @param {object} spec
   *   id        {string}  unique key; opening the same id twice just focuses it
   *   title     {string}  plain-language window title
   *   icon      {string}  CS95.icon name for the title bar
   *   width     {number}  preferred width in CSS pixels
   *   height    {number}  preferred height in CSS pixels
   *   x, y      {number}  optional position; omit to cascade
   *   body      {Node}    the window contents
   *   bodyClass {string}  extra classes for .window-body
   *   footer    {Node}    optional always-visible action bar
   *   status    {array}   optional array of status-bar strings
   *   resizable {boolean} default true
   *   onFocus   {function(record)}
   *   onClose   {function(record)}
   */
  wm.open = function (spec) {
    var existing = wm.windows.get(spec.id);
    if (existing) {
      wm.restore(spec.id);
      wm.focus(spec.id);
      return existing;
    }

    var box = bounds();
    var width = Math.min(spec.width || 760, Math.max(MIN_W, box.w - 24));
    var height = Math.min(spec.height || 520, Math.max(MIN_H, box.h - 24));

    var x = spec.x;
    var y = spec.y;
    if (typeof x !== "number" || typeof y !== "number") {
      var offset = (wm.cascade % 6) * CASCADE_STEP;
      wm.cascade += 1;
      x = clamp(24 + offset, 0, Math.max(0, box.w - width));
      y = clamp(16 + offset, 0, Math.max(0, box.h - height));
    }
    x = clamp(x, 0, Math.max(0, box.w - width));
    y = clamp(y, 0, Math.max(0, box.h - height));

    var titleId = "win-title-" + spec.id;

    var minimizeBtn = el("button", {
      type: "button",
      class: "title-btn",
      html: titleGlyph("minimize"),
      "aria-label": "Minimise the " + spec.title + " window to the taskbar"
    });
    var maximizeBtn = el("button", {
      type: "button",
      class: "title-btn",
      html: titleGlyph("maximize"),
      "aria-label": "Make the " + spec.title + " window fill the screen"
    });
    var closeBtn = el("button", {
      type: "button",
      class: "title-btn",
      html: titleGlyph("close"),
      "aria-label": "Close the " + spec.title + " window"
    });

    var titleText = el("h2", { class: "title-bar-text", id: titleId, text: spec.title });

    var titleBar = el("div", {
      class: "title-bar",
      tabindex: "0",
      role: "group",
      "aria-label": spec.title + " window title bar. Use the arrow keys to move this window."
    }, [
      spec.icon
        ? el("span", { class: "title-bar-icon", "aria-hidden": "true", html: CS95.icon(spec.icon, 22) })
        : null,
      titleText,
      el("div", { class: "title-bar-controls" }, [minimizeBtn, maximizeBtn, closeBtn])
    ]);

    var body = el("div", {
      class: "window-body" + (spec.bodyClass ? " " + spec.bodyClass : ""),
      id: "win-body-" + spec.id
    });
    if (spec.body) body.appendChild(spec.body);

    var parts = [titleBar, body];
    if (spec.footer) parts.push(spec.footer);

    if (spec.status && spec.status.length) {
      parts.push(
        el("div", { class: "status-bar" }, spec.status.map(function (text) {
          return el("span", { class: "status-field", text: text });
        }))
      );
    }

    var resizable = spec.resizable !== false;
    var grip = null;
    if (resizable) {
      grip = el("button", {
        type: "button",
        class: "resize-grip",
        "aria-label": "Resize the " + spec.title + " window. Use the arrow keys after focusing this handle."
      });
      parts.push(grip);
    }

    var node = el("section", {
      class: "window",
      id: "win-" + spec.id,
      "aria-labelledby": titleId,
      dataset: { winId: spec.id }
    }, parts);

    node.style.left = x + "px";
    node.style.top = y + "px";
    node.style.width = width + "px";
    node.style.height = height + "px";

    var record = {
      id: spec.id,
      title: spec.title,
      icon: spec.icon || "computer",
      node: node,
      titleBar: titleBar,
      titleText: titleText,
      body: body,
      maximizeBtn: maximizeBtn,
      minimized: false,
      maximized: false,
      saved: null,
      spec: spec
    };

    /* --- wiring --- */
    closeBtn.addEventListener("click", function () { wm.close(spec.id); });
    minimizeBtn.addEventListener("click", function () { wm.minimize(spec.id); });
    maximizeBtn.addEventListener("click", function () { wm.toggleMaximize(spec.id); });

    node.addEventListener("pointerdown", function () { wm.focus(spec.id); }, true);
    node.addEventListener("focusin", function () { wm.focus(spec.id); });

    attachDrag(record, titleBar);
    attachTitleKeys(record, titleBar);
    if (grip) attachResize(record, grip);

    layer().appendChild(node);
    wm.windows.set(spec.id, record);
    wm.order.push(spec.id);
    wm.focus(spec.id);
    wm.syncChrome();

    CS95.announce(spec.title + " window opened.");

    /* Land the keyboard somewhere useful inside the new window. */
    var firstControl = body.querySelector(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (firstControl || titleBar).focus();

    if (typeof spec.onOpen === "function") spec.onOpen(record);
    return record;
  };

  wm.close = function (id) {
    var record = wm.windows.get(id);
    if (!record) return;
    if (typeof record.spec.onClose === "function" && record.spec.onClose(record) === false) return;

    record.node.remove();
    wm.windows.delete(id);
    wm.order = wm.order.filter(function (entry) { return entry !== id; });

    CS95.announce(record.title + " window closed.");

    if (wm.activeId === id) {
      wm.activeId = null;
      var next = wm.order.filter(function (entry) {
        var candidate = wm.windows.get(entry);
        return candidate && !candidate.minimized;
      }).pop();
      if (next) wm.focus(next);
      else {
        var firstIcon = document.querySelector(".desktop-icon");
        if (firstIcon) firstIcon.focus();
      }
    }
    wm.syncChrome();
  };

  wm.closeAll = function () {
    Array.from(wm.windows.keys()).forEach(function (id) { wm.close(id); });
  };

  wm.get = function (id) { return wm.windows.get(id); };
  wm.isOpen = function (id) { return wm.windows.has(id); };
  wm.list = function () {
    return wm.order.map(function (id) { return wm.windows.get(id); }).filter(Boolean);
  };

  /* ------------------------------------------------------------ focusing */

  wm.focus = function (id) {
    var record = wm.windows.get(id);
    if (!record) return;
    if (wm.activeId === id && record.node.style.zIndex) return;

    wm.zTop += 1;
    record.node.style.zIndex = String(wm.zTop);
    wm.order = wm.order.filter(function (entry) { return entry !== id; });
    wm.order.push(id);
    wm.activeId = id;

    wm.windows.forEach(function (other) {
      other.titleBar.classList.toggle("title-bar--inactive", other.id !== id);
    });
    wm.syncChrome();
    if (typeof record.spec.onFocus === "function") record.spec.onFocus(record);
  };

  /** Move focus to the next window in the stack (Ctrl+Tab). */
  wm.cycle = function () {
    var open = wm.list().filter(function (record) { return !record.minimized; });
    if (open.length < 2) return;
    var target = open[0];
    wm.focus(target.id);
    target.titleBar.focus();
    CS95.announce("Now on the " + target.title + " window.");
  };

  /* ------------------------------------------------- minimise / maximise */

  wm.minimize = function (id) {
    var record = wm.windows.get(id);
    if (!record || record.minimized) return;
    record.minimized = true;
    record.node.dataset.minimized = "true";
    CS95.announce(record.title + " minimised. Its button is on the taskbar at the bottom of the screen.");

    var next = wm.list().filter(function (other) { return !other.minimized; }).pop();
    if (next) wm.focus(next.id);
    else {
      wm.activeId = null;
      var button = document.querySelector('.task-btn[data-win-id="' + id + '"]');
      if (button) button.focus();
    }
    wm.syncChrome();
  };

  wm.restore = function (id) {
    var record = wm.windows.get(id);
    if (!record || !record.minimized) return;
    record.minimized = false;
    delete record.node.dataset.minimized;
    wm.focus(id);
    record.titleBar.focus();
    CS95.announce(record.title + " restored.");
    wm.syncChrome();
  };

  wm.toggleMinimize = function (id) {
    var record = wm.windows.get(id);
    if (!record) return;
    if (record.minimized) wm.restore(id);
    else if (wm.activeId === id) wm.minimize(id);
    else { wm.focus(id); record.titleBar.focus(); }
  };

  wm.toggleMaximize = function (id) {
    var record = wm.windows.get(id);
    if (!record) return;
    var box = bounds();

    if (record.maximized) {
      var saved = record.saved || { left: "40px", top: "40px", width: "760px", height: "520px" };
      record.node.style.left = saved.left;
      record.node.style.top = saved.top;
      record.node.style.width = saved.width;
      record.node.style.height = saved.height;
      record.maximized = false;
      delete record.node.dataset.maximized;
      record.maximizeBtn.innerHTML = titleGlyph("maximize");
      record.maximizeBtn.setAttribute("aria-label", "Make the " + record.title + " window fill the screen");
      CS95.announce(record.title + " returned to its earlier size.");
    } else {
      record.saved = {
        left: record.node.style.left,
        top: record.node.style.top,
        width: record.node.style.width,
        height: record.node.style.height
      };
      record.node.style.left = "0px";
      record.node.style.top = "0px";
      record.node.style.width = box.w + "px";
      record.node.style.height = box.h + "px";
      record.maximized = true;
      record.node.dataset.maximized = "true";
      record.maximizeBtn.innerHTML = titleGlyph("restore");
      record.maximizeBtn.setAttribute("aria-label", "Shrink the " + record.title + " window back down");
      CS95.announce(record.title + " now fills the screen.");
    }
    wm.focus(id);
  };

  wm.tile = function () {
    var open = wm.list().filter(function (record) { return !record.minimized; });
    if (!open.length) return;
    var box = bounds();
    var cols = Math.ceil(Math.sqrt(open.length));
    var rows = Math.ceil(open.length / cols);
    var cellW = Math.max(MIN_W, Math.floor(box.w / cols));
    var cellH = Math.max(MIN_H, Math.floor(box.h / rows));

    open.forEach(function (record, index) {
      if (record.maximized) wm.toggleMaximize(record.id);
      var col = index % cols;
      var row = Math.floor(index / cols);
      record.node.style.left = clamp(col * cellW, 0, Math.max(0, box.w - cellW)) + "px";
      record.node.style.top = clamp(row * cellH, 0, Math.max(0, box.h - cellH)) + "px";
      record.node.style.width = cellW + "px";
      record.node.style.height = cellH + "px";
    });
    CS95.announce("Windows arranged side by side.");
  };

  /* ---------------------------------------------------------- title text */

  wm.setTitle = function (id, title) {
    var record = wm.windows.get(id);
    if (!record) return;
    record.title = title;
    record.titleText.textContent = title;
    wm.syncChrome();
  };

  /** Swap a window's contents in place, keeping its position and size. */
  wm.setBody = function (id, node) {
    var record = wm.windows.get(id);
    if (!record) return;
    record.body.replaceChildren(node);
    record.body.scrollTop = 0;
  };

  /* --------------------------------------------------------- dragging --- */

  function attachDrag(record, handle) {
    var drag = null;

    handle.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      if (event.target.closest(".title-bar-controls")) return;
      if (record.maximized) return;

      var rect = record.node.getBoundingClientRect();
      var host = document.getElementById("desktop").getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        dx: event.clientX - rect.left,
        dy: event.clientY - rect.top,
        hostLeft: host.left,
        hostTop: host.top
      };
      handle.setPointerCapture(event.pointerId);
      wm.focus(record.id);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", function (event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      var box = bounds();
      var w = record.node.offsetWidth;
      var h = record.node.offsetHeight;
      record.node.style.left = clamp(event.clientX - drag.hostLeft - drag.dx, 0, Math.max(0, box.w - w)) + "px";
      record.node.style.top = clamp(event.clientY - drag.hostTop - drag.dy, 0, Math.max(0, box.h - h)) + "px";
    });

    function endDrag(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      try { handle.releasePointerCapture(event.pointerId); } catch (err) { /* already gone */ }
      drag = null;
    }
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);

    /* Double-clicking the title bar zooms, as it always has. */
    handle.addEventListener("dblclick", function (event) {
      if (event.target.closest(".title-bar-controls")) return;
      wm.toggleMaximize(record.id);
    });
  }

  /* Keyboard equivalents so a window can be moved without a mouse. */
  function attachTitleKeys(record, handle) {
    handle.addEventListener("keydown", function (event) {
      var step = event.shiftKey ? 48 : 12;
      var box = bounds();
      var left = parseInt(record.node.style.left, 10) || 0;
      var top = parseInt(record.node.style.top, 10) || 0;
      var w = record.node.offsetWidth;
      var h = record.node.offsetHeight;
      var moved = true;

      switch (event.key) {
        case "ArrowLeft":  left -= step; break;
        case "ArrowRight": left += step; break;
        case "ArrowUp":    top -= step; break;
        case "ArrowDown":  top += step; break;
        case "Home":       left = 0; top = 0; break;
        case "Enter":
        case " ":
          wm.toggleMaximize(record.id);
          event.preventDefault();
          return;
        default:
          moved = false;
      }
      if (!moved) return;
      if (record.maximized) return;

      event.preventDefault();
      record.node.style.left = clamp(left, 0, Math.max(0, box.w - w)) + "px";
      record.node.style.top = clamp(top, 0, Math.max(0, box.h - h)) + "px";
    });
  }

  /* --------------------------------------------------------- resizing --- */

  function attachResize(record, grip) {
    var resize = null;

    grip.addEventListener("pointerdown", function (event) {
      if (record.maximized) return;
      var rect = record.node.getBoundingClientRect();
      resize = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, w: rect.width, h: rect.height };
      grip.setPointerCapture(event.pointerId);
      wm.focus(record.id);
      event.preventDefault();
    });

    grip.addEventListener("pointermove", function (event) {
      if (!resize || event.pointerId !== resize.pointerId) return;
      var box = bounds();
      var left = parseInt(record.node.style.left, 10) || 0;
      var top = parseInt(record.node.style.top, 10) || 0;
      record.node.style.width  = clamp(resize.w + (event.clientX - resize.startX), MIN_W, box.w - left) + "px";
      record.node.style.height = clamp(resize.h + (event.clientY - resize.startY), MIN_H, box.h - top) + "px";
    });

    function endResize(event) {
      if (!resize || event.pointerId !== resize.pointerId) return;
      try { grip.releasePointerCapture(event.pointerId); } catch (err) { /* already gone */ }
      resize = null;
    }
    grip.addEventListener("pointerup", endResize);
    grip.addEventListener("pointercancel", endResize);

    grip.addEventListener("keydown", function (event) {
      var step = event.shiftKey ? 48 : 16;
      var box = bounds();
      var left = parseInt(record.node.style.left, 10) || 0;
      var top = parseInt(record.node.style.top, 10) || 0;
      var w = record.node.offsetWidth;
      var h = record.node.offsetHeight;
      var changed = true;

      switch (event.key) {
        case "ArrowLeft":  w -= step; break;
        case "ArrowRight": w += step; break;
        case "ArrowUp":    h -= step; break;
        case "ArrowDown":  h += step; break;
        default: changed = false;
      }
      if (!changed || record.maximized) return;
      event.preventDefault();
      record.node.style.width  = clamp(w, MIN_W, box.w - left) + "px";
      record.node.style.height = clamp(h, MIN_H, box.h - top) + "px";
    });
  }

  /* --------------------------------------------------- taskbar + chrome - */

  wm.syncChrome = function () {
    var list = document.getElementById("tasklist");
    if (list) {
      list.replaceChildren();
      wm.list().forEach(function (record) {
        var button = el("button", {
          type: "button",
          class: "btn task-btn",
          dataset: { winId: record.id },
          "aria-pressed": String(wm.activeId === record.id && !record.minimized),
          onclick: function () { wm.toggleMinimize(record.id); }
        }, [
          el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon(record.icon, 20) }),
          el("span", { text: record.title + (record.minimized ? " (minimised)" : "") })
        ]);
        list.appendChild(el("li", null, button));
      });
    }
    document.dispatchEvent(new CustomEvent("cs95:windowschange"));
  };

  /* Keep every window inside the desktop when the browser is resized. */
  window.addEventListener("resize", function () {
    var box = bounds();
    wm.windows.forEach(function (record) {
      if (record.maximized) {
        record.node.style.width = box.w + "px";
        record.node.style.height = box.h + "px";
        return;
      }
      var w = Math.min(record.node.offsetWidth, box.w);
      var h = Math.min(record.node.offsetHeight, box.h);
      record.node.style.width = w + "px";
      record.node.style.height = h + "px";
      record.node.style.left = clamp(parseInt(record.node.style.left, 10) || 0, 0, Math.max(0, box.w - w)) + "px";
      record.node.style.top = clamp(parseInt(record.node.style.top, 10) || 0, 0, Math.max(0, box.h - h)) + "px";
    });
  });

  CS95.wm = wm;
})();
