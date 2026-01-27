"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <main className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-50">
            what2play
          </h1>
          <p className="mt-2 text-zinc-400">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Auth Form */}
        <form 
          onSubmit={handleSubmit}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm"
        >
          {/* Username input */}
          <div className="mb-4">
            <label 
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-zinc-300"
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
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
            {isSignup && (
              <p className="mt-1 text-xs text-zinc-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            )}
          </div>

          {/* Password input */}
          <div className="mb-6">
            <label 
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-300"
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
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
            {isSignup && (
              <p className="mt-1 text-xs text-zinc-500">
                At least 6 characters
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div 
              role="alert"
              className="mb-4 rounded-md border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Success message */}
          {message && (
            <div 
              role="status"
              className="mb-4 rounded-md border border-green-900 bg-green-950 px-4 py-3 text-sm text-green-400"
            >
              {message}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-50 px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isSignup ? "Create Account" : "Sign In")}
          </button>
        </form>

        {/* Toggle login/signup */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-zinc-50 underline underline-offset-4 hover:text-zinc-300"
          >
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>

        {/* Back to home link */}
        <p className="mt-4 text-center">
          <Link 
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
