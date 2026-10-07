import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShaLi & Jonathan",
  description: "Share your moments",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang?: string }>;
}>) {
  const resolvedParams = await params;
  return (
    <html lang={resolvedParams?.lang || "es"} className="h-full antialiased">
      <body className="min-h-dvh w-full flex flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
