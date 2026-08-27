import type { Metadata, Viewport } from "next";
import { Arimo, JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/sidebar";

const arimo = Arimo({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YISS TrackPoint — Daily launchpad for Guardians",
  description:
    "A personal launchpad for Yongsan International School of Seoul: schedule, grades, Gmail, Drive, weather, air quality, sports, and campus feeds — all in one place.",
  applicationName: "YISS TrackPoint",
  keywords: [
    "YISS",
    "Yongsan International School",
    "dashboard",
    "Guardians",
    "TrackPoint",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e6" },
    { media: "(prefers-color-scheme: dark)", color: "#070e1c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${arimo.variable} ${poppins.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('yiss-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
