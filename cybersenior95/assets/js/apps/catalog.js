/* ============================================================================
   AGELESS AI  ·  CyberSenior 95
   apps/catalog.js — "Course Catalog File Finder"
   ----------------------------------------------------------------------------
   A retro file browser. Shelves are directories; courses are folders.
   Opening works three ways, all of them explicit and all of them equal:
     · a single click on the folder,
     · a double click on the folder,
     · Enter or Space on a focused folder.
   The visible "Click to open" plate on every folder means the interaction is
   never something you have to already know.
   ========================================================================= */
(function () {
  "use strict";

  var CS95 = (window.CS95 = window.CS95 || {});
  var el = CS95.el;
  var WIN_ID = "catalog";

  var view = { shelf: null, courseId: null };

  /* ------------------------------------------------------------ toolbar - */

  function toolbar() {
    var path = "C:\\AGELESS\\COURSES";
    if (view.shelf) path += "\\" + view.shelf.toUpperCase().replace(/ /g, "_");
    if (view.courseId) path += "\\" + view.courseId.toUpperCase() + ".CRS";

    var upDisabled = !view.shelf && !view.courseId;

    return el("div", { class: "finder-toolbar" }, [
      el("button", {
        type: "button",
        class: "btn",
        disabled: upDisabled,
        onclick: goUp
      }, [
        el("span", { "aria-hidden": "true", text: "▲" }),
        el("span", { text: "Up One Level" })
      ]),
      el("button", {
        type: "button",
        class: "btn",
        disabled: upDisabled,
        onclick: function () { view = { shelf: null, courseId: null }; render(); }
      }, "All Shelves"),
      el("span", { class: "finder-path", role: "status", "aria-label": "Current folder", text: path })
    ]);
  }

  function goUp() {
    if (view.courseId) view.courseId = null;
    else if (view.shelf) view.shelf = null;
    render();
  }

  /* ------------------------------------------------------------ folders - */

  function folderButton(config) {
    /* A double click fires click twice; the guard makes both gestures identical
       so nobody has to remember which one this catalog wants. */
    var opening = false;
    function open() {
      if (opening) return;
      opening = true;
      window.setTimeout(function () { opening = false; }, 400);
      config.onOpen();
    }

    return el("button", {
      type: "button",
      class: "folder",
      onclick: open
    }, [
      el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon(config.icon, 48) }),
      el("span", { class: "folder-name", text: config.name }),
      el("span", { class: "folder-meta", text: config.meta }),
      el("span", { class: "folder-open-hint", "aria-hidden": "true", text: "Click to open" })
    ]);
  }

  function shelvesView() {
    var grid = el("div", { class: "folder-grid", role: "list", "aria-label": "Course shelves" });

    CS95.shelves.forEach(function (shelf) {
      var inShelf = CS95.courses.filter(function (course) { return course.shelf === shelf; });
      grid.appendChild(el("div", { role: "listitem" }, folderButton({
        icon: "folder",
        name: shelf,
        meta: inShelf.length + (inShelf.length === 1 ? " course" : " courses"),
        onOpen: function () { view = { shelf: shelf, courseId: null }; render(); }
      })));
    });

    return grid;
  }

  function coursesView(shelf) {
    var grid = el("div", { class: "folder-grid", role: "list", "aria-label": "Courses on the " + shelf + " shelf" });

    CS95.courses.filter(function (course) { return course.shelf === shelf; })
      .forEach(function (course) {
        grid.appendChild(el("div", { role: "listitem" }, folderButton({
          icon: course.icon,
          name: course.name,
          meta: course.lessons.length + " lessons · " + CS95.courseMinutes(course) + " min",
          onOpen: function () { view = { shelf: shelf, courseId: course.id }; render(); }
        })));
      });

    return grid;
  }

  /* ------------------------------------------------------ course detail - */

  function courseView(course) {
    var lessons = el("ol", { class: "lesson-list" }, course.lessons.map(function (lesson, index) {
      return el("li", { class: "lesson-row" }, [
        el("span", { class: "lesson-num", "aria-hidden": "true", text: String(index + 1) }),
        el("span", { class: "lesson-title", text: lesson.title }),
        el("span", { class: "lesson-time", text: lesson.minutes + " min" })
      ]);
    }));

    var outcomes = el("ul", { class: "tick-list" }, course.outcomes.map(function (outcome) {
      return el("li", null, [
        el("span", { class: "tick", "aria-hidden": "true", text: "✓" }),
        el("span", { text: outcome })
      ]);
    }));

    return el("div", { class: "window-body" }, [
      el("div", { class: "course-detail" }, [
        el("div", { class: "course-detail-head" }, [
          el("span", { class: "icon-holder", "aria-hidden": "true", html: CS95.icon(course.icon, 56) }),
          el("div", null, [
            el("h2", { text: course.name }),
            el("p", { text: course.tagline }),
            el("div", { class: "badge-row" }, [
              el("span", { class: "badge", text: course.shelf }),
              el("span", { class: "badge", text: course.lessons.length + " lessons" }),
              el("span", { class: "badge", text: CS95.courseMinutes(course) + " minutes in total" }),
              course.priority ? el("span", { class: "badge badge--priority", text: "Start here" }) : null
            ])
          ])
        ]),

        el("p", { text: course.summary }),

        el("div", { class: "groupbox" }, [
          el("h3", { class: "groupbox-title", text: "By the end you will be able to" }),
          outcomes
        ]),

        el("div", { class: "groupbox" }, [
          el("h3", { class: "groupbox-title", text: "Lessons in this course" }),
          lessons
        ])
      ])
    ]);
  }

  /* ------------------------------------------------------------- render - */

  function render() {
    var record = CS95.wm.get(WIN_ID);
    if (!record) return;

    var course = view.courseId ? CS95.courseById(view.courseId) : null;
    var wrap = el("div", { class: "finder", tabindex: "-1", id: "finder-root" });
    wrap.appendChild(toolbar());

    if (course) {
      wrap.appendChild(courseView(course));
      CS95.wm.setTitle(WIN_ID, "Course Catalog — " + course.name);
      CS95.announce("Opened the course " + course.name + ", " + course.lessons.length + " lessons.");
    } else if (view.shelf) {
      wrap.appendChild(coursesView(view.shelf));
      CS95.wm.setTitle(WIN_ID, "Course Catalog — " + view.shelf);
      CS95.announce("Opened the " + view.shelf + " shelf.");
    } else {
      wrap.appendChild(shelvesView());
      CS95.wm.setTitle(WIN_ID, "Course Catalog");
      CS95.announce("Showing all course shelves.");
    }

    CS95.wm.setBody(WIN_ID, wrap);
    updateFooter(course);
    wrap.focus();
  }

  /* ------------------------------------------------------------- footer - */

  var footerRefs = {};

  function buildFooter() {
    var start = el("button", {
      type: "button",
      class: "btn btn--primary btn--go btn--default",
      text: "Start This Course",
      onclick: function () {
        var course = view.courseId ? CS95.courseById(view.courseId) : null;
        if (!course) return;
        CS95.dialogs.notInstalled({
          name: "Lesson Player",
          does:
            "Plays the lesson with the video on the left and the full written transcript on the " +
            "right, in whatever text size you have chosen. Volume and text size have their own " +
            "large buttons, and the lesson remembers where you stopped.",
          eta: "Step 2 of the build",
          progress: 0,
          buttons: [
            { label: "Read the lesson list instead", value: "list", isDefault: true },
            { label: "Close", value: null }
          ]
        });
      }
    });

    var back = el("button", {
      type: "button",
      class: "btn",
      text: "◀ Back",
      onclick: goUp
    });

    footerRefs = { start: start, back: back };

    return el("div", { class: "window-footer" }, [
      back,
      el("span", { class: "spacer" }),
      start,
      el("button", {
        type: "button",
        class: "btn",
        text: "Close",
        onclick: function () { CS95.wm.close(WIN_ID); }
      })
    ]);
  }

  function updateFooter(course) {
    if (!footerRefs.start) return;
    footerRefs.start.disabled = !course;
    footerRefs.back.disabled = !view.shelf && !view.courseId;
  }

  /* --------------------------------------------------------- public API - */

  CS95.apps = CS95.apps || {};

  CS95.apps.openCatalog = function () {
    if (CS95.wm.isOpen(WIN_ID)) {
      CS95.wm.restore(WIN_ID);
      CS95.wm.focus(WIN_ID);
      render();
      return;
    }
    CS95.wm.open({
      id: WIN_ID,
      title: "Course Catalog",
      icon: "folderOpen",
      width: 900,
      height: 640,
      bodyClass: "window-body--flush",
      footer: buildFooter(),
      status: [CS95.courses.length + " courses on this disk", "Read only"]
    });
    render();
  };

  CS95.apps.openCourse = function (courseId) {
    var course = CS95.courseById(courseId);
    if (!course) return;
    view = { shelf: course.shelf, courseId: course.id };
    CS95.apps.openCatalog();
  };
})();
