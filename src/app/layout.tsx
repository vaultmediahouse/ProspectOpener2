import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vault Media House | Verified business leads",
  description: "Curated, verified business leads for freelancers ready to do meaningful work.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://website.com"),
  alternates: { canonical: "/" },
  openGraph: { title: "Vault Media House | Verified business leads", description: "Curated, verified business leads for freelancers ready to do meaningful work.", type: "website", url: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
