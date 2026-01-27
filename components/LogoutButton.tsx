"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Logout button with custom confirmation modal
export default function LogoutButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        setShowModal(false);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-zinc-400 underline underline-offset-4 hover:text-zinc-50"
      >
        Sign out
      </button>

      {/* Confirmation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold text-zinc-50">
              Sign out
            </h2>
            <p className="mb-6 text-zinc-400">
              Are you sure you want to sign out?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 rounded-md bg-zinc-50 px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
