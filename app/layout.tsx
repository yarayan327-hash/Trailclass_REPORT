import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "51Talk Academy Certification System",
  description: "Professional Trial Lesson Evaluation System for Middle East Excellence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


