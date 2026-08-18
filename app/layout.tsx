import type { Metadata } from "next";
import { Quicksand, Work_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/frontend/components/shell/AppShell";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["600", "700"],
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Manraah — AI-Powered Mental Wellness Platform",
  description: "A retreat for mind and soul. Compassionate clarity bridging AI capabilities with soft human wellness care.",
  icons: {
    icon: "/logo/logo.svg",
    shortcut: "/logo/logo.svg",
    apple: "/logo/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quicksand.variable} ${workSans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background text-on-background antialiased font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
