import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getA11yPrefs } from "@/lib/accessibility";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Estudia RD — Aprende a leer y crecer",
  description:
    "Plataforma educativa interactiva para niños, familias y escuelas de la República Dominicana.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f8b8d",
  width: "device-width",
  initialScale: 1,
};

// System font stack: no external font fetch, keeps the app fast on the
// low-bandwidth connections the product spec calls out.
const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const prefs = await getA11yPrefs();
  return (
    <html
      lang="es-DO"
      className="h-full antialiased"
      data-contrast={prefs.contrast}
      data-text-size={prefs.textSize}
      data-reduced-motion={prefs.reducedMotion}
      data-dyslexia={prefs.dyslexiaFont}
      style={{ fontFamily: fontStack }}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
