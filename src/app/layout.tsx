import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loopin - Client Portals for Freelancers",
  description: "Beautiful client portals for freelancers. Share project progress, deliverables, and updates — no client login required.",
  openGraph: {
    title: "Loopin - Client Portals for Freelancers",
    description: "Keep clients in the loop without the chaos. Beautiful project portals, shareable with a link.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
