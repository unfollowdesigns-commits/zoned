# Fonts

## GT America (brand display face)

Licensed commercial type from Grilli Type. It is not bundled with this repo and
must not be: a copy obtained anywhere other than a purchased licence is pirated,
and serving it from the client's own domain is the version of that which gets
noticed.

Buy the **web** licence at https://www.grillitype.com/typeface/gt-america, then
drop the woff2 files here with exactly these names:

    GT-America-Standard-Regular.woff2
    GT-America-Standard-Medium.woff2
    GT-America-Standard-Bold.woff2

The `@font-face` rules in `src/app/globals.css` already point at these paths, so
nothing else needs changing. Every heading on the site switches over on the next
load.

Until then the site renders in Archivo, chosen because it is the same neo-
grotesque lineage with a comparable x-height and width, so the swap does not
reflow the layout.
