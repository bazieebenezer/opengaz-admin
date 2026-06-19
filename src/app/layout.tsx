import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "OpenGaz Admin",
  description: "Système de gestion et validation OpenGaz",
  icons: {
    icon: "/admin-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50`}
      >
        {children}
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              color: '#1f2937',
              borderRadius: '0.5rem',
              boxShadow: 'none',
            },
            classNames: {
              toast: 'dark:!bg-gray-900 dark:!border-gray-800 dark:!text-gray-100',
              success: '!border-emerald-500 !text-emerald-700 dark:!text-emerald-400',
              error: '!border-red-500 !text-red-700 dark:!text-red-400',
              warning: '!border-orange-500 !text-orange-700 dark:!text-orange-400',
            },
          }}
        />
      </body>
    </html>
  );
}
