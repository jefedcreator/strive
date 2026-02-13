import { Provider } from "@/provider";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Strive | Connect Your Fitness",
  description: "Sync your fitness journey across platforms.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Provider>
          {children}
          <Toaster richColors position="top-center" closeButton />
        </Provider>
      </body>
    </html>
  );
}
