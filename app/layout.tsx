import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "mapbox-gl/dist/mapbox-gl.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AhhHum | 気になる場所を、歩いて見つける。",
  description:
    "街の気配を見つけて、歩いて確かめ、発見を記録できるサービス。",
  generator: "v0.app",
  openGraph: {
    title: "AhhHum | 気になる場所を、歩いて見つける。",
    description:
      "街の気配を見つけて、歩いて確かめ、発見を記録できるサービス。",
    url: "https://ahhhum.com",
    type: "website",
    images: ["/ogp.jpg"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport = {
  themeColor: "#dfe3e7",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
