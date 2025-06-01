import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";
import Sidebar from "./components/Sidebar";
import { SearchBar } from "./components/SearchBar";
import { regular, medium } from "./fonts";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Cordinate",
  description: "Cordinate - Your AI-Powered Workflow Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${regular.variable} ${medium.variable} font-regular antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <div className="border-b bg-background">
                <div className="flex h-16 items-center px-4 gap-4">
                  <SearchBar className="flex-1 max-w-2xl" />
                  <ThemeToggle />
                </div>
              </div>
              <main className="flex-1 overflow-y-auto p-4">{children}</main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
