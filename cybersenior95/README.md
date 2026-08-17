# CyberSenior 95 — the Ageless AI desktop

A retro operating-system shell for **Ageless AI**, a platform teaching AI literacy,
safety and productivity to adults aged 55 and over.

The 1995 look is not decoration. Skeuomorphic bevels, hard window frames and
explicit labels remove ambiguity for people who learned computing on machines
that worked exactly this way. Everything that looks pressable is pressable, and
nothing appears only when you hover.

---

## Running it

No build step, no dependencies. Either:

```bash
# open it directly
open index.html

# or serve it
npx http-server -p 8123
```

Then visit <http://127.0.0.1:8123/>.

---

## What is built (Step 1)

| Piece | State |
|---|---|
| Desktop shell, wallpaper, icon grid | done |
| Top menu bar (5 menus, click-to-open, full keyboard model) | done |
| Bottom taskbar with Start menu, window list and clock | done |
| Window manager — drag, resize, focus, minimise, maximise, tile | done |
| Modal dialog / alert system with focus trap | done |
| Welcome Guide — 5-panel installation wizard | done |
| Course Catalog File Finder — shelves, folders, course detail | done |
| Help book, keyboard reference, human-support card, About box | done |
| Accessibility preferences — 5 text sizes, high contrast, wallpaper | done |
| Startup splash and shut-down screen | done |

## What comes next

| Step | Modules |
|---|---|
| 2 | Lesson Player (split video / transcript, hardware-style volume and text controls) |
| 3 | AI Terminal (safe chat wrapper) and Scam Spotter (pop-up alert simulator) — both need the proxy backend |
| 4 | Student dashboard, progress tracking, My Certificates |
| 5 | Enterprise Desk, Control Panel and the spreadsheet-style Seat Manager |

Modules that are not built yet do **not** ship as dead icons. Opening one shows an
honest "not installed on this disk" sheet that states what the program will do and
which step it arrives in.

---

## Layout

```
cybersenior95/
  index.html                  the OS shell markup
  assets/css/
    system95.css              design tokens, bevels, buttons, inputs, tabs, cursors
    desktop.css               boot screen, menu bar, desktop, windows, taskbar
    apps.css                  per-application styles
  assets/js/
    prefs.js                  namespace, announcements, saved preferences
    icons.js                  hand-drawn pixel icon set
    wm.js                     window manager
    dialogs.js                modal message boxes
    menubar.js                menu bar and Start menu
    data/courses.js           the curriculum
    apps/welcome.js           the Welcome Disk wizard
    apps/catalog.js           the Course Catalog file finder
    apps/help.js              help, human support, About, System Information
    main.js                   startup, desktop icons, global keys, shut down
```

Plain scripts on a `window.CS95` namespace rather than ES modules, so the desktop
also runs from a double-clicked `index.html` with no server — fitting, for
software that imitates the era of the floppy disk.

---

## The design system

Colours are the genuine Windows 95 control palette.

| Token | Value | Used for |
|---|---|---|
| `--face` | `#c0c0c0` | control surfaces |
| `--face-light` | `#dfdfdf` | inner highlight |
| `--shadow` | `#808080` | inner shade |
| `--title-active-a/b` | `#000080` → `#1084d0` | active title bar |
| `--well` | `#ffffff` | text fields, list boxes |
| `--desktop-bg` | `#008080` | the wallpaper |

The bevel is the real four-line Windows 95 border, drawn as inset box-shadows so
it never consumes layout space and never blurs:

```css
box-shadow:
  inset -1px -1px 0 0 var(--dark),
  inset  1px  1px 0 0 var(--white),
  inset -2px -2px 0 0 var(--shadow),
  inset  2px  2px 0 0 var(--face-light);
```

Pressing a control swaps the light and dark pairs, so it visibly sinks into the
screen. Cursors are crisp-edged SVG redraws of the classic arrow, pointing hand
and move cross.

---

## The accessibility contract

Audited against WCAG 2.2 AA, with AAA contrast throughout.

- **Base text is 18px**, adjustable to 30px in five steps from a permanently
  visible `A−` / `A+` pair in the menu bar. Every size is in `rem`, so the whole
  interface grows together — including the desktop icon grid.
- **No grey body text anywhere.** Black on `#c0c0c0` is 11.6:1. White on the
  `#000080` title bar is 15.3:1. Disabled controls drop their accent colour so an
  engraved grey label is never left on green or red.
- **High contrast mode** switches the entire desktop to white-on-black with
  yellow focus rings, from one labelled button.
- **48px minimum** on every button, 60px on primary actions, 84px on the large
  "do this next" buttons.
- **Focus is doubled**: a 3px solid ring plus the classic dotted inset marker.
- **Full keyboard operation.** Arrow keys walk the desktop icons and move
  windows; `F1` opens help; `Ctrl+W` closes a window; `Ctrl+Tab` cycles them;
  `Alt +` / `Alt −` scale the text. Dialogs trap focus and restore it on close.
- **Nothing hidden behind hover.** Menus open on click and stay open. Every icon
  carries a visible "click to open" plate; every folder carries one too.
- **State is announced.** A polite live region reports every window open, close,
  minimise and text-size change.
- **Preferences persist** in `localStorage`, and degrade quietly to
  session-only when storage is blocked.

---

## Backend, when it arrives

The catalogue is already plain data in `assets/js/data/courses.js`, shaped so the
same object can be served unchanged by `GET /api/courses`. The planned surface:

| Route | Purpose |
|---|---|
| `POST /api/auth/session` | sign in, HTTP-only cookie |
| `GET  /api/courses` | catalogue |
| `GET  /api/progress` · `POST /api/progress` | lesson state |
| `POST /api/ai/chat` | **server-side proxy** to the model provider |
| `GET  /api/org/seats` · `POST /api/org/seats` | enterprise seat manager |
| `GET  /api/org/report.csv` | workforce completion metrics |

The AI route is a proxy on purpose: the API key lives in the server environment
and never reaches the browser, requests are rate-limited per seat, and a
pre-flight filter strips anything resembling a name, address, card number or
password before the request leaves the building. Model errors are rewritten into
plain, unalarming language before the terminal shows them.
