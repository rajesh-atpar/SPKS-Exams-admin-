import type { Metadata } from "next";
import { SiteCredit } from "@/components/site-credit";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPKS Exams Admin",
  description: "Admin panel for SPKS Exams",
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
          {children}
          <SiteCredit />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
