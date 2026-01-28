"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/Button";
import Logo from "@/components/Logo";

// Login/Signup page -> username + password only
export default function LoginPage() {
  const router = useRouter();

  // Form state
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handles form submission for login and signup
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = { username, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // Show success message if needed
      if (data.message && !data.user) {
        setMessage(data.message);
        return;
      }

      // Success - redirect to home page
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Toggles between login and signup modes
  function toggleMode() {
    setIsSignup(!isSignup);
    setError("");
    setMessage("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <Logo />
          <p className="text-lg text-secondary">
            {isSignup ? "Create your account" : "Log in to your account"}
          </p>
        </div>

        {/* Auth Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
        >
          {/* Username input */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-secondary"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isSignup ? "Choose a username" : "Enter your username"}
              minLength={3}
              maxLength={20}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-primary placeholder-muted transition-colors focus:border-pink/50 focus:outline-none focus:ring-2 focus:ring-pink/20"
            />
            {isSignup && (
              <p className="mt-1 text-xs text-muted">
                3-20 characters
              </p>
            )}
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-secondary"
            >
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
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-primary placeholder-muted transition-colors focus:border-pink/50 focus:outline-none focus:ring-2 focus:ring-pink/20"
            />
            {isSignup && (
              <p className="mt-1 text-xs text-muted">At least 6 characters</p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Success message */}
          {message && (
            <div
              role="status"
              className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400"
            >
              {message}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" disabled={loading} className="cursor-pointer w-full">
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
          </Button>
        </form>

        {/* Toggle login/signup */}
        <p className="mt-6 text-center text-sm text-secondary/80">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="cursor-pointer font-medium text-pink underline underline-offset-4 transition-colors hover:text-pink-light"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>

        {/* Back to home link */}
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
