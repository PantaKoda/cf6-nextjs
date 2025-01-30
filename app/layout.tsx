"use client"
import "./globals.css";
import { Inter, Poppins } from "next/font/google";
import Navbar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});


export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <html lang="en">
            <body className={`${inter.className} ${poppins.variable} flex flex-col min-h-screen bg-gray-100`}>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col justify-center">{children}</main>
            <Footer />
            </body>
            </html>
        </SessionProvider>
    )
}
