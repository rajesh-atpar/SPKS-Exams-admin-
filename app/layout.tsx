import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { SiteCredit } from "@/components/site-credit";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPKS Admin",
  description: "Staff CMS for SPKS exam-prep courses, tests, and content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-svh bg-background text-foreground antialiased">
        <TooltipProvider>
          <Providers>
            {children}
            <SiteCredit />
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
