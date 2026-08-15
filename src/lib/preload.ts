/**
 * The preloader's session key and its pre-paint script.
 *
 * This exists as its own module for one reason: the script has to run in the
 * server-rendered <head>, and the kit's `curtainPrePaint` lives in a
 * `"use client"` file, so calling it from a server component throws. Putting
 * the key and the snippet here keeps them shared by the layout and the
 * Preloader without either importing across the boundary.
 *
 * The script must stay inline and synchronous. An external or deferred script
 * runs after the first paint, which is exactly the flash the curtain exists to
 * prevent. It is a one-liner for the same reason.
 */

/** Bump the suffix to show the curtain again after a redesign. */
export const PRELOAD_KEY = "dp.loaded.v1";

export function prePaintScript(): string {
  return (
    `try{if(sessionStorage.getItem('${PRELOAD_KEY}')==='1'||` +
    `matchMedia('(prefers-reduced-motion: reduce)').matches){` +
    `document.documentElement.setAttribute('data-loaded','1')}}catch(e){}`
  );
}
