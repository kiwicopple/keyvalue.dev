import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "keyvalue.dev - Simple Key-Value Storage",
  description: "Simple, fast, durable key-value storage for developers. Backed by AWS S3 Express One Zone.",
  keywords: ["key-value", "storage", "api", "s3", "database", "developer tools"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
