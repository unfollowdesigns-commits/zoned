import { headers } from "next/headers";

/** Server-rendered JSON-LD with the request's CSP nonce. `<` is escaped to keep the payload inert. */
export async function JsonLd({ data }: { data: unknown }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
