import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthcare Admin Job Tracker",
  description: "Track healthcare administration job applications by region.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Job Tracker",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}