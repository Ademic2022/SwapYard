import { ImageResponse } from "next/og";

import { BrandMark } from "@/components/BrandMark";

export const alt = "SwapYard: borrow, buy and trade with neighbors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The default preview when a SwapYard link without its own photo is shared.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f6f1e6",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -120, top: -120, width: 520, height: 520, borderRadius: 520, background: "#1e5f3f", display: "flex" }} />
        <div style={{ position: "absolute", right: 40, bottom: -190, width: 300, height: 300, borderRadius: 300, border: "36px solid #e9a23b", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <BrandMark size={72} />
          <div style={{ fontSize: 44, fontWeight: 700, color: "#123b28", display: "flex" }}>SwapYard</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: "#18211b", letterSpacing: -2, display: "flex", flexWrap: "wrap" }}>
            Borrow, buy and trade with the people next door.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#6d685c", display: "flex" }}>
            Tools, secondhand finds and skills near you. Chat on WhatsApp.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
