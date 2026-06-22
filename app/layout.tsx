import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";
import { DevSwCleanup } from "@/components/DevSwCleanup";
import { ThemeProvider } from "@/components/ThemeProvider";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "SaboArt",
  description: "Catálogo online SaboArt — sabonetes, sachês e sprays",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SaboArt",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const serverTheme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} h-full${serverTheme === "dark" ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider initialTheme={serverTheme ?? undefined}>
          <DevSwCleanup />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
