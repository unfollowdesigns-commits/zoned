import { ImageResponse } from "next/og";
import { MARK_PARTS } from "@/components/Logo";

/**
 * The browser tab icon, drawn from the logo rather than from a separate file.
 *
 * WHY GENERATED AND NOT A .ICO. There was only `app/favicon.ico`, the Next
 * starter default, so every tab showed the framework's mark and not the
 * client's. Generating it here means the icon is the SAME geometry as the
 * header lockup and the preloader (see MARK_PARTS in components/Logo): change
 * the mark once and the tab, the lockup and the loading screen all follow. A
 * hand-exported PNG would have been a fourth copy to keep in step, and the one
 * nobody remembers.
 *
 * THE MONOGRAM ALONE, NOT THE LOCKUP. At 32 pixels the wordmark is four grey
 * smears; the two interlocking rings survive because they are shapes rather
 * than letterforms. The rule for a favicon is that it has to be recognisable
 * at the size it is actually rendered, which is smaller than anyone designs at.
 */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  /* Padded to 88% and centred: the mark's own box is tight to the artwork, and
     an icon that touches its edges reads as clipped in a browser tab. */
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080b16",
        }}
      >
        <svg width="46" height="52" viewBox={MARK_PARTS.viewBox}>
          <path d={MARK_PARTS.bracket} fill={MARK_PARTS.blue} />
          <path d={MARK_PARTS.blueRing} fillRule="evenodd" fill={MARK_PARTS.blue} />
          {/* White rather than currentColor: this always sits on the dark
              ground above, never on a page that could redefine the ink token. */}
          <path d={MARK_PARTS.inkRing} fillRule="evenodd" fill="#ffffff" />
        </svg>
      </div>
    ),
    size,
  );
}
