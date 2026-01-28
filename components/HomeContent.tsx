"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, History, Gamepad2, LogIn, Link2, X } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Button from "./Button";

interface HomeContentProps {
  isLoggedIn: boolean;
}

// Main home content with slide-out login section
export default function HomeContent({ isLoggedIn }: HomeContentProps) {
  const router = useRouter();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Form state
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (data.message && !data.user) {
        setMessage(data.message);
        return;
      }

      handleClose();
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup(!isSignup);
    setError("");
    setMessage("");
  }

  function handleClose() {
    setIsPanelOpen(false);
    setUsername("");
    setPassword("");
    setError("");
    setMessage("");
    setIsSignup(false);
  }

  return (
    <div className="flex min-h-screen flex-col px-4">
      <main className="flex flex-1 items-center justify-center">
        {/* Flex container for main content + login panel */}
        <div className="flex items-center gap-0">
          {/* Main content */}
          <div className="w-full max-w-lg text-center transition-all duration-300">
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
              <Link
                href="/create"
                className="group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-lg transition-all hover:border-pink/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink/50"
              >
                <PlusCircle className="h-8 w-8 text-pink" />
                <span className="text-sm font-medium">Create Poll</span>
              </Link>

              <Link
                href="/history"
                className="group flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-lg transition-all hover:border-pink/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink/50"
              >
                <History className="h-8 w-8 text-pink" />
                <span className="text-sm font-medium">Poll History</span>
              </Link>

              <Link
                href="/explore"
                className="group col-span-2 flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-lg transition-all hover:border-pink/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-pink/50"
              >
                <Gamepad2 className="h-8 w-8 text-pink" />
                <span className="text-sm font-medium">Explore Games</span>
              </Link>
            </nav>

            {/* Login button / Logout */}
            <div className="mt-10 flex flex-col items-center gap-5">
              {isLoggedIn ? (
                <LogoutButton />
              ) : (
                <Button
                  onClick={() => setIsPanelOpen(true)}
                  disabled={isPanelOpen}
                  className={isPanelOpen ? "opacity-50" : "cursor-pointer"}
                >
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

          {/* Divider + Login Panel */}
          <div
            className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
              isPanelOpen ? "ml-8 mt-3 w-96 opacity-100" : "ml-0 w-0 opacity-0"
            }`}
          >
            {/* Vertical divider */}
            <div className="h-[380px] border-l border-dashed border-white/20" />

            {/* Login form - aligned with tagline */}
            <div className="flex w-96 flex-col pl-8">
              {/* Header - outside the card */}
              <div className="mb-4 flex w-full items-center justify-between">
                <h3 className="text-xl font-semibold text-secondary">
                  {isSignup ? "Create Account" : "Log In"}
                </h3>
                <button
                  onClick={handleClose}
                  className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:text-primary"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form card - matches left content height */}
              <div className="flex h-[240px] w-full flex-col rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                  <div className="mb-4">
                    <label htmlFor="username" className="mb-2 block text-sm font-medium text-secondary">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isSignup ? "Choose username" : "Your username"}
                      minLength={3}
                      maxLength={20}
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-primary placeholder-muted transition-colors focus:border-pink/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-secondary">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-primary placeholder-muted transition-colors focus:border-pink/50 focus:outline-none"
                    />
                  </div>

                  {error && (
                    <div className="mb-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="mb-2 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs text-green-400">
                      {message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="cursor-pointer mt-auto w-full rounded-lg! px-3! py-2! text-sm!"
                  >
                    {loading ? "..." : isSignup ? "Sign Up" : "Log In"}
                  </Button>
                </form>
              </div>

              {/* Toggle - outside the card */}
              <p className="mt-4 text-center text-sm text-muted">
                {isSignup ? "Have an account?" : "No account?"}{" "}
                <button onClick={toggleMode} className="cursor-pointer text-pink hover:underline">
                  {isSignup ? "Log in" : "Sign up"}
                </button>
              </p>
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
