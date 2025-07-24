import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "@/components/derived/Nav";
import ThemeProvider from "@/components/derived/ThemeProvider";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

import AuthProvider from "../components/derived/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "kevinhnguyen.com",
  description: "A personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavBar/>
          {children}
        </ThemeProvider>
        </AuthProvider>
        <Toaster/>
      </body>
    </html>
  );
}
