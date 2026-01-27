import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Gamepad2, Joystick, Dice5, Target, Trophy, Swords, Puzzle, Crown, Zap, Ghost } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "what2play",
  description: "Create polls, suggest games, and vote with your friends to decide what to play next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#09090b] text-[#e1ddf4]`}
      >
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,#514283_0%,transparent_50%)] opacity-20" />
        
        {/* Subtle gaming icons background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden text-white opacity-[0.015]" aria-hidden="true">
          <Gamepad2 className="absolute left-[5%] top-[10%] h-16 w-16" />
          <Joystick className="absolute right-[10%] top-[15%] h-14 w-14" />
          <Dice5 className="absolute left-[15%] top-[60%] h-12 w-12" />
          <Target className="absolute right-[8%] top-[70%] h-16 w-16" />
          <Trophy className="absolute left-[80%] top-[40%] h-14 w-14" />
          <Swords className="absolute left-[3%] top-[35%] h-14 w-14" />
          <Gamepad2 className="absolute right-[20%] top-[85%] h-12 w-12" />
          <Joystick className="absolute left-[40%] top-[5%] h-12 w-12" />
          <Dice5 className="absolute left-[60%] top-[90%] h-14 w-14" />
          <Puzzle className="absolute left-[25%] top-[25%] h-10 w-10" />
          <Crown className="absolute right-[25%] top-[50%] h-12 w-12" />
          <Zap className="absolute left-[70%] top-[20%] h-10 w-10" />
          <Ghost className="absolute right-[35%] top-[8%] h-12 w-12" />
          <Target className="absolute left-[50%] top-[75%] h-10 w-10" />
          <Trophy className="absolute left-[8%] top-[80%] h-12 w-12" />
          <Swords className="absolute right-[5%] top-[45%] h-10 w-10" />
        </div>
        
        {/* Page content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
