import type { Metadata } from "next";
// import { Noto_Sans_JP, Noto_Serif_JP, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";

// // Japanese-friendly fonts
// const notoSansJP = Noto_Sans_JP({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
//   weight: ["400", "500", "700"],
//   display: "swap",
// });

// const notoSerifJP = Noto_Serif_JP({
//   variable: "--font-serif-jp",
//   subsets: ["latin"],
//   weight: ["400", "500", "700"],
//   display: "swap",
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// 使用本地 Geist Sans 字体
const geistSans = localFont({
  src: [
    {
      path: "./fonts/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Geist-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

// 使用本地 Geist Mono 字体
const geistMono = localFont({
  src: [
    {
      path: "./fonts/GeistMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeistMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/GeistMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deepwiki Open Source | Sheing Ng",
  description: "Created by Sheing Ng",
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // className={`${notoSansJP.variable} ${notoSerifJP.variable} ${geistMono.variable} antialiased`}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
