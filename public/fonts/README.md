# Fonts

## Neue Haas Grotesk Display (brand display face)

Licensed commercial type from Monotype. It is not bundled with this repo and
must not be: a copy obtained anywhere other than a purchased licence is pirated,
and serving it from the client's own domain is the version of that which gets
noticed.

Buy the **web** licence (myfonts.com or fonts.com, publisher Monotype), then
drop the woff2 files here with exactly these names:

    NeueHaasGroteskDisplay-Roman.woff2
    NeueHaasGroteskDisplay-Medium.woff2
    NeueHaasGroteskDisplay-Bold.woff2

Then uncomment the `@font-face` block at the top of `src/app/globals.css`. It
is commented out on purpose: a declared family whose file is missing is
requested on every page, 404s, and fills the console with errors that hide real
ones later. Nothing else needs changing; every heading switches over on the
next load.

### Buy the Display cut, not Text

Neue Haas Grotesk ships as two optical sizes. Display is drawn for large
settings, with tighter default spacing and finer detail; Text is drawn for body
copy and looks loose and soft above about 40px. Everything this face is used
for on this site is 20px and up, so Display is the one to license. Buying Text
by mistake will look subtly wrong in a way that is hard to name.

### What renders until then

The stack in `--font-display` falls back in this order:

1. **Helvetica Neue**, present on every Apple device.
2. **Helvetica**, then **Arial**, metrically compatible on Windows.
3. **Archivo**, loaded from Google Fonts, for anything with none of the above.

Neue Haas Grotesk is Helvetica redrawn, so items 1 and 2 are close matches and
cost no download. Archivo is a neo-grotesque of comparable x-height and width,
so the layout does not reflow when the real face lands.

Once the licensed files are installed, Archivo becomes a candidate for removal
from the bundle. It is worth keeping only for Android and most Linux, which
have neither Helvetica nor Arial and would otherwise fall to a generic sans
that does visibly change the layout.

## Previously specified

The brand face was **GT America** (Grilli Type) before this. Nothing in the
repo still points at it. If it comes back, the same install path applies.
