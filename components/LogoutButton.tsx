"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

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
        className="inline-flex cursor-pointer items-center gap-2 text-muted underline underline-offset-4 transition-colors hover:text-primary"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>

      {/* Confirmation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-white/10 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px]"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-base font-semibold text-primary">
              Log out
            </h2>
            <p className="mb-6 text-secondary">
              Are you sure you want to log out?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-medium text-primary transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 cursor-pointer rounded-lg bg-pink px-4 py-2 font-medium text-surface transition-all hover:bg-pink-light hover:shadow-lg hover:shadow-pink/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
