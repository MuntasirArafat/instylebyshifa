import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from './context/CartContext'
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'react-hot-toast';
import Providers from './component/Providers';
import ScrollToTop from './component/ScrollToTop';
import VisitorTracker from './component/VisitorTracker';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getDb } from "./lib/mongodb";

export const metadata = {
  title: "InstylebyShifa — Abaya & Kaftan Collection",
  description: "Shop premium Abaya, Kaftan and Borka collections at InstylebyShifa.",
};

async function getSettings() {
  try {
    const db = await getDb();
    return await db.collection("settings").findOne({ _id: "store" });
  } catch (e) {
    return null;
  }
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const scripts = settings?.customScripts || { header: "", footer: "" };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {scripts.header && (
        <script
          dangerouslySetInnerHTML={{
            __html: scripts.header.replace(/<\/?script>/g, ""),
          }}
        />
      )}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <CartProvider>
            <ScrollToTop />
            <VisitorTracker />
            <Toaster position="top-center" reverseOrder={false} />
            <NextTopLoader color="#000000" height={3} showSpinner={false} />
            {children}
            {scripts.footer && (
              <div
                dangerouslySetInnerHTML={{
                  __html: scripts.footer,
                }}
              />
            )}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
