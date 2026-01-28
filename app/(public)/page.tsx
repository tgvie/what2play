import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "@/components/LogoutButton";
import Button from "@/components/Button";
import { PlusCircle, History, Gamepad2, LogIn, Link2 } from "lucide-react";
import Image from "next/image";

/**
 * HOME
 */
export default async function Home() {
  // Check if user is logged in (simple cookie check for UI purposes)
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("access_token")?.value;

  return (
    <div className="flex min-h-screen flex-col px-4">
      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-lg text-center">
          {/* Logo */}
          <Link href="/" className="mb-4 inline-block">
            <Image
              src="/img/what2play-text-logo.png"
              alt="what2play"
              width={280}
              height={60}
              priority
              className="mx-auto"
            />
          </Link>
          <p className="mb-12 text-lg text-secondary">
            Create polls, suggest games, and vote with your friends
          </p>

          {/* Nav Links */}
          <nav className="grid grid-cols-2 gap-4" aria-label="Main navigation">
            {/* Create Poll */}
            <Link
              href="/create"
              className="group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-lg transition-all hover:border-pink/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink/50"
            >
              <PlusCircle className="h-8 w-8 text-pink" />
              <span className="text-sm font-medium">Create Poll</span>
            </Link>

            {/* Poll History */}
            <Link
              href="/history"
              className="group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-lg transition-all hover:border-pink/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink/50"
            >
              <History className="h-8 w-8 text-pink" />
              <span className="text-sm font-medium">Poll History</span>
            </Link>

            {/* Explore Games */}
            <Link
              href="/explore"
              className="group col-span-2 flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-lg transition-all hover:border-pink/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink/50"
            >
              <Gamepad2 className="h-8 w-8 text-pink" />
              <span className="text-sm font-medium">Explore Games</span>
            </Link>
          </nav>

          {/* Login + Poll link hint */}
          <div className="mt-10 flex flex-col items-center gap-5">
            {isLoggedIn ? (
              <LogoutButton />
            ) : (
              <Button href="/login">
                <LogIn className="h-5 w-5" />
                <span>Log in</span>
              </Button>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted">
              <Link2 className="h-5 w-5" />
              <span>Have a poll link? Paste the link in your browser to join!</span>
            </div>
          </div>  
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-2 text-right text-xs text-muted/70">
        <p>© {new Date().getFullYear()} what2play</p>
      </footer>
    </div>
  );
}

