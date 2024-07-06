import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppNavBar } from "./nav-bar";
import { ThemeProvider } from "./theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "intermittence.dev",
  description: "A site managed by intermittence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppNavBar/>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
