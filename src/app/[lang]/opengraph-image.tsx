import { ImageResponse } from "next/og";

export const alt = "ANOTE — návrh lékařské zprávy z nahraného rozhovoru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [{ lang: "cs" }, { lang: "en" }];
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const cs = lang !== "en";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0F172A 0%, #0F766E 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>ANOTE</div>
        <div style={{ fontSize: 48, fontWeight: 700, marginTop: 24, maxWidth: 1000 }}>
          {cs
            ? "Z rozhovoru s pacientem návrh lékařské zprávy"
            : "From the patient conversation to a draft medical report"}
        </div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#99F6E4" }}>
          {cs ? "Lékař zprávu vždy zkontroluje · anote.cz" : "The doctor always reviews it · anote.cz"}
        </div>
      </div>
    ),
    size,
  );
}
